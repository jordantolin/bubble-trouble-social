
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, 
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { Home, Users, MessageCircle, Settings, Search, Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BubbleWorld from "@/components/BubbleWorld";
import { useMockBubbles } from "@/hooks/useMockBubbles";
import StreakAnimation from "@/components/StreakAnimation";
import XPProgressBar from "@/components/XPProgressBar";
import { useState } from "react";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import BubbleDetail from "./pages/BubbleDetail";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const MainLayout = () => {
  const { bubbles } = useMockBubbles(20);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate("/?search=" + encodeURIComponent(searchTerm));
      // The search functionality is handled in the Dashboard component
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar className="border-r border-slate-200 dark:border-slate-800 transition-all duration-300">
        <SidebarContent className="pt-5">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-bubble-yellow flex items-center justify-center">
                <span className="text-white font-bold">BT</span>
              </div>
              <h2 className="font-bold text-lg">Bubble Trouble</h2>
            </div>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/" className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-2 rounded-md ${isActive ? 'bg-bubble-yellow/20 text-bubble-yellow-dark' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
                    }>
                      <Home size={18} />
                      <span>Home</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/profile" className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-2 rounded-md ${isActive ? 'bg-bubble-yellow/20 text-bubble-yellow-dark' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
                    }>
                      <Users size={18} />
                      <span>Profile</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/messages" className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-2 rounded-md ${isActive ? 'bg-bubble-yellow/20 text-bubble-yellow-dark' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
                    }>
                      <MessageCircle size={18} />
                      <span>Messages</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/settings" className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-2 rounded-md ${isActive ? 'bg-bubble-yellow/20 text-bubble-yellow-dark' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
                    }>
                      <Settings size={18} />
                      <span>Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4">
              <Menu size={20} />
            </SidebarTrigger>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search bubbles..." 
                className="w-full pl-8 h-9 bg-slate-100 dark:bg-slate-800 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </Button>
            
            <div className="flex items-center gap-2">
              <XPProgressBar compact />
              
              <Avatar>
                <AvatarFallback className="bg-bubble-yellow text-white">
                  {user?.username?.charAt(0).toUpperCase() || "BT"}
                </AvatarFallback>
                {user?.avatar_url && (
                  <AvatarImage src={user.avatar_url} alt={user.username || "User"} />
                )}
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main content area with Route content */}
        <div className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bubble/:id" element={<BubbleDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GamificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <StreakAnimation />
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/*" element={<MainLayout />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </GamificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
