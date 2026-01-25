import { Rocket, Star, Bot, Skull, User, Globe } from "lucide-react";
import type { Avatar } from "@shared/schema";

interface AvatarDisplayProps {
  avatar: Avatar;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const avatarColors: Record<Avatar, string> = {
  rocket: "from-purple-500 to-blue-500",
  star: "from-yellow-400 to-orange-500",
  robot: "from-gray-400 to-gray-600",
  alien: "from-green-400 to-emerald-600",
  astronaut: "from-blue-400 to-indigo-600",
  planet: "from-pink-400 to-purple-600",
};

export function AvatarDisplay({ avatar, size = "md", className = "" }: AvatarDisplayProps) {
  const Icon = getAvatarIcon(avatar);
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${avatarColors[avatar]} flex items-center justify-center shadow-lg ${className}`}
      data-testid={`avatar-${avatar}`}
    >
      <Icon size={iconSizes[size]} className="text-white" />
    </div>
  );
}

function getAvatarIcon(avatar: Avatar) {
  switch (avatar) {
    case "rocket":
      return Rocket;
    case "star":
      return Star;
    case "robot":
      return Bot;
    case "alien":
      return Skull;
    case "astronaut":
      return User;
    case "planet":
      return Globe;
    default:
      return Rocket;
  }
}

interface AvatarSelectorProps {
  selected: Avatar;
  onSelect: (avatar: Avatar) => void;
}

export function AvatarSelector({ selected, onSelect }: AvatarSelectorProps) {
  const avatars: Avatar[] = ["rocket", "star", "robot", "alien", "astronaut", "planet"];
  
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {avatars.map((avatar) => (
        <button
          key={avatar}
          onClick={() => onSelect(avatar)}
          className={`relative transition-transform hover:scale-110 ${
            selected === avatar ? "scale-110 ring-4 ring-primary ring-offset-2 rounded-full" : ""
          }`}
          data-testid={`button-select-avatar-${avatar}`}
        >
          <AvatarDisplay avatar={avatar} size="lg" />
        </button>
      ))}
    </div>
  );
}
