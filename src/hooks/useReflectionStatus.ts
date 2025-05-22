
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useReflectionStatus = (bubbleId: string) => {
  const [isReflected, setIsReflected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkReflectionStatus = async () => {
      if (!user?.username || !bubbleId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("reflects")
          .select("*")
          .eq("bubble_id", bubbleId)
          .eq("username", user.username)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking reflection status:", error);
        }

        setIsReflected(!!data);
      } catch (error) {
        console.error("Failed to check reflection status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkReflectionStatus();
  }, [bubbleId, user?.username]);

  return { isReflected, isLoading };
};
