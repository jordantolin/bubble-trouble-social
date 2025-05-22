
import React, { useEffect, useState } from "react";
import { useGamification } from "@/contexts/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";

const StreakAnimation = () => {
  const { showStreakAnimation, profile } = useGamification();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (showStreakAnimation) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [showStreakAnimation]);
  
  if (!profile) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-8 z-50 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-bold">+1</span>
          <span className="text-xl animate-pulse">🔥</span>
          <span className="font-medium">Day {profile.streak_days} Streak!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakAnimation;
