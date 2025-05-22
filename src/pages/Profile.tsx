
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/contexts/GamificationContext";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const { profile } = useGamification();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };
  
  const calculateXPProgress = () => {
    if (!profile) return 0;
    return (profile.points % 100);
  };
  
  const calculateXPToNextLevel = () => {
    if (!profile) return 100;
    return 100 - (profile.points % 100);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="bubbles">My Bubbles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-5">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="bg-bubble-yellow text-white text-xl">
                    {formData.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{formData.username}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {formData.bio && (
                    <p className="mt-2 text-sm">{formData.bio}</p>
                  )}
                </div>
                
                {profile && (
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-bubble-yellow text-white">Level {profile.level}</Badge>
                      <span className="text-xs text-muted-foreground">{calculateXPProgress()} / 100 XP</span>
                    </div>
                    <Progress value={calculateXPProgress()} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                    <Input
                      id="avatarUrl"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL for your profile picture (will be replaced with direct upload in future)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-bubble-yellow hover:bg-bubble-yellow-dark text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="gamification">
          <Card>
            <CardHeader>
              <CardTitle>Gamification Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-bubble-yellow text-white px-3 py-1 text-lg">Level {profile.level}</Badge>
                        <span className="text-sm">{calculateXPProgress()} / 100 XP</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{calculateXPToNextLevel()} XP needed for next level</span>
                    </div>
                    <Progress value={calculateXPProgress()} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-1">{profile.points}</div>
                          <p className="text-sm text-muted-foreground">Total XP</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-1">{profile.bubble_points}</div>
                          <p className="text-sm text-muted-foreground">Bubble XP</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-1">{profile.message_points}</div>
                          <p className="text-sm text-muted-foreground">Message XP</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-1">
                            <span className="mr-1">{profile.streak_days}</span>
                            {profile.streak_days > 0 && <span className="text-xl">🔥</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">Day Streak</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">How to earn XP</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Create a bubble: +10 XP</li>
                      <li>• Send a message: +2 XP</li>
                      <li>• Reflect on a bubble: +5 XP</li>
                      <li>• Daily login streak: +3 XP</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No gamification data available yet. Start interacting with bubbles to earn XP!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bubbles">
          <Card>
            <CardHeader>
              <CardTitle>My Bubbles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your created bubbles will appear here once Supabase real-time data is integrated.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
