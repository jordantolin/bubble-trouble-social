
import React, { useEffect, useState } from "react";
import { useGamification } from "@/contexts/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";

const StreakNotice = () => {
  const { showStreakAnimation, profile } = useGamification();
  const [visible, setVisible] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  
  useEffect(() => {
    if (showStreakAnimation) {
      setVisible(true);
      setShowXpGain(true);
      
      const xpTimer = setTimeout(() => {
        setShowXpGain(false);
      }, 1500);
      
      const visibleTimer = setTimeout(() => {
        setVisible(false);
      }, 2800);
      
      return () => {
        clearTimeout(xpTimer);
        clearTimeout(visibleTimer);
      };
    }
  }, [showStreakAnimation]);
  
  if (!profile) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-8 z-50 flex flex-col items-end gap-2"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
          >
            <span className="font-bold">Day {profile.streak_days}</span>
            <span className="text-xl animate-pulse">🔥</span>
            <span className="font-medium">Streak!</span>
          </motion.div>
          
          <AnimatePresence>
            {showXpGain && (
              <motion.div
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg shadow-sm text-sm font-medium"
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                +3 XP
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakNotice;
