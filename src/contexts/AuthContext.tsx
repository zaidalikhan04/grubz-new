import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService, UserData } from '../services/auth';

export type UserRole = 'admin' | 'customer' | 'restaurant_owner' | 'delivery_rider';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, phone?: string, address?: string) => Promise<boolean>;
  registerCustomer: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⚠️ Loading timeout reached, forcing loading to false');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    // Listen to Firebase auth state changes
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      console.log('🔄 Auth state change:', firebaseUser ? `User signed in: ${firebaseUser.email}` : 'User signed out');
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // User is signed in, get user data from Firestore
        try {
          console.log('🔄 Fetching user data from Firestore for UID:', firebaseUser.uid);
          const userData = await AuthService.getUserData(firebaseUser.uid);
          if (userData) {
            console.log('✅ User data loaded:', userData);
            setUser(userData as User);
            setIsAuthenticated(true);
            console.log('✅ User state updated successfully');
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.error('❌ User data not found in Firestore for:', firebaseUser.email);
            console.log('🔄 Creating fallback user data...');

            // Create a fallback user object for testing
            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Customer',
              role: 'customer',
              phone: '',
              address: ''
            };

            console.log('✅ Using fallback user data:', fallbackUser);
            setUser(fallbackUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // User is signed out
        console.log('👋 User signed out');
        setUser(null);
        setIsAuthenticated(false);
      }

      console.log('🔄 Auth state processing complete, setting loading to false');
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    });

    // Create default admin user and test customer on first load
    AuthService.createDefaultAdmin().catch(console.error);
    AuthService.createTestCustomer().catch(console.error);

    // Cleanup subscription and timeout on unmount
    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔄 Starting login for:', email);

    try {
      const userData = await AuthService.login(email, password);
      console.log('✅ Login successful, user data:', userData);
      // User state will be updated automatically by the auth state listener
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    phone?: string,
    address?: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const userData = await AuthService.register(email, password, {
        name,
        role,
        phone,
        address
      });
      // User state will be updated automatically by the auth state listener
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const registerCustomer = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔄 Starting customer registration for:', email);

    try {
      const userData = await AuthService.registerWithoutLogin(email, password, {
        name,
        role: 'customer',
        phone,
        address
      });
      console.log('✅ Customer registration successful:', userData);
      // User is signed out after registration, so no auth state change
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Customer registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      // User state will be updated automatically by the auth state listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      await AuthService.updateUserProfile(userData);
      // Update local user state
      if (user) {
        setUser({ ...user, ...userData });
      }
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await AuthService.resetPassword(email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    login,
    signup,
    registerCustomer,
    logout,
    updateProfile,
    resetPassword,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};