interface KeyboardVisualProps {
  highlightedKey?: string;
  currentRow?: "home" | "top" | "bottom" | "all";
  showFingerGuide?: boolean;
}

const keyboardRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ["space"],
];

const fingerColors: Record<string, string> = {
  "a": "bg-pink-400",
  "q": "bg-pink-400",
  "z": "bg-pink-400",
  "s": "bg-orange-400",
  "w": "bg-orange-400",
  "x": "bg-orange-400",
  "d": "bg-yellow-400",
  "e": "bg-yellow-400",
  "c": "bg-yellow-400",
  "f": "bg-green-400",
  "r": "bg-green-400",
  "v": "bg-green-400",
  "g": "bg-green-400",
  "t": "bg-green-400",
  "b": "bg-green-400",
  "h": "bg-blue-400",
  "y": "bg-blue-400",
  "n": "bg-blue-400",
  "j": "bg-indigo-400",
  "u": "bg-indigo-400",
  "m": "bg-indigo-400",
  "k": "bg-purple-400",
  "i": "bg-purple-400",
  ",": "bg-purple-400",
  "l": "bg-pink-400",
  "o": "bg-pink-400",
  ".": "bg-pink-400",
  ";": "bg-red-400",
  "p": "bg-red-400",
  "/": "bg-red-400",
  "space": "bg-gray-400",
};

const homeRowKeys = ["a", "s", "d", "f", "j", "k", "l", ";"];

export function KeyboardVisual({ 
  highlightedKey, 
  currentRow = "all",
  showFingerGuide = true 
}: KeyboardVisualProps) {
  const getKeyClass = (key: string) => {
    const isHighlighted = highlightedKey?.toLowerCase() === key.toLowerCase() ||
      (key === "space" && highlightedKey === " ");
    const isHomeRow = homeRowKeys.includes(key);
    const fingerColor = showFingerGuide ? fingerColors[key] || "bg-muted" : "bg-muted";
    
    let baseClass = `
      flex items-center justify-center 
      rounded-md border border-border
      font-mono text-sm font-medium
      transition-all duration-150
      ${key === "space" ? "w-48 h-10" : "w-10 h-10"}
    `;

    if (isHighlighted) {
      baseClass += " ring-2 ring-primary ring-offset-2 scale-110 shadow-lg animate-pulse-glow";
    }

    if (isHomeRow && !isHighlighted) {
      baseClass += ` ${fingerColor} text-white`;
    } else if (!isHighlighted) {
      baseClass += ` ${fingerColor}/30 text-foreground`;
    } else {
      baseClass += ` ${fingerColor} text-white`;
    }

    return baseClass;
  };

  const shouldShowRow = (rowIndex: number) => {
    if (currentRow === "all") return true;
    if (currentRow === "top" && rowIndex === 0) return true;
    if (currentRow === "home" && rowIndex === 1) return true;
    if (currentRow === "bottom" && rowIndex === 2) return true;
    if (rowIndex === 3) return true;
    return false;
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4" data-testid="keyboard-visual">
      {keyboardRows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`flex gap-1.5 ${!shouldShowRow(rowIndex) ? "opacity-30" : ""}`}
          style={{ marginLeft: rowIndex === 1 ? "1rem" : rowIndex === 2 ? "2rem" : "0" }}
        >
          {row.map((key) => (
            <div 
              key={key} 
              className={getKeyClass(key)}
              data-testid={`key-${key}`}
            >
              {key === "space" ? "SPACE" : key.toUpperCase()}
            </div>
          ))}
        </div>
      ))}
      
      {showFingerGuide && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
          <FingerLegend color="bg-pink-400" label="Pinky" />
          <FingerLegend color="bg-orange-400" label="Ring" />
          <FingerLegend color="bg-yellow-400" label="Middle" />
          <FingerLegend color="bg-green-400" label="Index (L)" />
          <FingerLegend color="bg-blue-400" label="Index (R)" />
          <FingerLegend color="bg-indigo-400" label="Middle (R)" />
          <FingerLegend color="bg-purple-400" label="Ring (R)" />
          <FingerLegend color="bg-red-400" label="Pinky (R)" />
        </div>
      )}
    </div>
  );
}

function FingerLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
