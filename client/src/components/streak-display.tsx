import { Flame, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakSavesRemaining?: number;
  compact?: boolean;
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak, 
  streakSavesRemaining = 1,
  compact = false 
}: StreakDisplayProps) {
  const flameColor = currentStreak >= 14 
    ? "text-orange-500" 
    : currentStreak >= 7 
      ? "text-yellow-500" 
      : currentStreak >= 3 
        ? "text-red-500" 
        : "text-muted-foreground";

  if (compact) {
    return (
      <div className="flex items-center gap-2" data-testid="streak-display-compact">
        <Flame 
          className={`${flameColor} ${currentStreak > 0 ? "animate-pulse" : ""}`} 
          size={20} 
        />
        <span className="font-bold text-lg" data-testid="text-current-streak">
          {currentStreak}
        </span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>
    );
  }

  return (
    <Card data-testid="streak-display">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              currentStreak > 0 
                ? "bg-gradient-to-br from-orange-400 to-red-500" 
                : "bg-muted"
            }`}>
              <Flame 
                className={`${currentStreak > 0 ? "text-white" : "text-muted-foreground"}`} 
                size={24} 
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold" data-testid="text-current-streak-full">
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Best</p>
            <p className="text-lg font-semibold text-primary" data-testid="text-longest-streak">
              {longestStreak} days
            </p>
          </div>
        </div>
        
        {streakSavesRemaining > 0 && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <Shield size={16} className="text-blue-500" />
            <span data-testid="text-streak-saves">
              {streakSavesRemaining} streak {streakSavesRemaining === 1 ? "save" : "saves"} remaining this week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StreakCalendarProps {
  practiceDates: string[];
  className?: string;
}

export function StreakCalendar({ practiceDates, className = "" }: StreakCalendarProps) {
  const today = new Date();
  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const hasPractice = practiceDates.includes(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    
    days.push({
      date: dateStr,
      dayName,
      hasPractice,
      isToday: i === 0,
    });
  }

  return (
    <div className={`flex gap-2 justify-center ${className}`} data-testid="streak-calendar">
      {days.map((day) => (
        <div 
          key={day.date}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xs text-muted-foreground">{day.dayName}</span>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              day.hasPractice 
                ? "bg-gradient-to-br from-green-400 to-emerald-500" 
                : day.isToday 
                  ? "bg-primary/20 border-2 border-primary border-dashed" 
                  : "bg-muted"
            }`}
            data-testid={`streak-day-${day.date}`}
          >
            {day.hasPractice && (
              <Flame size={16} className="text-white" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
