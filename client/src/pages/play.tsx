import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameModeGrid } from "@/components/game-mode-card";
import { LevelXPBar } from "@/components/level-xp-bar";
import { StreakDisplay } from "@/components/streak-display";
import { AvatarDisplay } from "@/components/avatar-display";
import { RaceSprint } from "@/components/games/race-sprint";
import { AlienDefense } from "@/components/games/alien-defense";
import { HomeRowBuilder } from "@/components/games/home-row-builder";
import { WordDash } from "@/components/games/word-dash";
import { RecapScreen } from "@/components/recap-screen";
import { useProfile } from "@/contexts/profile-context";
import { GAME_MODES, type GameMode, type Avatar, type Profile, type Badge } from "@shared/schema";
import type { TypingStats } from "@/hooks/use-typing-engine";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Home, Trophy, User, Settings, LogOut, 
  Rocket, ChevronRight
} from "lucide-react";

type View = "menu" | "game" | "recap";

export default function PlayPage() {
  const [, navigate] = useLocation();
  const { profile, isGuest, clearProfile, setProfile } = useProfile();
  const [currentView, setCurrentView] = useState<View>("menu");
  const [selectedGame, setSelectedGame] = useState<GameMode | null>(null);
  const [lastStats, setLastStats] = useState<TypingStats | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const queryClient = useQueryClient();

  const submitSessionMutation = useMutation({
    mutationFn: async (data: {
      profileId: string;
      gameMode: string;
      wpm: number;
      accuracy: number;
      durationSec: number;
      correctChars: number;
      totalChars: number;
      errors: number;
      xpEarned: number;
    }): Promise<{ session: unknown; profile: Profile; badges: Badge[] }> => {
      return await apiRequest("POST", "/api/sessions", data);
    },
    onSuccess: (data) => {
      if (data.profile) {
        setProfile(data.profile);
        queryClient.invalidateQueries({ queryKey: ["/api/profiles", data.profile.id, "badges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profiles", data.profile.id, "sessions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profiles", data.profile.id, "stats"] });
      }
    },
  });

  const handleSelectGame = useCallback((mode: GameMode) => {
    setSelectedGame(mode);
    setCurrentView("game");
  }, []);

  const handleGameComplete = useCallback((stats: TypingStats) => {
    setLastStats(stats);
    
    const earnedXP = Math.round(
      (stats.wpm * 2) + 
      (stats.accuracy * 0.5) + 
      (stats.correctChars * 0.1)
    );
    setXpEarned(earnedXP);

    if (profile && !isGuest) {
      submitSessionMutation.mutate({
        profileId: profile.id,
        gameMode: selectedGame || "unknown",
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationSec: Math.round(stats.elapsedTime),
        correctChars: stats.correctChars,
        totalChars: stats.totalChars,
        errors: stats.errors,
        xpEarned: earnedXP,
      });
    }

    setCurrentView("recap");
  }, [profile, isGuest, selectedGame, submitSessionMutation]);

  const handleExitGame = useCallback(() => {
    setCurrentView("menu");
    setSelectedGame(null);
    setLastStats(null);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setCurrentView("game");
    setLastStats(null);
  }, []);

  const handleLogout = () => {
    clearProfile();
    navigate("/");
  };

  if (currentView === "recap" && lastStats && selectedGame) {
    return (
      <RecapScreen
        stats={lastStats}
        gameMode={selectedGame}
        xpEarned={xpEarned}
        onPlayAgain={handlePlayAgain}
        onChooseGame={handleExitGame}
        onExit={() => navigate("/")}
      />
    );
  }

  if (currentView === "game" && selectedGame) {
    const gameProps = {
      onComplete: handleGameComplete,
      onExit: handleExitGame,
    };

    switch (selectedGame) {
      case GAME_MODES.RACE_SPRINT:
        return <RaceSprint {...gameProps} />;
      case GAME_MODES.ALIEN_DEFENSE:
        return <AlienDefense {...gameProps} />;
      case GAME_MODES.HOME_ROW_BUILDER:
        return <HomeRowBuilder {...gameProps} />;
      case GAME_MODES.WORD_DASH:
        return <WordDash {...gameProps} />;
      default:
        return <RaceSprint {...gameProps} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6" data-testid="play-page">
      <header className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            data-testid="button-home"
          >
            <Home size={20} />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Rocket size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text hidden sm:block">
              Typing Quest
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile && !isGuest ? (
            <>
              <LevelXPBar 
                level={profile.level} 
                xp={profile.xp}
                className="hidden md:flex"
              />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/badges")}
                data-testid="button-badges"
              >
                <Trophy size={18} className="mr-1" />
                <span className="hidden sm:inline">Badges</span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/dashboard")}
                data-testid="button-dashboard"
              >
                <User size={18} className="mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>

              <div className="flex items-center gap-2">
                <AvatarDisplay avatar={profile.avatar as Avatar} size="sm" />
                <span className="font-medium hidden sm:inline">
                  {profile.nickname}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <User size={18} className="text-muted-foreground" />
              <span className="text-muted-foreground">Guest</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/")}
                data-testid="button-create-account"
              >
                Create Account
              </Button>
            </div>
          )}

          {profile && !isGuest && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut size={18} />
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full space-y-6">
        {profile && !isGuest && (
          <div className="md:hidden">
            <LevelXPBar level={profile.level} xp={profile.xp} />
          </div>
        )}

        {profile && !isGuest && (
          <StreakDisplay
            currentStreak={profile.currentStreak}
            longestStreak={profile.longestStreak}
            streakSavesRemaining={profile.streakSavesRemaining}
          />
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="text-primary" size={24} />
              Choose Your Game
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick a game to practice your typing skills!
            </p>
          </CardHeader>
          <CardContent>
            <GameModeGrid onSelectGame={handleSelectGame} />
          </CardContent>
        </Card>

        {isGuest && (
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold">Want to save your progress?</p>
                <p className="text-sm text-muted-foreground">
                  Create a profile to track your achievements and earn badges!
                </p>
              </div>
              <Button onClick={() => navigate("/")} data-testid="button-create-profile-cta">
                Create Profile
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
