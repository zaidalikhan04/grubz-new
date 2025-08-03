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
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerificationError, setShowEmailVerificationError] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { login, loginWithGoogle, loading, currentUser, resendEmailVerification } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Handle navigation after successful login
  useEffect(() => {
    if (currentUser) {
      console.log('🎯 User logged in, navigating...', { user: currentUser.email, role: currentUser.role });
      const redirectPath = getRedirectPath(currentUser.role);
      console.log('🎯 Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, navigate]);

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
    setShowEmailVerificationError(false);

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
      const errorMessage = error.message || 'Login failed. Please try again.';

      // Check if it's an email verification error
      if (errorMessage.includes('verify your email')) {
        setShowEmailVerificationError(true);
        setError('⚠️ Email verification required. Please check your email and click the verification link before logging in.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError('Please enter your email and password first');
      return;
    }

    setResendingVerification(true);
    try {
      const success = await resendEmailVerification(email, password);
      if (success) {
        setError('');
        alert('📧 Verification email sent! Please check your inbox and click the verification link.');
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      setError(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setShowEmailVerificationError(false);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      console.log('✅ Google login successful, waiting for user state update...');
      // Navigation will be handled by useEffect when user state changes
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      setError(error.message || 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
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
            <div className="text-red-500 text-sm text-center">
              {error}
              {showEmailVerificationError && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    className="text-xs"
                  >
                    {resendingVerification ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      '📧 Resend Verification Email'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full bg-[#dd3333] hover:bg-[#c52e2e]" disabled={loading || googleLoading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in with Google...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <div className="mt-6 text-center space-y-3">
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-[#dd3333] hover:underline font-medium"
            >
              Forgot your password?
            </button>
          )}

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