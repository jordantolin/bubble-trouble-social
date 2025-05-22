
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useReflectionStatus } from '@/hooks/useReflectionStatus';

interface ReflectButtonProps {
  bubbleId: string;
  reflectCount: number;
}

const ReflectButton = ({ bubbleId, reflectCount }: ReflectButtonProps) => {
  const [isReflecting, setIsReflecting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isReflected, isLoading } = useReflectionStatus(bubbleId);

  const handleReflect = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to detail page when clicking the button
    
    if (!user?.username) {
      toast({
        title: "Authentication required",
        description: "Please login to reflect on bubbles",
        variant: "destructive",
      });
      return;
    }
    
    if (isReflected) {
      return; // Already reflected
    }
    
    setIsReflecting(true);
    
    try {
      // Insert new reflection
      const { error } = await supabase
        .from("reflects")
        .insert({
          bubble_id: bubbleId,
          username: user.username,
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already reflected",
            description: "You've already reflected on this bubble",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Reflected!",
          description: "You've reflected on this bubble",
        });
      }
    } catch (error) {
      console.error("Error reflecting on bubble:", error);
      toast({
        title: "Error",
        description: "Failed to reflect on bubble",
        variant: "destructive",
      });
    } finally {
      setIsReflecting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Star className="h-4 w-4 mr-1" />
        <span>{reflectCount}</span>
      </Button>
    );
  }
  
  return (
    <Button
      variant={isReflected ? "secondary" : "outline"}
      size="sm"
      onClick={handleReflect}
      disabled={isReflecting || isReflected}
      className={isReflected ? "bg-bubble-yellow-light text-bubble-yellow-dark border-bubble-yellow hover:bg-bubble-yellow-light" : ""}
    >
      <Star 
        className={`h-4 w-4 mr-1 ${isReflected ? "fill-bubble-yellow-dark" : ""}`} 
      />
      <span>{reflectCount}</span>
    </Button>
  );
};

export default ReflectButton;
