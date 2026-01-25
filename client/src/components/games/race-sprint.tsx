import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TypingDisplay, StatsDisplay } from "@/components/typing-display";
import { useTypingEngine, type TypingStats } from "@/hooks/use-typing-engine";
import { getRandomPrompt } from "@/lib/prompts";
import { Rocket, Flag, RotateCcw, ArrowLeft, Trophy } from "lucide-react";

interface RaceSprintProps {
  difficulty?: "beginner" | "intermediate" | "advanced";
  onComplete: (stats: TypingStats) => void;
  onExit: () => void;
}

export function RaceSprint({ 
  difficulty = "beginner", 
  onComplete,
  onExit 
}: RaceSprintProps) {
  const [prompt, setPrompt] = useState(() => getRandomPrompt(difficulty));
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);

  const handleComplete = useCallback((stats: TypingStats) => {
    setFinalStats(stats);
    setShowResults(true);
    onComplete(stats);
  }, [onComplete]);

  const {
    chars,
    isStarted,
    isCompleted,
    stats,
    progress,
    reset,
  } = useTypingEngine({
    text: prompt,
    onComplete: handleComplete,
  });

  const handleNewRace = useCallback(() => {
    const newPrompt = getRandomPrompt(difficulty);
    setPrompt(newPrompt);
    setShowResults(false);
    setFinalStats(null);
  }, [difficulty]);

  useEffect(() => {
    if (prompt) {
      reset();
    }
  }, [prompt]);

  if (showResults && finalStats) {
    return (
      <div className="flex flex-col items-center gap-6 p-6" data-testid="race-results">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-2">Race Complete!</h2>
          <p className="text-muted-foreground">Great job! Here are your results</p>
        </div>

        <StatsDisplay 
          wpm={finalStats.wpm}
          accuracy={finalStats.accuracy}
          time={finalStats.elapsedTime}
        />

        <Card className="w-full max-w-md">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Characters typed</span>
              <span className="font-medium">{finalStats.totalChars}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Errors</span>
              <span className="font-medium text-destructive">{finalStats.errors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backspaces used</span>
              <span className="font-medium">{finalStats.backspaces}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onExit} data-testid="button-exit-race">
            <ArrowLeft size={18} className="mr-2" />
            Exit
          </Button>
          <Button onClick={handleNewRace} data-testid="button-new-race">
            <RotateCcw size={18} className="mr-2" />
            Race Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" data-testid="race-sprint-game">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} data-testid="button-back">
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold gradient-text">Race Sprint</h2>
        <div className="w-20" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-4 mb-2">
          <Flag size={20} className="text-muted-foreground" />
          <Progress value={progress} className="flex-1 h-4" />
          <Flag size={20} className="text-green-500" />
        </div>
        
        <div 
          className="relative h-16 bg-gradient-to-r from-muted/50 to-muted rounded-lg overflow-hidden"
          data-testid="race-track"
        >
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/20 to-primary/40 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-150"
            style={{ left: `calc(${Math.min(progress, 95)}% - 20px)` }}
          >
            <div className="bg-primary p-2 rounded-full shadow-lg animate-float">
              <Rocket size={24} className="text-white -rotate-90" />
            </div>
          </div>
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Flag size={28} className="text-green-500" />
          </div>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="p-6">
          {!isStarted && (
            <p className="text-center text-muted-foreground mb-4 animate-pulse">
              Start typing to begin the race!
            </p>
          )}
          
          <TypingDisplay chars={chars} />
          
          {isStarted && !isCompleted && (
            <div className="mt-6">
              <StatsDisplay 
                wpm={stats.wpm}
                accuracy={stats.accuracy}
                time={stats.elapsedTime}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => {
            reset();
            handleNewRace();
          }}
          data-testid="button-restart"
        >
          <RotateCcw size={18} className="mr-2" />
          New Prompt
        </Button>
      </div>
    </div>
  );
}
