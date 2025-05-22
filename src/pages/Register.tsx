
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import BubbleLogo from "../components/BubbleLogo";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { register, isAuthenticated, isLoading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(email, password, username);
  };
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <BubbleLogo className="h-20 w-20 animate-bubble-float" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Join Bubble Trouble
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full rounded-full bg-bubble-yellow hover:bg-bubble-yellow-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  <span className="ml-2">Creating account...</span>
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              <span className="text-gray-500">Already have an account?</span>{" "}
              <Link
                to="/login"
                className="font-medium text-bubble-yellow-dark hover:text-bubble-yellow"
              >
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
