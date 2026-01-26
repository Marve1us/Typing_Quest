import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Skull, Home, Zap, Trophy, Play } from "lucide-react";
import { GAME_MODES, type GameMode } from "@shared/schema";

interface GameModeInfo {
  icon: React.ElementType;
  name: string;
  description: string;
  focus: string;
  difficulty: "Easy" | "Medium" | "Hard";
  gradient: string;
  recommended?: boolean;
}

const gameModeInfoMap: Record<GameMode, GameModeInfo> = {
  [GAME_MODES.RACE_SPRINT]: {
    icon: Rocket,
    name: "Race Sprint",
    description: "Race through the stars! Type fast to power your ship!",
    focus: "Speed & Rhythm",
    difficulty: "Medium",
    gradient: "from-cyan-500 to-blue-600",
  },
  [GAME_MODES.ALIEN_DEFENSE]: {
    icon: Skull,
    name: "Alien Defense",
    description: "Defend your planet! Zap invading aliens with your keyboard!",
    focus: "Key Recognition",
    difficulty: "Easy",
    gradient: "from-green-400 to-emerald-600",
  },
  [GAME_MODES.HOME_ROW_BUILDER]: {
    icon: Home,
    name: "Home Row Builder",
    description: "Master the home row keys in the cosmic training center",
    focus: "Finger Placement",
    difficulty: "Easy",
    gradient: "from-purple-500 to-pink-500",
    recommended: true,
  },
  [GAME_MODES.WORD_DASH]: {
    icon: Zap,
    name: "Word Dash",
    description: "Collect stellar word combos with streak multipliers!",
    focus: "Common Patterns",
    difficulty: "Medium",
    gradient: "from-pink-500 to-orange-400",
  },
};

interface GameModeCardProps {
  gameMode: GameMode;
  onPlay: (mode: GameMode) => void;
  disabled?: boolean;
  stats?: {
    bestWpm?: number;
    bestAccuracy?: number;
    timesPlayed?: number;
  };
}

export function GameModeCard({ gameMode, onPlay, disabled = false, stats }: GameModeCardProps) {
  const info = gameModeInfoMap[gameMode];
  if (!info) return null;

  const Icon = info.icon;
  const difficultyColors = {
    Easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card 
      className={`overflow-visible hover-elevate transition-all duration-300 space-glass rounded-2xl border border-purple-500/30 neon-border-glow ${disabled ? "opacity-50" : ""}`}
      data-testid={`game-card-${gameMode}`}
    >
      <div className={`h-2 bg-gradient-to-r ${info.gradient} rounded-t-2xl`} />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${info.gradient} shadow-lg neon-glow-cyan`}>
            <Icon size={28} className="text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-cyan-300">{info.name}</h3>
              {info.recommended && (
                <Badge variant="secondary" className="text-xs rounded-full bg-pink-500/20 text-pink-300 border-pink-500/30">
                  <Trophy size={12} className="mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {info.description}
            </p>
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="text-xs rounded-full border-cyan-500/50 text-cyan-300">
                {info.focus}
              </Badge>
              <Badge className={`text-xs rounded-full ${difficultyColors[info.difficulty]}`}>
                {info.difficulty}
              </Badge>
            </div>
            
            {stats && (
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                {stats.bestWpm !== undefined && (
                  <span data-testid={`stat-best-wpm-${gameMode}`}>
                    Best: {stats.bestWpm} WPM
                  </span>
                )}
                {stats.timesPlayed !== undefined && (
                  <span data-testid={`stat-times-played-${gameMode}`}>
                    Played: {stats.timesPlayed}x
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          className={`w-full mt-4 rounded-full bg-gradient-to-r ${info.gradient} hover:opacity-90 neon-glow-cyan`}
          onClick={() => onPlay(gameMode)}
          disabled={disabled}
          data-testid={`button-play-${gameMode}`}
        >
          <Play size={18} className="mr-2" />
          Play Now
        </Button>
      </CardContent>
    </Card>
  );
}

interface GameModeGridProps {
  onSelectGame: (mode: GameMode) => void;
  disabledModes?: GameMode[];
}

export function GameModeGrid({ onSelectGame, disabledModes = [] }: GameModeGridProps) {
  const modes: GameMode[] = [
    GAME_MODES.HOME_ROW_BUILDER,
    GAME_MODES.RACE_SPRINT,
    GAME_MODES.ALIEN_DEFENSE,
    GAME_MODES.WORD_DASH,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="game-mode-grid">
      {modes.map((mode) => (
        <GameModeCard
          key={mode}
          gameMode={mode}
          onPlay={onSelectGame}
          disabled={disabledModes.includes(mode)}
        />
      ))}
    </div>
  );
}
