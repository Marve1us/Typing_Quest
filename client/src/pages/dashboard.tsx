import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelXPBar } from "@/components/level-xp-bar";
import { StreakDisplay, StreakCalendar } from "@/components/streak-display";
import { AvatarDisplay } from "@/components/avatar-display";
import { BadgeDisplay } from "@/components/badge-display";
import { useProfile } from "@/contexts/profile-context";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Clock, Target, Trophy, Calendar, BarChart3 } from "lucide-react";
import { BADGE_TYPES, type BadgeType, type Avatar, type Session, type Badge } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { profile, isGuest } = useProfile();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/profiles", profile?.id, "sessions"],
    enabled: !!profile && !isGuest,
  });

  const { data: badges } = useQuery<Badge[]>({
    queryKey: ["/api/profiles", profile?.id, "badges"],
    enabled: !!profile && !isGuest,
  });

  if (isGuest || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full space-glass rounded-2xl border border-purple-500/40">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-cyan-300">Profile Required</h2>
            <p className="text-muted-foreground mb-6">
              Create a profile to track your cosmic progress!
            </p>
            <div className="flex flex-col gap-3">
              <Button className="rounded-full neon-glow-cyan" onClick={() => navigate("/")} data-testid="button-create-profile-dashboard">
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

  const last7DaysSessions = sessions?.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }) || [];

  const totalMinutesPracticed = Math.round(
    last7DaysSessions.reduce((acc, s) => acc + s.durationSec, 0) / 60
  );

  const avgWpm = last7DaysSessions.length > 0
    ? Math.round(last7DaysSessions.reduce((acc, s) => acc + s.wpm, 0) / last7DaysSessions.length)
    : 0;

  const avgAccuracy = last7DaysSessions.length > 0
    ? Math.round(last7DaysSessions.reduce((acc, s) => acc + s.accuracy, 0) / last7DaysSessions.length)
    : 0;

  const chartData = last7DaysSessions
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .slice(-10)
    .map((s, i) => ({
      name: `Session ${i + 1}`,
      wpm: s.wpm,
      accuracy: s.accuracy,
    }));

  const practiceDates = [...new Set(
    sessions?.map(s => new Date(s.completedAt).toISOString().split("T")[0]) || []
  )];

  const earnedBadgeTypes = badges?.map(b => b.badgeType as BadgeType) || [];
  const recentBadges = badges?.slice(-3) || [];

  return (
    <div className="min-h-screen p-4 md:p-6" data-testid="dashboard-page">
      <header className="flex items-center justify-between mb-6 max-w-5xl mx-auto gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate("/play")}
            data-testid="button-back-dashboard"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold gradient-text neon-text-cyan">Mission Control</h1>
        </div>

        <div className="flex items-center gap-3">
          <LevelXPBar 
            level={profile.level} 
            xp={profile.xp}
            className="hidden md:flex"
          />
          <div className="flex items-center gap-2">
            <AvatarDisplay avatar={profile.avatar as Avatar} size="sm" />
            <span className="font-medium hidden sm:inline">
              {profile.nickname}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <div className="md:hidden">
          <LevelXPBar level={profile.level} xp={profile.xp} />
        </div>

        <StreakDisplay
          currentStreak={profile.currentStreak}
          longestStreak={profile.longestStreak}
          streakSavesRemaining={profile.streakSavesRemaining}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="space-glass rounded-2xl border border-cyan-500/30 neon-border-glow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-500/20 neon-glow-cyan">
                <TrendingUp className="text-cyan-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg WPM (7 days)</p>
                <p className="text-2xl font-bold text-cyan-400" data-testid="stat-avg-wpm">{avgWpm}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="space-glass rounded-2xl border border-green-500/30 neon-border-glow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20 neon-glow-green">
                <Target className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold text-green-400" data-testid="stat-avg-accuracy">{avgAccuracy}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="space-glass rounded-2xl border border-pink-500/30 neon-border-glow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-pink-500/20 neon-glow-pink">
                <Clock className="text-pink-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practice Time</p>
                <p className="text-2xl font-bold text-pink-400" data-testid="stat-practice-time">{totalMinutesPracticed} min</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="space-glass rounded-2xl border border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Calendar size={20} className="text-purple-400" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCalendar practiceDates={practiceDates} />
          </CardContent>
        </Card>

        {sessionsLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : chartData.length > 0 ? (
          <Card className="space-glass rounded-2xl border border-cyan-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-cyan-300">
                <BarChart3 size={20} className="text-cyan-400" />
                Progress Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="wpm" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorWpm)" 
                      name="WPM"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="hsl(var(--secondary))" 
                      name="Accuracy %"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No session data yet. Complete some games to see your progress chart!
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                Recent Badges
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/badges")}
                data-testid="button-view-all-badges"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentBadges.length > 0 ? (
              <div className="flex flex-wrap gap-6 justify-center">
                {recentBadges.map((badge) => (
                  <BadgeDisplay
                    key={badge.id}
                    badgeType={badge.badgeType as BadgeType}
                    size="md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No badges earned yet. Keep practicing to unlock badges!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoalItem 
              label="Practice 5 days this week"
              current={practiceDates.filter(d => {
                const date = new Date(d);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length}
              target={5}
            />
            <GoalItem 
              label="Reach 20 WPM average"
              current={avgWpm}
              target={20}
            />
            <GoalItem 
              label="Maintain 90% accuracy"
              current={avgAccuracy}
              target={90}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface GoalItemProps {
  label: string;
  current: number;
  target: number;
}

function GoalItem({ label, current, target }: GoalItemProps) {
  const progress = Math.min(100, (current / target) * 100);
  const isComplete = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={isComplete ? "text-green-500 font-medium" : ""}>
          {label}
        </span>
        <span className={`font-medium ${isComplete ? "text-green-500" : "text-muted-foreground"}`}>
          {current} / {target}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            isComplete 
              ? "bg-gradient-to-r from-green-400 to-emerald-500" 
              : "bg-gradient-to-r from-primary to-secondary"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
