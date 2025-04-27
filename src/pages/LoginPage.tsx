
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo & title */}
      <div className="flex flex-col items-center mb-8">
        <Link to="/" className="flex items-center mb-6">
          <ShoppingCart className="h-8 w-8 text-campus-blue mr-2" />
          <span className="font-heading font-bold text-2xl text-campus-blue">CampusMarket</span>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg animate-scale-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email" 
              placeholder="student@iiitrkvalley.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-animation"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="#" className="text-xs text-campus-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-animation"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full button-animation" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : 'Log in'}
          </Button>
          <p className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-campus-blue font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
