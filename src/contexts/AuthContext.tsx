import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthService, UserData } from '../services/auth';

interface AuthContextType {
  currentUser: UserData | null;
  user: UserData | null; // Alias for compatibility
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserData>) => Promise<void>;
  updateProfile: (userData: Partial<UserData>) => Promise<void>;
  resendEmailVerification: (email: string, password: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up any existing snapshot listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        console.log('🔄 User authenticated, setting up profile listener for:', user.uid);
        // Set up real-time listener for user profile
        unsubscribeSnapshot = onSnapshot(
          doc(db, 'users', user.uid),
          (doc) => {
            console.log('📄 Profile document snapshot:', doc.exists(), doc.data());
            if (doc.exists()) {
              setCurrentUser({ id: doc.id, ...doc.data() } as UserData);
            } else {
              console.log('⚠️ User document does not exist, user needs to complete registration');
              setCurrentUser(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('❌ Error in profile snapshot:', error);
            setError('Error loading user profile');
            setLoading(false);
          }
        );
      } else {
        console.log('🚪 User not authenticated');
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userData = await AuthService.login(email, password);
      setCurrentUser(userData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const userData = await AuthService.loginWithGoogle();
      setCurrentUser(userData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await AuthService.logout();
      setCurrentUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to logout');
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: Partial<UserData>) => {
    try {
      setError(null);
      await AuthService.register(email, password, userData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to register');
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<UserData>) => {
    try {
      setError(null);
      await AuthService.updateUserProfile(userData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    }
  };

  const resendEmailVerification = async (email: string, password: string) => {
    try {
      setError(null);
      return await AuthService.resendEmailVerification(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification email');
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      setError(null);
      await AuthService.sendPasswordResetEmail(email);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send password reset email');
      throw error;
    }
  };

  const value = {
    currentUser,
    user: currentUser, // Alias for compatibility
    loading,
    isLoading: loading, // Alias for compatibility
    error,
    login,
    loginWithGoogle,
    logout,
    register,
    updateProfile,
    resendEmailVerification,
    sendPasswordResetEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};