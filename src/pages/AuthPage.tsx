import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f7f7] to-[#f2e8e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8">
              <img
                src="/vector---0.svg"
                alt="Grubz logo"
                className="w-full h-full"
              />
            </div>
            <h1 className="font-bold text-3xl [font-family:'Plus_Jakarta_Sans',Helvetica]">
              <span className="text-[#190c0c]">Grub</span>
              <span className="text-[#dd3333]">z</span>
            </h1>
          </div>
          <p className="text-gray-600">Your favorite food delivery platform</p>
        </div>

        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};