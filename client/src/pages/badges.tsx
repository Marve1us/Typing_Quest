import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeGrid, BadgeCard } from "@/components/badge-display";
import { LevelXPBar } from "@/components/level-xp-bar";
import { AvatarDisplay } from "@/components/avatar-display";
import { useProfile } from "@/contexts/profile-context";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Star, Lock } from "lucide-react";
import { BADGE_TYPES, type BadgeType, type Avatar, type Badge } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function BadgesPage() {
  const [, navigate] = useLocation();
  const { profile, isGuest } = useProfile();

  const { data: badges, isLoading } = useQuery<Badge[]>({
    queryKey: ["/api/profiles", profile?.id, "badges"],
    enabled: !!profile && !isGuest,
  });

  const earnedBadgeTypes = badges?.map(b => b.badgeType as BadgeType) || [];

  if (isGuest || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full space-glass rounded-2xl border border-purple-500/40">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-cyan-300">Profile Required</h2>
            <p className="text-muted-foreground mb-6">
              Create a profile to earn cosmic badges!
            </p>
            <div className="flex flex-col gap-3">
              <Button className="rounded-full neon-glow-cyan" onClick={() => navigate("/")} data-testid="button-create-profile-badges">
                Create Profile
              </Button>
              <Button variant="outline" className="rounded-full border-purple-500/50" onClick={() => navigate("/play")}>
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" data-testid="badges-page">
      <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate("/play")}
            data-testid="button-back-badges"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold gradient-text neon-text-cyan">Badges & Rewards</h1>
        </div>

        <div className="flex items-center gap-3">
          <LevelXPBar 
            level={profile.level} 
            xp={profile.xp}
            className="hidden sm:flex"
          />
          <div className="flex items-center gap-2">
            <AvatarDisplay avatar={profile.avatar as Avatar} size="sm" />
            <span className="font-medium hidden sm:inline">
              {profile.nickname}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <Card className="space-glass rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 neon-border-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full neon-glow-cyan">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cyan-300">Your Collection</h2>
                <p className="text-muted-foreground">
                  {earnedBadgeTypes.length} of {Object.keys(BADGE_TYPES).length} cosmic badges earned
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-pink-400">
                  <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  {earnedBadgeTypes.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {earnedBadgeTypes.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-300">
                  <Trophy className="text-cyan-400" size={20} />
                  Earned Badges
                </h3>
                <div className="grid gap-3">
                  {badges?.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badgeType={badge.badgeType as BadgeType}
                      earnedAt={new Date(badge.earnedAt)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-lg font-semibold mb-4 text-purple-300">All Badges</h3>
              <BadgeGrid earnedBadges={earnedBadgeTypes} showAll />
            </section>
          </>
        )}

        <Card className="space-glass rounded-2xl border border-green-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-green-300">How to Earn Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Keep exploring the galaxy to unlock more badges! Here's how:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-cyan-300">Speed badges:</strong> Reach 20 or 30 WPM in a session</li>
              <li><strong className="text-green-300">Accuracy badges:</strong> Achieve 90% or 95% accuracy</li>
              <li><strong className="text-pink-300">Streak badges:</strong> Practice 3, 7, or 14 days in a row</li>
              <li><strong className="text-purple-300">Game badges:</strong> Master specific game modes</li>
              <li><strong className="text-yellow-300">Practice badges:</strong> Complete multiple sessions</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
