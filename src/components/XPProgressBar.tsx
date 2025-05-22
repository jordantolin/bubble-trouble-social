
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGamification } from "@/contexts/GamificationContext";

interface XPProgressBarProps {
  className?: string;
  compact?: boolean;
}

const XPProgressBar = ({ className = "", compact = false }: XPProgressBarProps) => {
  const { profile, loading } = useGamification();
  
  if (loading || !profile) {
    return null;
  }
  
  const currentXP = profile.points % 100;
  const xpToNextLevel = 100;
  const progressPercentage = (currentXP / xpToNextLevel) * 100;
  
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge className="bg-bubble-yellow text-white font-bold">
          Lv.{profile.level}
        </Badge>
        <Progress value={progressPercentage} className="h-2 w-20" />
      </div>
    );
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge className="bg-bubble-yellow text-white font-bold">
            Lv.{profile.level}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {currentXP} / {xpToNextLevel} XP
          </span>
        </div>
        <div className="flex space-x-2 text-xs text-muted-foreground">
          <span title="Bubble Points">🫧 {profile.bubble_points}</span>
          <span title="Message Points">💬 {profile.message_points}</span>
          <span title="Reflection Points">🔄 {profile.reflection_points}</span>
          <span title="Streak Days">🔥 {profile.streak_days}</span>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-3" />
    </div>
  );
};

export default XPProgressBar;
