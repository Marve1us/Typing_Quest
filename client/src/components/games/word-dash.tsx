import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getRandomWord } from "@/lib/prompts";
import { Zap, ArrowLeft, RotateCcw, Trophy, Flame, Timer } from "lucide-react";
import type { TypingStats } from "@/hooks/use-typing-engine";

interface WordDashProps {
  difficulty?: "easy" | "medium";
  onComplete: (stats: TypingStats) => void;
  onExit: () => void;
}

const GAME_DURATION = 60;

export function WordDash({ 
  difficulty = "easy", 
  onComplete,
  onExit 
}: WordDashProps) {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord(difficulty));
  const [typedText, setTypedText] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalTyped, setTotalTyped] = useState(0);
  const [correctTyped, setCorrectTyped] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 0;
      const wpm = Math.round((correctTyped / 5) / (GAME_DURATION / 60));
      
      onComplete({
        wpm,
        rawWpm: wpm,
        accuracy,
        correctChars: correctTyped,
        incorrectChars: totalTyped - correctTyped,
        totalChars: totalTyped,
        errors: totalTyped - correctTyped,
        backspaces: 0,
        elapsedTime: GAME_DURATION - timeLeft,
      });
    }
  }, [isGameOver, totalTyped, correctTyped, timeLeft, onComplete]);

  const getNextWord = useCallback(() => {
    const newWord = getRandomWord(difficulty);
    setCurrentWord(newWord);
    setTypedText("");
  }, [difficulty]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || isGameOver) return;
    
    const value = e.target.value.toLowerCase();
    setTypedText(value);
    setTotalTyped(prev => prev + 1);

    if (value === currentWord.toLowerCase()) {
      setCorrectTyped(prev => prev + currentWord.length);
      setWordsCompleted(prev => prev + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
      
      const multiplier = Math.min(1 + Math.floor(newStreak / 3) * 0.5, 3);
      const points = Math.round(currentWord.length * 10 * multiplier);
      setScore(prev => prev + points);

      if (newStreak >= 3 && newStreak % 3 === 0) {
        setShowStreakBonus(true);
        setTimeout(() => setShowStreakBonus(false), 1000);
      }

      getNextWord();
    } else if (!currentWord.toLowerCase().startsWith(value)) {
      setStreak(0);
    }
  }, [isPlaying, isGameOver, currentWord, streak, getNextWord]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (typedText.toLowerCase() === currentWord.toLowerCase()) {
        getNextWord();
      }
    }
  }, [typedText, currentWord, getNextWord]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setWordsCompleted(0);
    setTimeLeft(GAME_DURATION);
    setTotalTyped(0);
    setCorrectTyped(0);
    setTypedText("");
    setIsGameOver(false);
    setIsPlaying(true);
    getNextWord();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const getCharState = (index: number) => {
    if (index >= typedText.length) return "pending";
    if (typedText[index].toLowerCase() === currentWord[index].toLowerCase()) return "correct";
    return "incorrect";
  };

  if (isGameOver) {
    const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 0;
    const wpm = Math.round((correctTyped / 5) / (GAME_DURATION / 60));

    return (
      <div className="flex flex-col items-center gap-6 p-6" data-testid="word-dash-results">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-2">Time's Up!</h2>
          <p className="text-muted-foreground">Great word dashing!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold text-primary">{score}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Words</p>
              <p className="text-3xl font-bold text-secondary">{wordsCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-3xl font-bold text-orange-500">{maxStreak}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">WPM</p>
              <p className="text-3xl font-bold">{wpm}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onExit} data-testid="button-exit-word-dash">
            <ArrowLeft size={18} className="mr-2" />
            Exit
          </Button>
          <Button onClick={startGame} data-testid="button-play-again-word-dash">
            <RotateCcw size={18} className="mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="word-dash-game">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} data-testid="button-back-word-dash">
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
          <Zap size={20} />
          Word Dash
        </h2>
        <div className="w-20" />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Badge variant="secondary" className="text-lg px-4">
          <Zap size={16} className="mr-1 text-yellow-500" />
          {score}
        </Badge>

        {streak >= 3 && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Flame size={14} className="mr-1" />
            {streak}x Streak!
          </Badge>
        )}

        <div className="flex items-center gap-2 min-w-32">
          <Timer size={18} className="text-muted-foreground" />
          <Progress value={(timeLeft / GAME_DURATION) * 100} className="flex-1" />
          <span className="text-sm font-mono w-8">{timeLeft}s</span>
        </div>
      </div>

      {!isPlaying && !isGameOver && (
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <Zap className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ready to Dash?</h3>
            <p className="text-muted-foreground mb-6">
              Type words as fast as you can! Build streaks for bonus points!
            </p>
            <Button size="lg" onClick={startGame} data-testid="button-start-word-dash">
              Start Game
            </Button>
          </CardContent>
        </Card>
      )}

      {isPlaying && (
        <>
          <Card className="bg-card/80 backdrop-blur relative overflow-visible">
            <CardContent className="p-8 text-center">
              {showStreakBonus && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-4 py-2">
                    Streak Bonus!
                  </Badge>
                </div>
              )}

              <div className="text-4xl md:text-5xl font-mono font-bold mb-6 tracking-wider">
                {currentWord.split("").map((char, i) => (
                  <span 
                    key={i}
                    className={
                      getCharState(i) === "correct" 
                        ? "text-green-500" 
                        : getCharState(i) === "incorrect"
                          ? "text-red-500 underline"
                          : "text-muted-foreground"
                    }
                  >
                    {char}
                  </span>
                ))}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={typedText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full max-w-md mx-auto text-2xl font-mono text-center p-4 rounded-lg bg-muted border-2 border-primary/20 focus:border-primary focus:outline-none"
                placeholder="Type here..."
                autoFocus
                data-testid="word-dash-input"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Words</p>
              <p className="text-2xl font-bold">{wordsCompleted}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold text-orange-500">{streak}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
