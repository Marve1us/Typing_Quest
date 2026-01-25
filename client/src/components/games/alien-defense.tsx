import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getRandomLetter, getRandomWord } from "@/lib/prompts";
import { Skull, Heart, Shield, ArrowLeft, RotateCcw, Trophy, Zap } from "lucide-react";
import type { TypingStats } from "@/hooks/use-typing-engine";

interface Alien {
  id: string;
  target: string;
  x: number;
  y: number;
  speed: number;
}

interface AlienDefenseProps {
  difficulty?: "easy" | "medium" | "hard";
  onComplete: (stats: TypingStats) => void;
  onExit: () => void;
}

const GAME_DURATION = 60;
const GAME_HEIGHT = 400;

export function AlienDefense({ 
  difficulty = "easy", 
  onComplete,
  onExit 
}: AlienDefenseProps) {
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalTyped, setTotalTyped] = useState(0);
  const [correctTyped, setCorrectTyped] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [lastZapped, setLastZapped] = useState<string | null>(null);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const spawnAlien = useCallback(() => {
    const isWord = difficulty !== "easy" && Math.random() > 0.5;
    const target = isWord 
      ? getRandomWord(difficulty === "hard" ? "medium" : "easy")
      : getRandomLetter(difficulty === "easy" ? "home" : "all");
    
    const newAlien: Alien = {
      id: Math.random().toString(36).substr(2, 9),
      target,
      x: Math.random() * 80 + 10,
      y: 0,
      speed: difficulty === "hard" ? 2 : difficulty === "medium" ? 1.5 : 1,
    };
    
    setAliens(prev => [...prev, newAlien]);
  }, [difficulty]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const spawnInterval = setInterval(() => {
      if (aliens.length < 8) {
        spawnAlien();
      }
    }, difficulty === "hard" ? 1500 : difficulty === "medium" ? 2000 : 2500);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, isGameOver, aliens.length, difficulty, spawnAlien]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const moveInterval = setInterval(() => {
      setAliens(prev => {
        const updated = prev.map(alien => ({
          ...alien,
          y: alien.y + alien.speed,
        }));

        const survived = updated.filter(alien => {
          if (alien.y >= GAME_HEIGHT - 50) {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setIsGameOver(true);
                setIsPlaying(false);
              }
              return newLives;
            });
            setCombo(0);
            return false;
          }
          return true;
        });

        return survived;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying, isGameOver]);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isPlaying || isGameOver) return;
    
    const key = e.key.toLowerCase();
    
    if (key === "backspace") {
      setCurrentInput(prev => prev.slice(0, -1));
      return;
    }
    
    if (key.length !== 1) return;
    
    setTotalTyped(prev => prev + 1);
    const newInput = currentInput + key;
    
    const matchingAlien = aliens.find(a => 
      a.target.toLowerCase().startsWith(newInput)
    );
    
    if (matchingAlien) {
      setCorrectTyped(prev => prev + 1);
      
      if (matchingAlien.target.toLowerCase() === newInput) {
        setLastZapped(matchingAlien.id);
        setTimeout(() => setLastZapped(null), 200);
        
        setAliens(prev => prev.filter(a => a.id !== matchingAlien.id));
        const points = (1 + Math.floor(combo / 5)) * matchingAlien.target.length * 10;
        setScore(prev => prev + points);
        setCombo(prev => {
          const newCombo = prev + 1;
          setMaxCombo(m => Math.max(m, newCombo));
          return newCombo;
        });
        setCurrentInput("");
      } else {
        setCurrentInput(newInput);
      }
    } else {
      setCombo(0);
      setCurrentInput("");
    }
  }, [isPlaying, isGameOver, aliens, currentInput, combo]);

  const startGame = () => {
    setAliens([]);
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);
    setTotalTyped(0);
    setCorrectTyped(0);
    setCurrentInput("");
    setIsGameOver(false);
    setIsPlaying(true);
    inputRef.current?.focus();
  };

  if (isGameOver) {
    const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 0;
    const wpm = Math.round((correctTyped / 5) / (GAME_DURATION / 60));

    return (
      <div className="flex flex-col items-center gap-6 p-6" data-testid="alien-results">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-2">
            {lives > 0 ? "Time's Up!" : "Game Over!"}
          </h2>
          <p className="text-muted-foreground">
            {lives > 0 ? "Great defense!" : "The aliens got through!"}
          </p>
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
              <p className="text-sm text-muted-foreground">Max Combo</p>
              <p className="text-3xl font-bold text-secondary">{maxCombo}x</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">WPM</p>
              <p className="text-3xl font-bold">{wpm}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-3xl font-bold">{accuracy}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onExit} data-testid="button-exit-alien">
            <ArrowLeft size={18} className="mr-2" />
            Exit
          </Button>
          <Button onClick={startGame} data-testid="button-play-again">
            <RotateCcw size={18} className="mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="alien-defense-game">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} data-testid="button-back-alien">
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold gradient-text">Alien Defense</h2>
        <div className="w-20" />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i}
              size={24}
              className={i < lives ? "text-red-500 fill-red-500" : "text-muted"}
              data-testid={`heart-${i}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4">
            <Zap size={16} className="mr-1 text-yellow-500" />
            {score}
          </Badge>
          
          {combo > 1 && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
              {combo}x COMBO!
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 min-w-24">
          <Shield size={18} className="text-muted-foreground" />
          <Progress value={(timeLeft / GAME_DURATION) * 100} className="flex-1" />
          <span className="text-sm font-mono w-8">{timeLeft}s</span>
        </div>
      </div>

      <div 
        ref={gameRef}
        className="relative bg-gradient-to-b from-slate-900 via-purple-900/30 to-slate-900 rounded-lg overflow-hidden border border-border"
        style={{ height: GAME_HEIGHT }}
        onClick={() => inputRef.current?.focus()}
        data-testid="game-area"
      >
        <div className="absolute inset-0 game-bg-pattern" />
        
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Button size="lg" onClick={startGame} data-testid="button-start-alien">
              <Skull size={24} className="mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {aliens.map((alien) => (
          <div
            key={alien.id}
            className={`absolute transition-transform duration-75 ${
              lastZapped === alien.id ? "scale-150 opacity-0" : ""
            }`}
            style={{
              left: `${alien.x}%`,
              top: alien.y,
              transform: "translateX(-50%)",
            }}
            data-testid={`alien-${alien.id}`}
          >
            <div className="flex flex-col items-center">
              <div className={`text-3xl ${
                currentInput && alien.target.toLowerCase().startsWith(currentInput)
                  ? "animate-pulse scale-110"
                  : ""
              }`}>
                <Skull className="text-green-400" size={32} />
              </div>
              <Badge 
                className={`mt-1 font-mono text-lg ${
                  currentInput && alien.target.toLowerCase().startsWith(currentInput)
                    ? "bg-green-500"
                    : "bg-slate-700"
                }`}
              >
                {alien.target}
              </Badge>
            </div>
          </div>
        ))}

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-900/50 to-transparent flex items-end justify-center pb-2">
          <Shield size={32} className="text-green-400" />
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute -z-10"
        autoFocus
        data-testid="alien-input"
      />

      {isPlaying && (
        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground mb-2">Currently typing:</p>
            <p className="text-2xl font-mono font-bold text-primary">
              {currentInput || "_"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
