
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GamificationProfile {
  user_id: string;
  points: number;
  bubble_points: number;
  message_points: number;
  reflection_points: number;
  level: number;
  streak_days: number;
  last_active: string;
}

interface GamificationContextType {
  profile: GamificationProfile | null;
  loading: boolean;
  updateLastActive: () => Promise<void>;
  showStreakAnimation: boolean;
  previousStreak: number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);

  const fetchGamificationProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("gamification_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching gamification profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchGamificationProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateLastActive = async () => {
    if (!user?.id || !profile) return;
    
    try {
      // Store current streak to compare after update
      setPreviousStreak(profile.streak_days);
      
      const { data, error } = await supabase
        .from("gamification_profiles")
        .update({ last_active: new Date().toISOString() })
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Error updating last active:", error);
      }
    } catch (error) {
      console.error("Error in updateLastActive:", error);
    }
  };

  // Subscribe to realtime changes for the user's profile
  useEffect(() => {
    if (!user?.id) return;

    const profileSubscription = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gamification_profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newProfile = payload.new as GamificationProfile;
          
          // Check if streak has increased
          if (profile && newProfile.streak_days > profile.streak_days) {
            setShowStreakAnimation(true);
            
            // Show toast notification
            toast.success(`🔥 Day ${newProfile.streak_days} Streak!`, {
              description: "Keep coming back daily for more XP!",
              duration: 3000,
            });
            
            // Hide animation after 3 seconds
            setTimeout(() => setShowStreakAnimation(false), 3000);
          }
          
          setProfile(newProfile);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id, profile]);

  // Fetch initial profile data
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchGamificationProfile();
      
      // Update last_active on login
      updateLastActive();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  return (
    <GamificationContext.Provider
      value={{
        profile,
        loading,
        updateLastActive,
        showStreakAnimation,
        previousStreak
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};
