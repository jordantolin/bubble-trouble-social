
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import './BubbleOrbit.css';
import { Bubble } from '@/types/bubble';
import BubbleWorld from './BubbleWorld';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import BubbleLogo from './BubbleLogo';

interface BubbleOrbitProps {
  bubbles: Bubble[];
  mostReflectedBubbles: Bubble[];
  onCreateBubble: () => void;
}

const BubbleOrbit: React.FC<BubbleOrbitProps> = ({ bubbles, mostReflectedBubbles, onCreateBubble }) => {
  const [view, setView] = useState<'all' | 'trending'>('all');
  
  // Decide which bubbles to show based on view
  const bubblesForDisplay = view === 'all' ? bubbles : mostReflectedBubbles;

  return (
    <div className="relative h-full flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant={view === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setView('all')}
            className={`rounded-full ${view === 'all' ? 'bg-[#FFD500] hover:bg-[#F5C000] text-white' : 'border-[#FFD500] text-[#FFD500] hover:bg-[#FFD500]/10'}`}
          >
            All Bubbles
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant={view === 'trending' ? "default" : "outline"}
            size="sm"
            onClick={() => setView('trending')}
            className={`rounded-full ${view === 'trending' ? 'bg-[#FFD500] hover:bg-[#F5C000] text-white' : 'border-[#FFD500] text-[#FFD500] hover:bg-[#FFD500]/10'}`}
          >
            Trending
          </Button>
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <BubbleLogo className="h-10 w-10" />
      </div>
      
      <div className="h-full w-full">
        <BubbleWorld bubbles={bubblesForDisplay} />
      </div>
      
      <motion.div 
        className="absolute bottom-6 right-6 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button 
          size="lg" 
          className="h-12 w-12 rounded-full bg-[#FFD500] hover:bg-[#F5C000] shadow-lg text-white"
          onClick={onCreateBubble}
        >
          <Plus size={24} />
        </Button>
      </motion.div>
    </div>
  );
};

export default BubbleOrbit;
