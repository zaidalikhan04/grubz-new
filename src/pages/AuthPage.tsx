import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { EmailVerificationModal } from '../components/auth/EmailVerificationModal';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'email-verification';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [emailVerificationData, setEmailVerificationData] = useState<{email: string, password: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
    } else if (mode === 'forgot-password') {
      setAuthMode('forgot-password');
    } else {
      setAuthMode('login');
    }
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleShowEmailVerification = (email: string, password: string) => {
    setEmailVerificationData({ email, password });
    setAuthMode('email-verification');
  };

  const handleCloseEmailVerification = () => {
    setEmailVerificationData(null);
    setAuthMode('login');
  };

  const renderAuthForm = () => {
    switch (authMode) {
      case 'signup':
        return (
          <SignupForm
            onToggleMode={() => setAuthMode('login')}
            onShowEmailVerification={handleShowEmailVerification}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => setAuthMode('login')}
          />
        );
      case 'email-verification':
        return emailVerificationData ? (
          <EmailVerificationModal
            isOpen={true}
            onClose={handleCloseEmailVerification}
            userEmail={emailVerificationData.email}
            userPassword={emailVerificationData.password}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        ) : null;
      case 'login':
      default:
        return (
          <LoginForm
            onToggleMode={() => setAuthMode('signup')}
            onForgotPassword={() => setAuthMode('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f7f7] to-[#f2e8e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button - Hide during email verification */}
        {authMode !== 'email-verification' && (
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
        )}

        {/* Logo - Hide during email verification */}
        {authMode !== 'email-verification' && (
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
        )}

        {renderAuthForm()}
      </div>
    </div>
  );
};