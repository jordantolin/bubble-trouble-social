
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGamification } from "@/contexts/GamificationContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface XPProgressBarProps {
  className?: string;
  compact?: boolean;
}

const XPProgressBar = ({ className = "", compact = false }: XPProgressBarProps) => {
  const { profile, loading } = useGamification();
  
  if (loading || !profile) {
    return compact ? (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-5 w-5 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-2 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ) : (
      <div className={`space-y-1 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }
  
  const currentXP = profile.points % 100;
  const xpToNextLevel = 100;
  const progressPercentage = (currentXP / xpToNextLevel) * 100;
  
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold">
                Lv.{profile.level}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black bg-opacity-90 p-2 text-xs">
              <p className="font-semibold text-white">{currentXP}/{xpToNextLevel} XP to next level</p>
              <div className="flex space-x-2 mt-1">
                <span title="Bubble Points">🫧 {profile.bubble_points}</span>
                <span title="Message Points">💬 {profile.message_points}</span>
                <span title="Reflection Points">🔄 {profile.reflection_points}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Progress value={progressPercentage} className="h-2 w-20 bg-gray-200" 
          style={{
            "--progress-background": "linear-gradient(to right, #FFD000, #FFE066)"
          } as React.CSSProperties}
        />
        {profile.streak_days > 0 && (
          <Badge variant="outline" className="flex items-center space-x-1 border-yellow-400 text-yellow-600 h-6">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-medium">{profile.streak_days}</span>
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold px-3">
            Level {profile.level}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {currentXP} / {xpToNextLevel} XP
          </span>
        </div>
        <div className="flex space-x-2 text-xs text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center">🫧 {profile.bubble_points}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bubble Points</p>
                <p className="text-xs text-gray-400">+10 points per bubble created</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center">💬 {profile.message_points}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Message Points</p>
                <p className="text-xs text-gray-400">+2 points per message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center">🔄 {profile.reflection_points}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reflection Points</p>
                <p className="text-xs text-gray-400">+5 points per reflection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center">🔥 {profile.streak_days}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Streak Days</p>
                <p className="text-xs text-gray-400">+3 XP per daily login</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-3" 
        style={{
          "--progress-background": "linear-gradient(to right, #FFD000, #FFE066)"
        } as React.CSSProperties} 
      />
    </div>
  );
};

export default XPProgressBar;
