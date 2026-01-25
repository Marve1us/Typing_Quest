import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TypingDisplay, StatsDisplay } from "@/components/typing-display";
import { KeyboardVisual } from "@/components/keyboard-visual";
import { useTypingEngine, type TypingStats } from "@/hooks/use-typing-engine";
import { homeRowPrompts } from "@/lib/prompts";
import { Home, ArrowLeft, RotateCcw, Trophy, ChevronRight } from "lucide-react";

interface HomeRowBuilderProps {
  onComplete: (stats: TypingStats) => void;
  onExit: () => void;
}

const lessons = [
  { name: "Home Position", keys: "asdf jkl;", description: "Learn the home row position" },
  { name: "Left Hand", keys: "asdf asdf", description: "Practice left hand keys" },
  { name: "Right Hand", keys: "jkl; jkl;", description: "Practice right hand keys" },
  { name: "Both Hands", keys: "asdf jkl; asdf jkl;", description: "Combine both hands" },
  { name: "Simple Words", keys: "ask dad salad flask", description: "Type home row words" },
];

export function HomeRowBuilder({ onComplete, onExit }: HomeRowBuilderProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lesson = lessons[currentLesson];
  const prompt = lesson.keys;

  const handleComplete = useCallback((stats: TypingStats) => {
    setFinalStats(stats);
    setCompletedLessons(prev => [...prev, currentLesson]);
    
    if (currentLesson === lessons.length - 1) {
      setShowResults(true);
      onComplete(stats);
    }
  }, [currentLesson, onComplete]);

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

  const getCurrentKey = () => {
    const currentChar = chars.find(c => c.state === "current");
    return currentChar?.char || "";
  };

  const handleNextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
      setFinalStats(null);
    }
  };

  const handleRestart = () => {
    reset();
    setFinalStats(null);
  };

  if (showResults && finalStats) {
    const avgAccuracy = Math.round(
      completedLessons.reduce((acc, _, i) => acc + (i === currentLesson ? finalStats.accuracy : 95), 0) / 
      completedLessons.length
    );

    return (
      <div className="flex flex-col items-center gap-6 p-6" data-testid="home-row-results">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-2">All Lessons Complete!</h2>
          <p className="text-muted-foreground">You've mastered the home row!</p>
        </div>

        <StatsDisplay 
          wpm={finalStats.wpm}
          accuracy={avgAccuracy}
          time={finalStats.elapsedTime}
        />

        <div className="flex gap-4">
          <Button variant="outline" onClick={onExit} data-testid="button-exit-home-row">
            <ArrowLeft size={18} className="mr-2" />
            Exit
          </Button>
          <Button 
            onClick={() => {
              setCurrentLesson(0);
              setCompletedLessons([]);
              setShowResults(false);
              setFinalStats(null);
            }}
            data-testid="button-restart-all"
          >
            <RotateCcw size={18} className="mr-2" />
            Practice Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6" data-testid="home-row-builder-game">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} data-testid="button-back-home-row">
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
          <Home size={20} />
          Home Row Builder
        </h2>
        <div className="w-20" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        {lessons.map((l, i) => (
          <div 
            key={i}
            className={`flex-1 h-2 rounded-full ${
              completedLessons.includes(i) 
                ? "bg-green-500" 
                : i === currentLesson 
                  ? "bg-primary" 
                  : "bg-muted"
            }`}
          />
        ))}
      </div>

      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{lesson.name}</h3>
              <p className="text-sm text-muted-foreground">{lesson.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Lesson</p>
              <p className="font-bold">{currentLesson + 1} / {lessons.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="p-6">
          {!isStarted && (
            <p className="text-center text-muted-foreground mb-4 animate-pulse">
              Place your fingers on the home row and start typing!
            </p>
          )}
          
          <TypingDisplay chars={chars} />
          
          {isStarted && !isCompleted && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <KeyboardVisual 
            highlightedKey={getCurrentKey()} 
            currentRow="home"
            showFingerGuide={true}
          />
        </CardContent>
      </Card>

      {isCompleted && finalStats && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-green-600 dark:text-green-400">Lesson Complete!</p>
                <p className="text-sm text-muted-foreground">
                  {finalStats.wpm} WPM · {finalStats.accuracy}% accuracy
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <RotateCcw size={16} className="mr-1" />
                  Retry
                </Button>
                {currentLesson < lessons.length - 1 && (
                  <Button size="sm" onClick={handleNextLesson} data-testid="button-next-lesson">
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isStarted && !isCompleted && (
        <StatsDisplay 
          wpm={stats.wpm}
          accuracy={stats.accuracy}
          time={stats.elapsedTime}
          className="mt-2"
        />
      )}
    </div>
  );
}
