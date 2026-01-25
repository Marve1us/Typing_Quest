import { 
  profiles, sessions, badges,
  type Profile, type InsertProfile,
  type Session, type InsertSession,
  type Badge, type InsertBadge,
  BADGE_TYPES
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined>;

  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionsByProfile(profileId: string, limit?: number): Promise<Session[]>;
  getRecentSessions(profileId: string, days: number): Promise<Session[]>;

  // Badges
  getBadgesByProfile(profileId: string): Promise<Badge[]>;
  awardBadge(badge: InsertBadge): Promise<Badge>;
  hasBadge(profileId: string, badgeType: string): Promise<boolean>;

  // Stats
  getProfileStats(profileId: string): Promise<{
    totalSessions: number;
    avgWpm: number;
    avgAccuracy: number;
    totalMinutes: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile || undefined;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({
        ...insertProfile,
        level: 1,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        streakSavesRemaining: 1,
      })
      .returning();
    return profile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();
    return profile || undefined;
  }

  // Sessions
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    
    // Update profile XP and check for level up
    const profile = await this.getProfile(insertSession.profileId);
    if (profile) {
      const newXp = profile.xp + (insertSession.xpEarned || 0);
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Update streak
      const today = new Date().toISOString().split("T")[0];
      let newStreak = profile.currentStreak;
      let longestStreak = profile.longestStreak;
      
      if (profile.lastPracticeDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        
        if (profile.lastPracticeDate === yesterdayStr) {
          newStreak = profile.currentStreak + 1;
        } else if (profile.lastPracticeDate !== today) {
          newStreak = 1;
        }
        
        longestStreak = Math.max(longestStreak, newStreak);
      }
      
      await this.updateProfile(profile.id, {
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak,
        lastPracticeDate: today,
      });

      // Check and award badges
      await this.checkAndAwardBadges(profile.id, insertSession, newStreak);
    }
    
    return session;
  }

  async getSessionsByProfile(profileId: string, limit = 50): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .where(eq(sessions.profileId, profileId))
      .orderBy(desc(sessions.completedAt))
      .limit(limit);
  }

  async getRecentSessions(profileId: string, days: number): Promise<Session[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.profileId, profileId),
          gte(sessions.completedAt, startDate)
        )
      )
      .orderBy(desc(sessions.completedAt));
  }

  // Badges
  async getBadgesByProfile(profileId: string): Promise<Badge[]> {
    return db
      .select()
      .from(badges)
      .where(eq(badges.profileId, profileId))
      .orderBy(desc(badges.earnedAt));
  }

  async awardBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(insertBadge)
      .returning();
    return badge;
  }

  async hasBadge(profileId: string, badgeType: string): Promise<boolean> {
    const [badge] = await db
      .select()
      .from(badges)
      .where(
        and(
          eq(badges.profileId, profileId),
          eq(badges.badgeType, badgeType)
        )
      );
    return !!badge;
  }

  // Stats
  async getProfileStats(profileId: string): Promise<{
    totalSessions: number;
    avgWpm: number;
    avgAccuracy: number;
    totalMinutes: number;
  }> {
    const allSessions = await this.getSessionsByProfile(profileId, 1000);
    
    if (allSessions.length === 0) {
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalMinutes: 0,
      };
    }

    const totalSessions = allSessions.length;
    const avgWpm = Math.round(
      allSessions.reduce((acc, s) => acc + s.wpm, 0) / totalSessions
    );
    const avgAccuracy = Math.round(
      allSessions.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions
    );
    const totalMinutes = Math.round(
      allSessions.reduce((acc, s) => acc + s.durationSec, 0) / 60
    );

    return {
      totalSessions,
      avgWpm,
      avgAccuracy,
      totalMinutes,
    };
  }

  // Private helper to check and award badges
  private async checkAndAwardBadges(
    profileId: string, 
    session: InsertSession,
    currentStreak: number
  ): Promise<void> {
    const badgesToCheck = [
      // First session badge
      { type: BADGE_TYPES.FIRST_SESSION, condition: async () => {
        const sessions = await this.getSessionsByProfile(profileId, 2);
        return sessions.length === 1;
      }},
      // Speed badges
      { type: BADGE_TYPES.SPEED_DEMON_20, condition: async () => session.wpm >= 20 },
      { type: BADGE_TYPES.SPEED_DEMON_30, condition: async () => session.wpm >= 30 },
      // Accuracy badges
      { type: BADGE_TYPES.ACCURACY_STAR_90, condition: async () => session.accuracy >= 90 },
      { type: BADGE_TYPES.ACCURACY_STAR_95, condition: async () => session.accuracy >= 95 },
      // Streak badges
      { type: BADGE_TYPES.STREAK_3, condition: async () => currentStreak >= 3 },
      { type: BADGE_TYPES.STREAK_7, condition: async () => currentStreak >= 7 },
      { type: BADGE_TYPES.STREAK_14, condition: async () => currentStreak >= 14 },
      // Game-specific badges
      { type: BADGE_TYPES.HOME_ROW_HERO, condition: async () => 
        session.gameMode === "home_row_builder" && session.accuracy >= 95 
      },
      { type: BADGE_TYPES.RACE_CHAMPION, condition: async () => {
        if (session.gameMode !== "race_sprint") return false;
        const raceSessions = (await this.getSessionsByProfile(profileId, 1000))
          .filter(s => s.gameMode === "race_sprint");
        return raceSessions.length >= 10;
      }},
      { type: BADGE_TYPES.ALIEN_SLAYER, condition: async () => {
        if (session.gameMode !== "alien_defense") return false;
        const alienSessions = (await this.getSessionsByProfile(profileId, 1000))
          .filter(s => s.gameMode === "alien_defense");
        return alienSessions.length >= 10;
      }},
      { type: BADGE_TYPES.PRACTICE_PRO, condition: async () => {
        const allSessions = await this.getSessionsByProfile(profileId, 1000);
        return allSessions.length >= 20;
      }},
    ];

    for (const badge of badgesToCheck) {
      const hasBadge = await this.hasBadge(profileId, badge.type);
      if (!hasBadge) {
        const shouldAward = await badge.condition();
        if (shouldAward) {
          await this.awardBadge({ profileId, badgeType: badge.type });
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
