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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BubbleOrbit from "@/components/BubbleOrbit";
import ReflectButton from "@/components/ReflectButton";
import { Bubble } from "@/types/bubble";
import { Search } from "lucide-react";

// Create Bubble Form Component
const CreateBubbleForm = ({ onClose }: { onClose: () => void }) => {
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    setIsSubmitting(true);
    
    try {
      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Insert new bubble
      const { data, error } = await supabase
        .from('bubbles')
        .insert({
          topic,
          name,
          description: description || null,
          username: user?.username || user?.email?.split('@')[0] || '',
          expires_at: expiresAt.toISOString(),
          size: 'sm', // Default size as string to match DB
          message: "", // Adding this to fix the TypeScript error
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your bubble has been created",
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating bubble:", error);
      toast({
        title: "Error",
        description: "Failed to create bubble. Please try again.",
        variant: "destructive",
      });
    } finally {
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
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input 
          id="topic" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What's your bubble about?"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about your bubble"
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Bubble"}
        </Button>
      </div>
    </form>
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
              className="w-full pl-8 h-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 rounded-md"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFullView(!showFullView)}
            className="text-sm"
          >
            {showFullView ? "Show List View" : "Show 3D View"}
          </Button>
        </div>
      </div>
      
      {/* Enhanced Animated Bubble Orbit View with Dialog Integration */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <p>Loading bubbles...</p>
        </div>
      ) : filteredBubbles.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">
            {searchTerm ? "No bubbles found matching your search." : "No bubbles found. Create the first one!"}
          </p>
        </div>
      ) : (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Bubble</DialogTitle>
                <DialogDescription>
                  Add a new topic for discussion. Bubbles last for 7 days before they pop!
                </DialogDescription>
              </DialogHeader>
              <CreateBubbleForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          {showFullView ? (
            <div className="h-[60vh] border rounded-lg overflow-hidden">
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
        <Card className="mt-8">
          <CardHeader className="pb-3">
            <CardTitle>All Bubbles</CardTitle>
            <CardDescription>
              {searchTerm ? `Search results for "${searchTerm}"` : "All active bubbles listed in chronological order"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBubbles.map((bubble) => (
                <div 
                  key={bubble.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/bubble/${bubble.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{bubble.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
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
          </CardContent>
        </Card>
      )}
      
      {/* Move suggested connections to a corner card */}
      <Card className="mt-8 max-w-xs ml-auto">
        <CardHeader className="pb-2">
          <CardTitle>Suggested Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["alex_designer", "maria_code", "dev_john"].map((name, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-bubble-yellow text-white">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium">{name}</p>
                  <Button variant="outline" size="sm" className="mt-1 h-6 text-xs py-0">
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
