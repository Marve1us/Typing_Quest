import type { CharState } from "@/hooks/use-typing-engine";

interface TypingDisplayProps {
  chars: CharState[];
  className?: string;
}

export function TypingDisplay({ chars, className = "" }: TypingDisplayProps) {
  return (
    <div 
      className={`font-mono text-xl md:text-2xl lg:text-3xl leading-relaxed p-6 rounded-lg bg-card border border-card-border ${className}`}
      data-testid="typing-display"
    >
      {chars.map((charState, index) => (
        <span
          key={index}
          className={getCharClass(charState.state)}
          data-testid={`char-${index}`}
        >
          {charState.char === " " ? "\u00A0" : charState.char}
        </span>
      ))}
    </div>
  );
}

function getCharClass(state: CharState["state"]): string {
  switch (state) {
    case "pending":
      return "char-pending";
    case "correct":
      return "char-correct";
    case "incorrect":
      return "char-incorrect";
    case "current":
      return "char-current";
    default:
      return "char-pending";
  }
}

interface StatsDisplayProps {
  wpm: number;
  accuracy: number;
  time: number;
  className?: string;
}

export function StatsDisplay({ wpm, accuracy, time, className = "" }: StatsDisplayProps) {
  return (
    <div className={`flex flex-wrap gap-4 md:gap-8 justify-center ${className}`}>
      <StatCard 
        label="WPM" 
        value={wpm.toString()} 
        color="primary"
        testId="stat-wpm"
      />
      <StatCard 
        label="Accuracy" 
        value={`${accuracy}%`} 
        color="secondary"
        testId="stat-accuracy"
      />
      <StatCard 
        label="Time" 
        value={formatTime(time)} 
        color="accent"
        testId="stat-time"
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: "primary" | "secondary" | "accent";
  testId: string;
}

function StatCard({ label, value, color, testId }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent-foreground border-accent/20",
  };

  return (
    <div 
      className={`flex flex-col items-center px-6 py-3 rounded-lg border ${colorClasses[color]}`}
      data-testid={testId}
    >
      <span className="text-sm font-medium opacity-80">{label}</span>
      <span className="text-2xl md:text-3xl font-bold">{value}</span>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
