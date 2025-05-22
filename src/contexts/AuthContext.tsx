
import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Mock auth functions (to be replaced with Supabase)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock successful login
      if (email && password) {
        const mockUser = {
          id: "user-123",
          email,
          username: email.split('@')[0],
        };
        
        setUser(mockUser);
        localStorage.setItem('bubble_user', JSON.stringify(mockUser));
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock successful registration
      if (email && password && username) {
        const mockUser = {
          id: "user-" + Math.floor(Math.random() * 1000),
          email,
          username,
        };
        
        setUser(mockUser);
        localStorage.setItem('bubble_user', JSON.stringify(mockUser));
        toast({
          title: "Account created!",
          description: "Welcome to Bubble Trouble.",
        });
      } else {
        throw new Error("Please fill in all required fields");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bubble_user');
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };
  
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('bubble_user', JSON.stringify(updatedUser));
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for existing session on mount
  useState(() => {
    const storedUser = localStorage.getItem('bubble_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  });
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
