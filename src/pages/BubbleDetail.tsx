
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send } from "lucide-react";
import ReflectButton from "@/components/ReflectButton";
import { useReflectionStatus } from "@/hooks/useReflectionStatus";
import { Bubble } from "@/types/bubble";

// Type for bubble messages
interface BubbleMessage {
  id: string;
  bubble_id: string;
  content: string | null;
  message: string;
  username: string | null;
  created_at: string;
}

const BubbleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [messages, setMessages] = useState<BubbleMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isReflected } = useReflectionStatus(id || "");

  // Check if this is a mock bubble ID (non-UUID format)
  const isMockId = id ? id.startsWith('mock-') : false;
  
  // Mock data for testing
  const mockMessages: BubbleMessage[] = [
    {
      id: "mock-msg-1",
      bubble_id: id || "",
      content: "This is a mock message for testing",
      message: "This is a mock message for testing",
      username: "TestUser",
      created_at: new Date().toISOString(),
    },
    {
      id: "mock-msg-2",
      bubble_id: id || "",
      content: "Another mock message for testing",
      message: "Another mock message for testing",
      username: "AnotherUser",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    }
  ];

  // Fetch bubble details
  useEffect(() => {
    const fetchBubble = async () => {
      try {
        if (!id) return;
        
        if (isMockId) {
          // For mock bubbles, create a mock bubble object
          setBubble({
            id: id,
            topic: `Mock Bubble ${id.split('-')[1]}`,
            name: `Mock Bubble ${id.split('-')[1]}`,
            description: "This is a mock bubble for testing",
            reflect_count: Math.floor(Math.random() * 15),
            username: "MockUser",
            created_at: new Date().toISOString(),
          } as Bubble);
          setIsLoading(false);
          return;
        }
        
        // For real bubbles, fetch from Supabase
        const { data, error } = await supabase
          .from('bubbles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setBubble(data as Bubble);
      } catch (error) {
        console.error("Error fetching bubble:", error);
        toast({
          title: "Error",
          description: "Failed to load bubble details. Please try again later.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBubble();

    // Subscribe to real-time updates for bubbles
    if (!isMockId && id) {
      const bubbleChannel = supabase
        .channel(`bubble-updates-${id}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'bubbles', filter: `id=eq.${id}` },
          (payload) => {
            setBubble(payload.new as Bubble);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(bubbleChannel);
      };
    }
  }, [id, toast, navigate, isMockId]);

  // Fetch messages and set up real-time subscription
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!id) return;
        
        if (isMockId) {
          // For mock bubbles, use mock messages
          setMessages(mockMessages);
          return;
        }
        
        // For real bubbles, fetch from Supabase
        const { data, error } = await supabase
          .from('bubble_messages')
          .select('*')
          .eq('bubble_id', id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchMessages();
    
    // Subscribe to real-time updates
    if (!isMockId && id) {
      const messagesChannel = supabase
        .channel(`messages-${id}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'bubble_messages', filter: `bubble_id=eq.${id}` },
          (payload) => {
            console.log('New message received:', payload.new);
            setMessages(currentMessages => [...currentMessages, payload.new as BubbleMessage]);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [id, toast, isMockId, mockMessages]);
  
  // Handle message submission
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to send messages.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isMockId) {
        // For mock bubbles, just add to local state
        const mockMessage: BubbleMessage = {
          id: `mock-msg-${Date.now()}`,
          bubble_id: id || "",
          content: newMessage.trim(),
          message: newMessage.trim(),
          username: user?.username || 'You',
          created_at: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, mockMessage]);
        setNewMessage("");
        return;
      }
      
      // For real bubbles, send to Supabase
      const messageData = {
        bubble_id: id,
        content: newMessage.trim(),
        message: newMessage.trim(),
        username: user?.username || 'Anonymous',
        user_id: user.id
      };
      
      console.log("Sending message:", messageData);
      
      const { error } = await supabase
        .from('bubble_messages')
        .insert(messageData);
      
      if (error) throw error;
      
      setNewMessage("");
      
      // No need to update messages here as the real-time subscription will handle it
    } catch (error) {
      console.error("Error submitting message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bubble-yellow"></div>
      </div>
    );
  }
  
  if (!bubble) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Bubble not found</h2>
        <p className="mb-6">The bubble you're looking for doesn't exist or has popped!</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/")} size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Bubble: {bubble?.topic}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{bubble?.name}</CardTitle>
              <CardDescription>
                Created by {bubble?.username} on {bubble?.created_at && format(new Date(bubble.created_at), 'PP')}
              </CardDescription>
              {bubble?.description && (
                <p className="text-gray-600 mt-2">{bubble.description}</p>
              )}
            </div>
            {bubble && (
              <ReflectButton 
                bubbleId={bubble.id}
                reflectCount={bubble.reflect_count || 0}
                initialReflected={isReflected}
              />
            )}
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Conversation about this bubble
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Be the first to start the conversation!</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">User</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[150px] text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {message.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{message.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>{message.content || message.message}</TableCell>
                        <TableCell className="text-right">
                          {format(new Date(message.created_at), 'HH:mm, MMM d')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <form onSubmit={handleSubmitMessage} className="pt-4">
              <div className="flex gap-2">
                <Textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isAuthenticated ? "Type your message here..." : "Login to send messages"}
                  className="flex-1"
                  disabled={!isAuthenticated || isSubmitting}
                />
                <Button 
                  type="submit" 
                  disabled={!isAuthenticated || !newMessage.trim() || isSubmitting}
                  className="self-end"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BubbleDetail;
