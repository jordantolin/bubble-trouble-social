
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Star, StarOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ReflectButtonProps {
  bubbleId: string;
  reflectCount: number;
  initialReflected?: boolean;
  onReflect?: () => void;
}

const ReflectButton = ({
  bubbleId,
  reflectCount,
  initialReflected = false,
  onReflect
}: ReflectButtonProps) => {
  const [isReflected, setIsReflected] = useState(initialReflected);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(reflectCount);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const handleReflect = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to reflect this bubble",
        variant: "destructive",
      });
      return;
    }

    if (isReflected) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("reflects")
        .insert({
          bubble_id: bubbleId,
          username: user.username,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already reflected",
            description: "You have already reflected this bubble",
          });
        } else {
          throw error;
        }
      } else {
        setIsReflected(true);
        setCount(prev => prev + 1);
        toast({
          title: "Bubble reflected",
          description: "Your reflection has been added",
        });
        if (onReflect) onReflect();
      }
    } catch (error) {
      console.error("Error reflecting bubble:", error);
      toast({
        title: "Reflection failed",
        description: "Failed to reflect bubble. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleReflect}
      disabled={isReflected || isLoading || !isAuthenticated}
      variant={isReflected ? "secondary" : "outline"}
      size="sm"
      className="gap-2"
    >
      {isReflected ? (
        <>
          <Star className="h-4 w-4 text-bubble-yellow-dark fill-current" />
          <span>Reflected</span>
          {count > 0 && <span className="text-xs">({count})</span>}
        </>
      ) : (
        <>
          <StarOff className="h-4 w-4" />
          <span>Reflect</span>
          {count > 0 && <span className="text-xs">({count})</span>}
        </>
      )}
    </Button>
  );
};

export default ReflectButton;
