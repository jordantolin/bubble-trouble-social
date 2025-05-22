
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import './BubbleOrbit.css';
import { Bubble } from '@/types/bubble';
import BubbleWorld from './BubbleWorld';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

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
        <Button 
          variant={view === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setView('all')}
          className="rounded-full"
        >
          All Bubbles
        </Button>
        <Button 
          variant={view === 'trending' ? "default" : "outline"}
          size="sm"
          onClick={() => setView('trending')}
          className="rounded-full"
        >
          Trending
        </Button>
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
          className="h-12 w-12 rounded-full bg-bubble-yellow shadow-lg"
          onClick={onCreateBubble}
        >
          <Plus size={24} />
        </Button>
      </motion.div>
    </div>
  );
};

export default BubbleOrbit;
