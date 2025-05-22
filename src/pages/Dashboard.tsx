
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BubbleOrbit from "@/components/BubbleOrbit";
import ReflectButton from "@/components/ReflectButton";
import { Bubble } from "@/types/bubble";
import { Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Updated Topic categories for bubbles with enhanced list
const TOPIC_CATEGORIES = [
  "AI & Technology",
  "Philosophy",
  "Mental Health",
  "Creativity & Art",
  "Spirituality",
  "Personal Growth",
  "Relationships",
  "Startups & Innovation",
  "Consciousness",
  "Dreams & Symbolism",
  "Quantum Physics",
  "Nature & Ecology",
  "Mysticism",
  "Gaming & Virtual Worlds",
  "Society & Culture",
  "Emotions & Self-Awareness",
  "Science & Curiosity",
  "Time & Perception",
  "Cosmic Theories",
  "Other"
];

// Create Bubble Form Component
const CreateBubbleForm = ({ onClose }: { onClose: () => void }) => {
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !name) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create bubbles",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      console.log("Creating bubble with author_id:", user.id, "and username:", user.username);
      
      // Insert new bubble with correct fields
      const { data, error } = await supabase
        .from('bubbles')
        .insert({
          topic,
          name,
          description: description || null,
          username: user.username || 'Anonymous',
          author_id: user.id,
          expires_at: expiresAt.toISOString(),
          size: 'sm',
        })
        .select();
      
      if (error) throw error;
      
      console.log("Bubble created successfully:", data);
      
      // Show success animation
      setIsSuccess(true);
      
      toast({
        title: "Success!",
        description: "Your bubble has been created",
      });
      
      // Close modal after brief delay to show success state
      setTimeout(() => {
        onClose();
        // Reset form fields
        setName("");
        setTopic("");
        setDescription("");
        setIsSubmitting(false);
        setIsSuccess(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating bubble:", error);
      toast({
        title: "Error creating bubble",
        description: error.message || "Failed to create bubble. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Bubble Name</Label>
        <Input 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Give your bubble a name"
          className="border-[#FFD500] focus:ring-[#FFD500]"
          required
          disabled={isSubmitting || isSuccess}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        {/* Fixed dropdown implementation with proper onValueChange and value binding */}
        <Select
          value={topic}
          onValueChange={setTopic}
          disabled={isSubmitting || isSuccess}
        >
          <SelectTrigger id="topic" className="w-full border-[#FFD500] focus:ring-[#FFD500]">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {TOPIC_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category} className="cursor-pointer">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about your bubble"
          className="min-h-[100px] border-[#FFD500] focus:ring-[#FFD500]"
          disabled={isSubmitting || isSuccess}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button 
            variant="outline" 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting || isSuccess}
            className="border-[#FFD500] text-[#FFD500] hover:bg-[#FFD500]/10"
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button 
            type="submit" 
            disabled={isSubmitting || isSuccess}
            className={`bg-[#FFD500] hover:bg-[#F5C000] text-white relative ${isSuccess ? 'animate-pulse' : ''}`}
          >
            {isSubmitting ? "Creating..." : isSuccess ? "Created!" : "Create Bubble"}
          </Button>
        </motion.div>
      </div>
    </form>
  );
};

// Empty State Component
const EmptyBubbleState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 mb-6 relative">
        <div className="animate-bubble-float absolute w-16 h-16 rounded-full bg-[#F9C80E] opacity-60 left-4"></div>
        <div className="animate-bubble-float absolute w-12 h-12 rounded-full bg-[#F9C80E] opacity-80 right-0 top-4" style={{ animationDelay: '0.5s' }}></div>
        <div className="animate-bubble-float absolute w-8 h-8 rounded-full bg-[#F9C80E] opacity-70 left-2 bottom-0" style={{ animationDelay: '1s' }}></div>
      </div>
      <h3 className="text-xl font-semibold mb-2">No Bubbles Yet</h3>
      <p className="text-gray-500 max-w-xs">Create your first bubble to start a conversation or try a different search term</p>
    </div>
  );
};

// Dashboard page
const Dashboard = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [mostReflectedBubbles, setMostReflectedBubbles] = useState<Bubble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFullView, setShowFullView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBubbles, setFilteredBubbles] = useState<Bubble[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Handle search params from URL
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);
  
  // Search function to filter bubbles
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBubbles(bubbles);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const results = bubbles.filter(bubble => 
      (bubble.topic && bubble.topic.toLowerCase().includes(searchTermLower)) ||
      (bubble.name && bubble.name.toLowerCase().includes(searchTermLower)) ||
      (bubble.username && bubble.username.toLowerCase().includes(searchTermLower))
    );
    
    setFilteredBubbles(results);
  }, [searchTerm, bubbles]);
  
  // Fetch bubbles from Supabase
  useEffect(() => {
    const fetchBubbles = async () => {
      try {
        // Get regular bubbles
        const { data: regularData, error: regularError } = await supabase
          .from('bubbles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (regularError) throw regularError;
        
        setBubbles(regularData || []);
        setFilteredBubbles(regularData || []);

        // Get most reflected bubbles
        const { data: reflectedData, error: reflectedError } = await supabase
          .from('bubbles')
          .select('*')
          .order('reflect_count', { ascending: false })
          .gt('reflect_count', 0)
          .limit(5);

        if (reflectedError) throw reflectedError;
        
        setMostReflectedBubbles(reflectedData || []);
      } catch (error) {
        console.error("Error fetching bubbles:", error);
        toast({
          title: "Error",
          description: "Failed to load bubbles. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBubbles();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('bubbles-dashboard')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bubbles' },
        (payload) => {
          console.log('New bubble inserted:', payload.new);
          setBubbles(currentBubbles => {
            const newBubbles = [payload.new as Bubble, ...currentBubbles];
            setFilteredBubbles(prev => {
              const searchTermLower = searchTerm.toLowerCase();
              if (!searchTerm) return newBubbles;
              
              return newBubbles.filter(bubble => 
                (bubble.topic && bubble.topic.toLowerCase().includes(searchTermLower)) ||
                (bubble.name && bubble.name.toLowerCase().includes(searchTermLower)) ||
                (bubble.username && bubble.username.toLowerCase().includes(searchTermLower))
              );
            });
            return newBubbles;
          });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bubbles' },
        (payload) => {
          console.log('Bubble updated:', payload.new);
          const updatedBubble = payload.new as Bubble;
          
          // Update in regular bubbles
          setBubbles(currentBubbles => {
            const updatedBubbles = currentBubbles.map(bubble => 
              bubble.id === updatedBubble.id ? updatedBubble : bubble
            );
            
            setFilteredBubbles(prev => {
              const searchTermLower = searchTerm.toLowerCase();
              if (!searchTerm) return updatedBubbles;
              
              return updatedBubbles.filter(bubble => 
                (bubble.topic && bubble.topic.toLowerCase().includes(searchTermLower)) ||
                (bubble.name && bubble.name.toLowerCase().includes(searchTermLower)) ||
                (bubble.username && bubble.username.toLowerCase().includes(searchTermLower))
              );
            });
            
            return updatedBubbles;
          });
          
          // Update in most reflected bubbles
          setMostReflectedBubbles(currentBubbles => {
            // Check if the bubble exists in most reflected bubbles
            const exists = currentBubbles.some(b => b.id === updatedBubble.id);
            
            if (exists) {
              // If exists, update it
              return currentBubbles
                .map(b => b.id === updatedBubble.id ? updatedBubble : b)
                .sort((a, b) => (b.reflect_count || 0) - (a.reflect_count || 0));
            } else if ((updatedBubble.reflect_count || 0) > 0) {
              // If doesn't exist but has reflections, add it and sort
              return [...currentBubbles, updatedBubble]
                .sort((a, b) => (b.reflect_count || 0) - (a.reflect_count || 0))
                .slice(0, 5);
            }
            
            return currentBubbles;
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, searchTerm]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Bubble Feed</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search bubbles or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 h-9 bg-slate-100 dark:bg-slate-800 border border-[#FFD500] rounded-md focus:ring-[#FFD500] focus:border-[#FFD500]"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#FFD500]" size={16} />
          </div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button 
              variant="outline" 
              onClick={() => setShowFullView(!showFullView)}
              className="text-sm border-[#FFD500] text-[#FFD500] hover:bg-[#FFD500]/10"
            >
              {showFullView ? "Show List View" : "Show 3D View"}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced Animated Bubble Orbit View with Dialog Integration */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-16 h-16 rounded-full border-4 border-t-[#FFD500] border-b-[#FFD500] border-r-transparent border-l-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            // Reset form state when closing dialog manually
            if (!open) {
              setDialogOpen(false);
            } else {
              setDialogOpen(true);
            }
          }}>
            <DialogContent className="bg-gradient-to-b from-white to-[#FFFCF0] border-[#FFD500]/20 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Create a New Bubble</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add a new topic for discussion. Bubbles last for 7 days before they pop!
                </DialogDescription>
              </DialogHeader>
              <CreateBubbleForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          {showFullView ? (
            <div className="h-[60vh] border rounded-lg overflow-hidden bg-gradient-to-b from-[#FFF7DB] to-[#F9F3E5]">
              <BubbleOrbit 
                bubbles={filteredBubbles} 
                mostReflectedBubbles={mostReflectedBubbles} 
                onCreateBubble={() => setDialogOpen(true)} 
              />
            </div>
          ) : null}
        </>
      )}
      
      {/* List View of Bubbles (now conditionally rendered) */}
      {!showFullView && (
        <Card className="mt-8 border-[#F9C80E]/20">
          <CardHeader className="pb-3">
            <CardTitle>All Bubbles</CardTitle>
            <CardDescription>
              {searchTerm ? `Search results for "${searchTerm}"` : "All active bubbles listed in chronological order"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBubbles.length > 0 ? (
              <div className="space-y-4">
                {filteredBubbles.map((bubble) => (
                  <div 
                    key={bubble.id} 
                    className="p-4 border border-[#F9C80E]/20 rounded-lg hover:bg-[#FFFDF5] transition cursor-pointer"
                    onClick={() => navigate(`/bubble/${bubble.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#F9C80E] text-white">
                            {bubble.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{bubble.name}</h3>
                          <p className="text-sm text-gray-500">By {bubble.username}</p>
                        </div>
                      </div>
                      <ReflectButton 
                        bubbleId={bubble.id} 
                        reflectCount={bubble.reflect_count || 0}
                      />
                    </div>
                    <p className="text-sm font-medium">Topic: {bubble.topic}</p>
                    {bubble.description && (
                      <p className="text-sm text-gray-600">{bubble.description}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Reflections: {bubble.reflect_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBubbleState />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
