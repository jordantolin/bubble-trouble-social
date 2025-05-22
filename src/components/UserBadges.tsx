
import React from 'react';
import { useGamification } from '@/contexts/GamificationContext';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: any) => boolean;
}

const BADGES: BadgeInfo[] = [
  {
    id: 'first-bubble',
    name: 'Bubble Beginner',
    description: 'Created your first bubble',
    icon: '🫧',
    condition: (profile) => profile.bubble_points >= 10
  },
  {
    id: 'bubble-master',
    name: 'Bubble Master',
    description: 'Created 5 or more bubbles',
    icon: '🌟',
    condition: (profile) => profile.bubble_points >= 50
  },
  {
    id: 'reflection-star',
    name: 'Reflection Star',
    description: 'Reflected on 5 or more bubbles',
    icon: '✨',
    condition: (profile) => profile.reflection_points >= 25
  },
  {
    id: 'conversation-starter',
    name: 'Conversation Starter',
    description: 'Posted 5 or more messages',
    icon: '💬',
    condition: (profile) => profile.message_points >= 10
  },
  {
    id: 'flame-keeper',
    name: 'Flame Keeper',
    description: 'Maintained a streak of 3 days or more',
    icon: '🔥',
    condition: (profile) => profile.streak_days >= 3
  },
  {
    id: 'bubble-legend',
    name: 'Bubble Legend',
    description: 'Reached level 5 or higher',
    icon: '👑',
    condition: (profile) => profile.level >= 5
  },
];

const UserBadges: React.FC = () => {
  const { profile } = useGamification();
  
  if (!profile) return null;
  
  const earnedBadges = BADGES.filter(badge => badge.condition(profile));
  const lockedBadges = BADGES.filter(badge => !badge.condition(profile));
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Badges</h3>
      
      {earnedBadges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {earnedBadges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger>
                  <Badge className="h-10 px-3 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700">
                    <span className="text-lg">{badge.icon}</span>
                    <span>{badge.name}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No badges earned yet. Keep participating to unlock badges!
        </p>
      )}
      
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Badges to unlock:</h4>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              {lockedBadges.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger>
                    <Badge className="h-10 px-3 flex items-center gap-1.5 bg-gray-200 text-gray-400">
                      <span className="text-lg opacity-50">{badge.icon}</span>
                      <span>{badge.name}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBadges;
