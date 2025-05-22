import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import BubbleItem from "@/components/BubbleItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReflectButton from "@/components/ReflectButton";
import { useReflectionStatus } from "@/hooks/useReflectionStatus";

// Placeholder component for future 3D integration
const ThreeDPlaceholder = () => (
  <div className="relative h-48 rounded-lg bg-gradient-to-r from-bubble-yellow-light to-bubble-yellow border border-dashed border-bubble-yellow-dark p-4 flex items-center justify-center mb-6">
    <div className="text-center">
      <p className="text-sm font-medium text-bubble-yellow-dark mb-2">
        3D Content Placeholder
      </p>
      <p className="text-xs text-gray-500">
        Future integration for interactive 3D bubbles
      </p>
    </div>
  </div>
);

// Type for bubble data from Supabase
interface Bubble {
  id: string;
  name: string;
  topic: string;
  description: string | null;
  username: string;
  created_at: string;
  expires_at: string;
  size: string;
  reflect_count: number | null;
}

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
          size: 'sm', // Default size
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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  
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
      .channel('public:bubbles')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bubbles' },
        (payload) => {
          setBubbles(currentBubbles => [payload.new as Bubble, ...currentBubbles]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bubbles' },
        (payload) => {
          const updatedBubble = payload.new as Bubble;
          
          // Update in regular bubbles
          setBubbles(currentBubbles => 
            currentBubbles.map(bubble => 
              bubble.id === updatedBubble.id ? updatedBubble : bubble
            )
          );
          
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
  }, [toast]);

  // Render a bubble item
  const renderBubbleItem = (bubble: Bubble, isReflected = false) => {
    // Calculate a size multiplier based on reflection count
    const sizeClass = bubble.reflect_count && bubble.reflect_count > 10 
      ? "border-2 border-bubble-yellow-dark bg-bubble-yellow-light" 
      : bubble.reflect_count && bubble.reflect_count > 5
        ? "border border-bubble-yellow" 
        : "";
    
    return (
      <div 
        key={bubble.id} 
        className={`p-4 border rounded-lg hover:bg-gray-50 transition ${sizeClass}`}
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
        <div 
          className="space-y-2 cursor-pointer"
          onClick={() => navigate(`/bubble/${bubble.id}`)}
        >
          <p className="text-sm font-medium">Topic: {bubble.topic}</p>
          {bubble.description && (
            <p className="text-sm text-gray-600">{bubble.description}</p>
          )}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {format(new Date(bubble.created_at), 'PPp')}</span>
            <span>Reflections: {bubble.reflect_count || 0}</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Bubble Feed</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Bubble</Button>
          </DialogTrigger>
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
      </div>
      
      <ThreeDPlaceholder />
      
      {/* Most Reflected Bubbles Section */}
      {mostReflectedBubbles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Most Reflected</CardTitle>
            <CardDescription>
              Bubbles that have resonated most with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostReflectedBubbles.map((bubble) => renderBubbleItem(bubble, true))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Latest Bubbles Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Latest Bubbles</CardTitle>
          <CardDescription>
            Ephemeral content that will pop soon. Catch them while you can!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <p>Loading bubbles...</p>
            </div>
          ) : bubbles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No bubbles found. Create the first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bubbles.map((bubble) => renderBubbleItem(bubble))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Suggested Connections</CardTitle>
          <CardDescription>People you might want to connect with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {["alex_designer", "maria_code", "dev_john"].map((name, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-bubble-yellow text-white">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm font-medium">{name}</p>
                  <Button variant="outline" size="sm" className="mt-1">
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
