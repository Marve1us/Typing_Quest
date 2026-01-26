import { useState, useCallback, useEffect, useRef, useMemo } from "react";

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  errors: number;
  backspaces: number;
  elapsedTime: number;
}

export interface CharState {
  char: string;
  state: "pending" | "correct" | "incorrect" | "current";
}

interface UseTypingEngineProps {
  text: string;
  onComplete?: (stats: TypingStats) => void;
  timeLimit?: number;
}

export function useTypingEngine({ text, onComplete, timeLimit }: UseTypingEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chars, setChars] = useState<CharState[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [errors, setErrors] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const initialChars: CharState[] = text.split("").map((char, index) => ({
      char,
      state: index === 0 ? "current" : "pending",
    }));
    setChars(initialChars);
    setCurrentIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrors(0);
    setBackspaces(0);
    setElapsedTime(0);
  }, [text]);

  useEffect(() => {
    if (isStarted && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        if (startTime) {
          const elapsed = (Date.now() - startTime) / 1000;
          setElapsedTime(elapsed);
          
          if (timeLimit && elapsed >= timeLimit) {
            handleComplete();
          }
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isCompleted, startTime, timeLimit]);

  const stats = useMemo((): TypingStats => {
    const elapsed = endTime && startTime 
      ? (endTime - startTime) / 1000 
      : elapsedTime;
    const minutes = elapsed / 60;
    const totalTypedChars = correctChars + incorrectChars;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const rawWpm = minutes > 0 ? Math.round((totalTypedChars / 5) / minutes) : 0;
    const accuracy = totalTypedChars > 0 
      ? Math.round((correctChars / totalTypedChars) * 100) 
      : 100;

    return {
      wpm,
      rawWpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars: totalTypedChars,
      errors,
      backspaces,
      elapsedTime: elapsed,
    };
  }, [correctChars, incorrectChars, errors, backspaces, startTime, endTime, elapsedTime]);

  const handleComplete = useCallback(() => {
    const end = Date.now();
    setEndTime(end);
    setIsCompleted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (onComplete) {
      const finalElapsed = startTime ? (end - startTime) / 1000 : 0;
      const minutes = finalElapsed / 60;
      const totalTypedChars = correctChars + incorrectChars;
      const finalStats: TypingStats = {
        wpm: minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0,
        rawWpm: minutes > 0 ? Math.round((totalTypedChars / 5) / minutes) : 0,
        accuracy: totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100,
        correctChars,
        incorrectChars,
        totalChars: totalTypedChars,
        errors,
        backspaces,
        elapsedTime: finalElapsed,
      };
      onComplete(finalStats);
    }
  }, [onComplete, startTime, correctChars, incorrectChars, errors, backspaces]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isCompleted) return;

    const { key } = event;

    if (key === "Backspace") {
      event.preventDefault();
      setBackspaces(prev => prev + 1);
      
      if (currentIndex > 0) {
        const newChars = [...chars];
        newChars[currentIndex].state = "pending";
        const prevIndex = currentIndex - 1;
        const prevChar = newChars[prevIndex];
        
        if (prevChar.state === "incorrect") {
          setIncorrectChars(prev => prev - 1);
        } else if (prevChar.state === "correct") {
          setCorrectChars(prev => prev - 1);
        }
        
        newChars[prevIndex].state = "current";
        setChars(newChars);
        setCurrentIndex(prevIndex);
      }
      return;
    }

    if (key.length !== 1) return;
    event.preventDefault();

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    const expectedChar = chars[currentIndex]?.char;
    if (!expectedChar) return;

    const isCorrect = key === expectedChar;
    const newChars = [...chars];

    if (isCorrect) {
      newChars[currentIndex].state = "correct";
      setCorrectChars(prev => prev + 1);
    } else {
      newChars[currentIndex].state = "incorrect";
      setIncorrectChars(prev => prev + 1);
      setErrors(prev => prev + 1);
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= chars.length) {
      setChars(newChars);
      setCurrentIndex(nextIndex);
      handleComplete();
    } else {
      newChars[nextIndex].state = "current";
      setChars(newChars);
      setCurrentIndex(nextIndex);
    }
  }, [chars, currentIndex, isStarted, isCompleted, handleComplete]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const reset = useCallback(() => {
    const initialChars: CharState[] = text.split("").map((char, index) => ({
      char,
      state: index === 0 ? "current" : "pending",
    }));
    setChars(initialChars);
    setCurrentIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrors(0);
    setBackspaces(0);
    setElapsedTime(0);
  }, [text]);

  return {
    chars,
    currentIndex,
    isStarted,
    isCompleted,
    stats,
    elapsedTime,
    reset,
    progress: chars.length > 0 ? (currentIndex / chars.length) * 100 : 0,
  };
}
