import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profiles table - stores player profiles (kids)
export const profiles = pgTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  nickname: text("nickname").notNull(),
  avatar: text("avatar").notNull().default("rocket"),
  theme: text("theme").notNull().default("space"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastPracticeDate: text("last_practice_date"),
  streakSavesRemaining: integer("streak_saves_remaining").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table - stores practice session results
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id", { length: 36 }).notNull().references(() => profiles.id),
  gameMode: text("game_mode").notNull(),
  wpm: real("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  durationSec: integer("duration_sec").notNull(),
  correctChars: integer("correct_chars").notNull().default(0),
  totalChars: integer("total_chars").notNull().default(0),
  errors: integer("errors").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Badges table - stores earned badges
export const badges = pgTable("badges", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id", { length: 36 }).notNull().references(() => profiles.id),
  badgeType: text("badge_type").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  sessions: many(sessions),
  badges: many(badges),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  profile: one(profiles, {
    fields: [sessions.profileId],
    references: [profiles.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  profile: one(profiles, {
    fields: [badges.profileId],
    references: [profiles.id],
  }),
}));

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  completedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  earnedAt: true,
});

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

// Badge types enum
export const BADGE_TYPES = {
  HOME_ROW_HERO: "home_row_hero",
  SPEED_DEMON_20: "speed_demon_20",
  SPEED_DEMON_30: "speed_demon_30",
  ACCURACY_STAR_90: "accuracy_star_90",
  ACCURACY_STAR_95: "accuracy_star_95",
  STREAK_3: "streak_3",
  STREAK_7: "streak_7",
  STREAK_14: "streak_14",
  FIRST_SESSION: "first_session",
  RACE_CHAMPION: "race_champion",
  ALIEN_SLAYER: "alien_slayer",
  PRACTICE_PRO: "practice_pro",
} as const;

export type BadgeType = typeof BADGE_TYPES[keyof typeof BADGE_TYPES];

// Game modes enum
export const GAME_MODES = {
  RACE_SPRINT: "race_sprint",
  ALIEN_DEFENSE: "alien_defense",
  HOME_ROW_BUILDER: "home_row_builder",
  WORD_DASH: "word_dash",
} as const;

export type GameMode = typeof GAME_MODES[keyof typeof GAME_MODES];

// Avatar options
export const AVATARS = ["rocket", "star", "robot", "alien", "astronaut", "planet"] as const;
export type Avatar = typeof AVATARS[number];

// Theme options
export const THEMES = ["space", "ocean", "forest", "candy"] as const;
export type Theme = typeof THEMES[number];
