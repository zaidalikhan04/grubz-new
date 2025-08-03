import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, Loader2, X } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userPassword: string;
  onSwitchToLogin: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userPassword,
  onSwitchToLogin
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const { resendEmailVerification } = useAuth();

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const success = await resendEmailVerification(userEmail, userPassword);
      if (success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setResendError('Failed to send verification email. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      setResendError(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleProceedToLogin = () => {
    onClose();
    onSwitchToLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center py-16 px-8">
          {/* Logo/Icon - Segment style */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Please verify your email
          </h1>

          {/* Description */}
          <div className="text-gray-600 mb-8 space-y-2">
            <p>You're almost there! We sent an email to</p>
            <p className="font-medium text-gray-900">{userEmail}</p>
          </div>

          <div className="text-gray-600 mb-8 space-y-2">
            <p>Just click on the link in that email to complete your signup.</p>
            <p>If you don't see it, you may need to check your spam folder.</p>
          </div>

          {/* Resend Section */}
          <div className="space-y-4">
            <p className="text-gray-600">Still can't find the email?</p>

            {resendSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Verification email sent successfully!
                </p>
              </div>
            )}

            {resendError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ❌ {resendError}
                </p>
              </div>
            )}

            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md font-medium"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="text-gray-500">Need help?</span>
              <Button
                variant="link"
                onClick={handleProceedToLogin}
                className="text-green-600 hover:text-green-700 p-0 h-auto font-medium"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
