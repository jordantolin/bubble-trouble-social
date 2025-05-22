
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble } from "@/types/bubble";

interface BubbleOrbitProps {
  bubbles: Bubble[];
  mostReflectedBubbles: Bubble[];
}

const BubbleOrbit: React.FC<BubbleOrbitProps> = ({ bubbles, mostReflectedBubbles }) => {
  const navigate = useNavigate();
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [rippleBubbleId, setRippleBubbleId] = useState<string | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);

  // Combine all bubbles for display
  const allBubbles = [...mostReflectedBubbles, ...bubbles.filter(
    bubble => !mostReflectedBubbles.some(reflectedBubble => reflectedBubble.id === bubble.id)
  )];

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Handle bubble click with animation
  const handleBubbleClick = (id: string) => {
    // Don't allow multiple animations to run at once
    if (selectedBubbleId) {
      return;
    }
    
    // Trigger ripple animation first
    setRippleBubbleId(id);
    
    // Clear ripple animation after it completes
    setTimeout(() => {
      setRippleBubbleId(null);
    }, 600);
    
    // Set selected bubble to trigger zoom/fade animations
    setSelectedBubbleId(id);
    
    // Navigate after animation completes
    navigationTimeoutRef.current = window.setTimeout(() => {
      navigate(`/bubble/${id}`);
    }, 800); // Match this with animation duration
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 mb-8 border">
      <div className="absolute inset-0">
        {/* Center planet/sun for orbit system */}
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 rounded-full bg-bubble-yellow-light border-4 border-bubble-yellow flex items-center justify-center z-10 animate-pulse shadow-lg ${
            selectedBubbleId ? 'animate-fade-out' : ''
          }`}
        >
          <span className="text-xs md:text-sm font-medium text-bubble-yellow-dark">Bubble Orbit</span>
        </div>
        
        {/* Most reflected bubbles - inner orbit */}
        <div className={`orbit-container inner-orbit ${selectedBubbleId ? 'paused' : ''}`}>
          {mostReflectedBubbles.map((bubble, index) => {
            // Calculate position based on index for circular arrangement
            const angle = (index / mostReflectedBubbles.length) * 2 * Math.PI;
            const orbitRadius = 120; // inner orbit radius
            const delay = index * 0.5; // stagger animation
            const size = getBubbleSize(bubble.reflect_count || 0);
            const isSelected = selectedBubbleId === bubble.id;
            const hasRipple = rippleBubbleId === bubble.id;
            
            return (
              <TooltipProvider key={bubble.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HoverCard open={isSelected ? false : undefined}>
                      <HoverCardTrigger asChild>
                        <div 
                          className={`absolute bubble cursor-pointer ${getReflectionClass(bubble.reflect_count || 0)} ${getGlowClass(bubble.reflect_count || 0)} ${
                            isSelected ? 'bubble-zoom-in' : 
                            selectedBubbleId ? 'bubble-fade-out' : 'animate-float'
                          } ${hasRipple ? 'animate-ripple' : ''}`}
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `calc(50% + ${orbitRadius * Math.cos(angle)}px)`, 
                            top: `calc(50% + ${orbitRadius * Math.sin(angle)}px)`,
                            animationDelay: `${delay}s`,
                            zIndex: isSelected ? 50 : (bubble.reflect_count && bubble.reflect_count > 5 ? 5 : 1)
                          }}
                          onClick={() => handleBubbleClick(bubble.id)}
                        >
                          <span className="text-xs md:text-sm font-medium truncate max-w-full px-1">
                            {bubble.name?.substring(0, 10) || bubble.topic?.substring(0, 10)}
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64">
                        <div className="flex justify-between">
                          <Avatar>
                            <AvatarFallback>{bubble.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{bubble.name}</h4>
                            <p className="text-sm">{bubble.topic}</p>
                            <div className="flex items-center pt-2">
                              <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs">
                                {bubble.reflect_count || 0} reflects
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{bubble.topic}</p>
                    <p className="text-xs">{bubble.reflect_count || 0} reflects</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        {/* Regular bubbles - outer orbit */}
        <div className={`orbit-container outer-orbit ${selectedBubbleId ? 'paused' : ''}`}>
          {bubbles
            .filter(bubble => !mostReflectedBubbles.some(mb => mb.id === bubble.id))
            .map((bubble, index) => {
              // Calculate position based on index for circular arrangement
              const angle = (index / bubbles.length) * 2 * Math.PI;
              const orbitRadius = 200; // outer orbit radius
              const delay = index * 0.3; // stagger animation
              const size = getBubbleSize(bubble.reflect_count || 0);
              const isSelected = selectedBubbleId === bubble.id;
              const hasRipple = rippleBubbleId === bubble.id;
              
              return (
                <TooltipProvider key={bubble.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`absolute bubble cursor-pointer ${getReflectionClass(bubble.reflect_count || 0)} ${getGlowClass(bubble.reflect_count || 0)} ${
                          isSelected ? 'bubble-zoom-in' : 
                          selectedBubbleId ? 'bubble-fade-out' : ''
                        } ${hasRipple ? 'animate-ripple' : ''}`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          left: `calc(50% + ${orbitRadius * Math.cos(angle)}px)`, 
                          top: `calc(50% + ${orbitRadius * Math.sin(angle)}px)`,
                          animationDelay: `${delay}s`,
                          zIndex: isSelected ? 50 : 1
                        }}
                        onClick={() => handleBubbleClick(bubble.id)}
                      >
                        <span className="text-xs font-medium truncate max-w-full px-1">
                          {bubble.name?.substring(0, 8) || bubble.topic?.substring(0, 8)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{bubble.topic}</p>
                      <p className="text-xs">{bubble.reflect_count || 0} reflects</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine bubble size based on reflect count
const getBubbleSize = (reflectCount: number): number => {
  if (reflectCount >= 10) return 80;
  if (reflectCount >= 5) return 70;
  if (reflectCount >= 3) return 60;
  return 50;
};

// Helper function to get classes based on reflection count
const getReflectionClass = (reflectCount: number): string => {
  if (reflectCount >= 10) {
    return "bg-bubble-yellow text-white animate-pulse border-2 border-bubble-yellow-dark";
  }
  if (reflectCount >= 5) {
    return "bg-bubble-yellow-light text-bubble-yellow-dark border border-bubble-yellow";
  }
  if (reflectCount >= 1) {
    return "bg-yellow-50 text-gray-700 border border-yellow-200";
  }
  return "bg-gray-100 text-gray-600 border border-gray-200";
};

// Helper function to get glow class based on reflection count
const getGlowClass = (reflectCount: number): string => {
  if (reflectCount >= 10) {
    return "glow-strong";
  }
  if (reflectCount >= 5) {
    return "glow-medium";
  }
  if (reflectCount >= 1) {
    return "glow-light";
  }
  return "";
};

export default BubbleOrbit;
