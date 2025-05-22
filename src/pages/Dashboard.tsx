
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BubbleItem from "@/components/BubbleItem";

// Mock data for bubbles
const MOCK_BUBBLES = [
  {
    id: "bubble-1",
    content: "Just launched a new feature! Check it out at bubbletrouble.com/new",
    user: {
      id: "user-1",
      username: "sarah_dev",
      avatarUrl: "",
    },
    createdAt: new Date().toISOString(),
    likesCount: 24,
    commentsCount: 5,
  },
  {
    id: "bubble-2",
    content: "Looking for beta testers for my new app. Anyone interested?",
    user: {
      id: "user-2",
      username: "tech_mike",
      avatarUrl: "",
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likesCount: 12,
    commentsCount: 8,
  },
  {
    id: "bubble-3",
    content: "Just finished reading an amazing book on AI. Highly recommended!",
    user: {
      id: "user-3",
      username: "bookworm_ai",
      avatarUrl: "",
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    likesCount: 18,
    commentsCount: 2,
  },
  {
    id: "bubble-4",
    content: "This is where we'll integrate 3D content later. Imagine a cool 3D bubble right here!",
    user: {
      id: "user-4",
      username: "design_pro",
      avatarUrl: "",
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    likesCount: 32,
    commentsCount: 7,
  },
];

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

// Dashboard page
const Dashboard = () => {
  const [bubbles, setBubbles] = useState(MOCK_BUBBLES);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Bubble Feed</h1>
      </div>
      
      <ThreeDPlaceholder />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Latest Bubbles</CardTitle>
          <CardDescription>
            Ephemeral content that will pop soon. Catch them while you can!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bubbles.map((bubble) => (
              <BubbleItem key={bubble.id} bubble={bubble} />
            ))}
          </div>
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
