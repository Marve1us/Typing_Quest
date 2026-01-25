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
    description: "Type sentences to race your car across the finish line!",
    focus: "Speed & Rhythm",
    difficulty: "Medium",
    gradient: "from-blue-500 to-cyan-400",
  },
  [GAME_MODES.ALIEN_DEFENSE]: {
    icon: Skull,
    name: "Alien Defense",
    description: "Type letters and words to zap incoming aliens!",
    focus: "Key Recognition",
    difficulty: "Easy",
    gradient: "from-green-500 to-emerald-400",
  },
  [GAME_MODES.HOME_ROW_BUILDER]: {
    icon: Home,
    name: "Home Row Builder",
    description: "Master the home row keys with guided practice",
    focus: "Finger Placement",
    difficulty: "Easy",
    gradient: "from-purple-500 to-pink-400",
    recommended: true,
  },
  [GAME_MODES.WORD_DASH]: {
    icon: Zap,
    name: "Word Dash",
    description: "Type themed word lists with streak multipliers!",
    focus: "Common Patterns",
    difficulty: "Medium",
    gradient: "from-orange-500 to-yellow-400",
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
      className={`overflow-visible hover-elevate transition-all duration-300 ${disabled ? "opacity-50" : ""}`}
      data-testid={`game-card-${gameMode}`}
    >
      <div className={`h-2 bg-gradient-to-r ${info.gradient}`} />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${info.gradient} shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg">{info.name}</h3>
              {info.recommended && (
                <Badge variant="secondary" className="text-xs">
                  <Trophy size={12} className="mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {info.description}
            </p>
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {info.focus}
              </Badge>
              <Badge className={`text-xs ${difficultyColors[info.difficulty]}`}>
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
          className="w-full mt-4" 
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
