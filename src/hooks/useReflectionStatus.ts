
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useReflectionStatus = (bubbleId: string) => {
  const [isReflected, setIsReflected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Check if this is a mock bubble ID (non-UUID format)
  const isMockId = bubbleId ? bubbleId.startsWith('mock-') : false;

  useEffect(() => {
    const checkReflectionStatus = async () => {
      // Early return if no user or username or bubbleId
      if (!user?.id || !user?.username || !bubbleId) {
        setIsLoading(false);
        return;
      }

      // For mock bubbles, use random reflection status
      if (isMockId) {
        setIsReflected(Math.random() > 0.5);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Checking reflection status for", bubbleId, "user:", user.username);
        const { data, error } = await supabase
          .from("reflects")
          .select("*")
          .eq("bubble_id", bubbleId)
          .eq("username", user.username)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking reflection status:", error);
        }

        console.log("Reflection status result:", data);
        setIsReflected(!!data);
      } catch (error) {
        console.error("Failed to check reflection status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkReflectionStatus();

    // Set up realtime subscription for this user's reflects on this bubble
    if (!isMockId && user?.username) {
      const channel = supabase
        .channel(`reflect-status-${bubbleId}-${user.username}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'reflects', 
            filter: `bubble_id=eq.${bubbleId}` 
          },
          (payload) => {
            const payloadData = payload.new as { username?: string };
            if (payloadData && payloadData.username === user.username) {
              setIsReflected(true);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [bubbleId, user?.username, user?.id, isMockId]);

  return { isReflected, isLoading };
};
