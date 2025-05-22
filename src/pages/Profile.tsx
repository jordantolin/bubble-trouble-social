
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
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
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Account settings will be implemented in a future update once Supabase is integrated.
              </p>
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
