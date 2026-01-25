import { 
  Home, Zap, Target, Flame, Award, 
  Rocket, Skull, Trophy, Star
} from "lucide-react";
import { BADGE_TYPES, type BadgeType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface BadgeInfo {
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
  bgColor: string;
}

const badgeInfoMap: Record<BadgeType, BadgeInfo> = {
  [BADGE_TYPES.HOME_ROW_HERO]: {
    icon: Home,
    name: "Home Row Hero",
    description: "Mastered the home row keys",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  [BADGE_TYPES.SPEED_DEMON_20]: {
    icon: Zap,
    name: "Speed Demon",
    description: "Reached 20 WPM",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  [BADGE_TYPES.SPEED_DEMON_30]: {
    icon: Zap,
    name: "Lightning Fast",
    description: "Reached 30 WPM",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  [BADGE_TYPES.ACCURACY_STAR_90]: {
    icon: Target,
    name: "Accuracy Star",
    description: "Achieved 90% accuracy",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  [BADGE_TYPES.ACCURACY_STAR_95]: {
    icon: Target,
    name: "Precision Master",
    description: "Achieved 95% accuracy",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  [BADGE_TYPES.STREAK_3]: {
    icon: Flame,
    name: "On Fire",
    description: "3 day practice streak",
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  [BADGE_TYPES.STREAK_7]: {
    icon: Flame,
    name: "Week Warrior",
    description: "7 day practice streak",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  [BADGE_TYPES.STREAK_14]: {
    icon: Flame,
    name: "Unstoppable",
    description: "14 day practice streak",
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  [BADGE_TYPES.FIRST_SESSION]: {
    icon: Star,
    name: "First Steps",
    description: "Completed first session",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  [BADGE_TYPES.RACE_CHAMPION]: {
    icon: Rocket,
    name: "Race Champion",
    description: "Won 10 race sprints",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  [BADGE_TYPES.ALIEN_SLAYER]: {
    icon: Skull,
    name: "Alien Slayer",
    description: "Defeated 100 aliens",
    color: "text-lime-500",
    bgColor: "bg-lime-100 dark:bg-lime-900/30",
  },
  [BADGE_TYPES.PRACTICE_PRO]: {
    icon: Trophy,
    name: "Practice Pro",
    description: "Completed 20 sessions",
    color: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
};

interface BadgeDisplayProps {
  badgeType: BadgeType;
  earned?: boolean;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function BadgeDisplay({ 
  badgeType, 
  earned = true, 
  size = "md",
  showDescription = true 
}: BadgeDisplayProps) {
  const info = badgeInfoMap[badgeType];
  if (!info) return null;

  const Icon = info.icon;
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };
  const iconSizes = { sm: 20, md: 28, lg: 40 };

  return (
    <div 
      className={`flex flex-col items-center gap-2 ${!earned ? "opacity-40 grayscale" : ""}`}
      data-testid={`badge-${badgeType}`}
    >
      <div 
        className={`${sizeClasses[size]} ${info.bgColor} rounded-full flex items-center justify-center border-2 ${
          earned ? "border-current" : "border-muted"
        } ${info.color} shadow-lg`}
      >
        <Icon size={iconSizes[size]} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm">{info.name}</p>
        {showDescription && (
          <p className="text-xs text-muted-foreground">{info.description}</p>
        )}
      </div>
    </div>
  );
}

interface BadgeGridProps {
  earnedBadges: BadgeType[];
  showAll?: boolean;
}

export function BadgeGrid({ earnedBadges, showAll = true }: BadgeGridProps) {
  const allBadgeTypes = Object.values(BADGE_TYPES);
  const badgesToShow = showAll ? allBadgeTypes : earnedBadges;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" data-testid="badge-grid">
      {badgesToShow.map((badge) => (
        <BadgeDisplay
          key={badge}
          badgeType={badge}
          earned={earnedBadges.includes(badge)}
          size="md"
        />
      ))}
    </div>
  );
}

interface BadgeCardProps {
  badgeType: BadgeType;
  earnedAt?: Date;
}

export function BadgeCard({ badgeType, earnedAt }: BadgeCardProps) {
  const info = badgeInfoMap[badgeType];
  if (!info) return null;

  const Icon = info.icon;

  return (
    <Card className="hover-elevate" data-testid={`badge-card-${badgeType}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 ${info.bgColor} rounded-full flex items-center justify-center ${info.color}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{info.name}</p>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          {earnedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
