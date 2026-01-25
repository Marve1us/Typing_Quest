import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatsDisplay } from "@/components/typing-display";
import type { TypingStats } from "@/hooks/use-typing-engine";
import type { GameMode } from "@shared/schema";
import { GAME_MODES } from "@shared/schema";
import { 
  Trophy, Star, Target, Zap, ArrowRight, 
  RotateCcw, Home, Lightbulb, TrendingUp
} from "lucide-react";

interface RecapScreenProps {
  stats: TypingStats;
  gameMode: GameMode;
  xpEarned: number;
  onPlayAgain: () => void;
  onChooseGame: () => void;
  onExit: () => void;
}

const gameModeNames: Record<GameMode, string> = {
  [GAME_MODES.RACE_SPRINT]: "Race Sprint",
  [GAME_MODES.ALIEN_DEFENSE]: "Alien Defense",
  [GAME_MODES.HOME_ROW_BUILDER]: "Home Row Builder",
  [GAME_MODES.WORD_DASH]: "Word Dash",
};

const tips = [
  "Keep your fingers on the home row (ASDF JKL;) for faster typing!",
  "Focus on accuracy first, speed will come naturally.",
  "Practice for 15 minutes every day to build muscle memory.",
  "Try not to look at the keyboard while typing.",
  "Use the correct finger for each key - it helps with speed!",
  "Take short breaks to avoid fatigue.",
  "Challenge yourself with harder prompts as you improve!",
];

export function RecapScreen({ 
  stats, 
  gameMode, 
  xpEarned,
  onPlayAgain, 
  onChooseGame,
  onExit 
}: RecapScreenProps) {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  const performanceLevel = 
    stats.wpm >= 30 && stats.accuracy >= 95 ? "amazing" :
    stats.wpm >= 20 && stats.accuracy >= 90 ? "great" :
    stats.wpm >= 10 && stats.accuracy >= 80 ? "good" :
    "keep_practicing";

  const performanceMessages = {
    amazing: { title: "Amazing!", subtitle: "You're a typing superstar!", icon: Trophy, color: "text-yellow-500" },
    great: { title: "Great Job!", subtitle: "Keep up the awesome work!", icon: Star, color: "text-purple-500" },
    good: { title: "Nice Work!", subtitle: "You're making progress!", icon: TrendingUp, color: "text-blue-500" },
    keep_practicing: { title: "Good Try!", subtitle: "Practice makes perfect!", icon: Target, color: "text-green-500" },
  };

  const message = performanceMessages[performanceLevel];
  const MessageIcon = message.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 game-bg-pattern" data-testid="recap-screen">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4`}>
            <MessageIcon className={`w-10 h-10 ${message.color}`} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {message.title}
          </h1>
          <p className="text-muted-foreground">{message.subtitle}</p>
          <Badge variant="outline" className="mt-2">
            {gameModeNames[gameMode]}
          </Badge>
        </div>

        <StatsDisplay 
          wpm={stats.wpm}
          accuracy={stats.accuracy}
          time={stats.elapsedTime}
        />

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center justify-center gap-3">
            <Zap className="text-yellow-500" size={24} />
            <span className="text-xl font-bold">+{xpEarned} XP earned!</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target size={18} className="text-primary" />
              Session Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Characters typed</span>
                <span className="font-medium">{stats.totalChars}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-medium text-green-500">{stats.correctChars}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors</span>
                <span className="font-medium text-red-500">{stats.errors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raw WPM</span>
                <span className="font-medium">{stats.rawWpm}</span>
              </div>
            </div>

            {stats.accuracy < 95 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Accuracy goal: 95%
                </p>
                <Progress value={stats.accuracy} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Lightbulb className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-sm mb-1">Tip</p>
              <p className="text-sm text-muted-foreground">{randomTip}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onExit}
            data-testid="button-exit-recap"
          >
            <Home size={18} className="mr-2" />
            Home
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1"
            onClick={onChooseGame}
            data-testid="button-choose-game"
          >
            <RotateCcw size={18} className="mr-2" />
            Choose Game
          </Button>
          
          <Button 
            className="flex-1"
            onClick={onPlayAgain}
            data-testid="button-play-again-recap"
          >
            Play Again
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
