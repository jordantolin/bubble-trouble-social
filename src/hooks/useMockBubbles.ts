
import { useState, useEffect } from 'react';
import { Bubble } from '@/types/bubble';

export function useMockBubbles(count: number = 15) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  useEffect(() => {
    // Generate mock bubbles
    const mockTopics = [
      "Climate Change", "AI Ethics", "Space Exploration", 
      "Remote Work", "Renewable Energy", "Quantum Computing",
      "Mental Health", "Digital Privacy", "Future of Education",
      "Sustainable Fashion", "Blockchain", "Biotech Innovations",
      "Plant-Based Diet", "Urban Planning", "Creative Writing",
      "Global Economics", "Music Production", "Virtual Reality",
      "Minimalism", "Coffee Culture"
    ];
    
    const mockBubbles: Bubble[] = Array.from({ length: count }).map((_, index) => {
      const topic = mockTopics[index % mockTopics.length];
      const reflectCount = Math.floor(Math.random() * 20);
      
      return {
        id: `mock-${index}`,
        name: `Bubble ${index + 1}`,
        topic,
        description: `Discussion about ${topic.toLowerCase()} and related ideas.`,
        author_id: `user-${index % 5}`,
        username: `user${index % 5}`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        expires_at: new Date(Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        reflect_count: reflectCount,
        size: reflectCount > 10 ? 'lg' : reflectCount > 5 ? 'md' : 'sm'
      };
    });
    
    setBubbles(mockBubbles);
  }, [count]);
  
  return { bubbles };
}
