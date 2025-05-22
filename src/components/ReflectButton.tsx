
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
  const [isReflected, setIsReflected] = useState(initialReflected);
  const [count, setCount] = useState(reflectCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleReflect = async () => {
    if (!user?.username || isReflected) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("reflects")
        .insert({
          bubble_id: bubbleId,
          username: user.username
        });
      
      if (error) throw error;
      
      setIsReflected(true);
      setCount(prev => prev + 1);
      
      toast({
        title: "Success!",
        description: "You've reflected this bubble.",
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
        className={isReflected ? "bg-gray-200 text-gray-700" : "bg-bubble-yellow hover:bg-bubble-yellow-dark text-white"}
      >
        {isLoading ? "Processing..." : isReflected ? "Reflected" : "Reflect"}
      </Button>
      <span className="text-sm font-medium">{count}</span>
    </div>
  );
};

export default ReflectButton;
