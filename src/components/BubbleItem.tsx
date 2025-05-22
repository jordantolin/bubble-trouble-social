
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface Bubble {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

interface BubbleItemProps {
  bubble: Bubble;
}

const BubbleItem = ({ bubble }: BubbleItemProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(bubble.likesCount);
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  };
  
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-3">
        <Avatar>
          <AvatarImage src={bubble.user.avatarUrl} />
          <AvatarFallback className="bg-bubble-yellow text-white">
            {bubble.user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">@{bubble.user.username}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(bubble.createdAt)}</p>
            </div>
          </div>
          
          <p className="mt-2">{bubble.content}</p>
          
          <div className="mt-4 flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleLike} className={liked ? "text-red-500" : ""}>
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              {bubble.commentsCount}
            </Button>
            
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BubbleItem;
