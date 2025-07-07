import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Handle navigation after successful login
  useEffect(() => {
    if (user) {
      console.log('🎯 User logged in, navigating...', { user: user.email, role: user.role });
      const redirectPath = getRedirectPath(user.role);
      console.log('🎯 Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'customer':
        return '/dashboard';
      case 'restaurant_owner':
        return '/restaurant';
      case 'delivery_rider':
        return '/delivery';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    console.log('🔄 Attempting login with:', email);

    try {
      const success = await login(email, password);
      console.log('🔄 Login result:', success);
      if (!success) {
        setError('Invalid email or password');
      } else {
        console.log('✅ Login successful, waiting for user state update...');
      }
      // Navigation will be handled by useEffect when user state changes
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your Grubz account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" className="w-full bg-[#dd3333] hover:bg-[#c52e2e]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-[#dd3333] hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>


      </CardContent>
    </Card>
  );
};