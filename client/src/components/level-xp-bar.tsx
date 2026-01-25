import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";

interface LevelXPBarProps {
  level: number;
  xp: number;
  className?: string;
}

function getXPForNextLevel(level: number): number {
  return level * 100;
}

function getXPProgress(level: number, xp: number): number {
  const xpForCurrent = (level - 1) * 100;
  const xpForNext = level * 100;
  const xpInCurrentLevel = xp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  return Math.min(100, (xpInCurrentLevel / xpNeeded) * 100);
}

export function LevelXPBar({ level, xp, className = "" }: LevelXPBarProps) {
  const progress = getXPProgress(level, xp);
  const xpForNext = getXPForNextLevel(level);
  const currentLevelXP = xp - ((level - 1) * 100);
  const xpNeeded = xpForNext - ((level - 1) * 100);
  
  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="level-xp-bar">
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 rounded-full shadow-lg">
        <Star size={16} className="text-yellow-300 fill-yellow-300" />
        <span className="text-white font-bold text-sm" data-testid="text-level">
          Lvl {level}
        </span>
      </div>
      
      <div className="flex-1 max-w-48">
        <div className="relative">
          <Progress value={progress} className="h-3" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white drop-shadow-md">
              {currentLevelXP}/{xpNeeded} XP
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 text-muted-foreground">
        <Zap size={14} className="text-yellow-500" />
        <span className="text-xs font-medium" data-testid="text-total-xp">
          {xp} total
        </span>
      </div>
    </div>
  );
}

interface XPGainAnimationProps {
  amount: number;
  show: boolean;
}

export function XPGainAnimation({ amount, show }: XPGainAnimationProps) {
  if (!show) return null;
  
  return (
    <div 
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      data-testid="xp-gain-animation"
    >
      <div className="animate-bounce text-4xl font-bold gradient-text">
        +{amount} XP
      </div>
    </div>
  );
}
