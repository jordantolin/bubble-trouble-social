
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useReflectionStatus } from "@/hooks/useReflectionStatus";
import { useGamification } from "@/contexts/GamificationContext";

export interface ReflectButtonProps {
  bubbleId: string;
  reflectCount: number;
  initialReflected?: boolean;
}

const ReflectButton = ({ 
  bubbleId, 
  reflectCount,
  initialReflected = false
}: ReflectButtonProps) => {
  const [count, setCount] = useState(reflectCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isReflected } = useReflectionStatus(bubbleId);
  const { updateLastActive } = useGamification();
  
  // Keep local count in sync with reflectCount prop
  useEffect(() => {
    setCount(reflectCount);
  }, [reflectCount]);

  const handleReflect = async () => {
    if (!user?.id || !user?.username || isReflected) {
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to reflect bubbles.",
          variant: "destructive",
        });
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Reflecting bubble:", bubbleId, "by user:", user.username);
      
      const { error } = await supabase
        .from("reflects")
        .insert({
          bubble_id: bubbleId,
          username: user.username
        });
      
      if (error) throw error;
      
      setCount(prev => prev + 1);
      
      // Update last active to trigger potential streak
      await updateLastActive();
      
      toast({
        title: "Success!",
        description: "You've reflected this bubble.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to reflect",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Reflection error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isReflected ? "secondary" : "default"}
        size="sm"
        onClick={handleReflect}
        disabled={isReflected || isLoading || !user?.username}
        className={isReflected 
          ? "bg-gray-200 text-gray-700" 
          : "bg-gradient-to-r from-[#F9C80E] to-[#FFB700] hover:from-[#E6B800] hover:to-[#E9A800] text-white"
        }
      >
        {isLoading ? "Processing..." : isReflected ? "Reflected" : "Reflect"}
      </Button>
      <span className={`text-sm font-medium ${isReflected ? "text-[#F9C80E]" : ""}`}>
        {count}
      </span>
    </div>
  );
};

export default ReflectButton;
