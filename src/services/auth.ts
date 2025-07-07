import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserService } from './database';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer' | 'restaurant_owner' | 'delivery_rider';
  phone?: string;
  address?: string;
  createdAt?: any;
  updatedAt?: any;
}

export class AuthService {
  // Register a new user (auto-login after registration)
  static async register(email: string, password: string, userData: Partial<UserData>): Promise<UserData> {
    try {
      // Create user in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      // Create user document in Firestore
      const newUserData: UserData = {
        id: user.uid,
        email: user.email!,
        name: userData.name || '',
        role: userData.role || 'customer',
        phone: userData.phone || '',
        address: userData.address || '',
      };

      await UserService.createUser(newUserData);
      return newUserData;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Register a new user without auto-login (for customer signup)
  static async registerWithoutLogin(email: string, password: string, userData: Partial<UserData>): Promise<UserData> {
    try {
      console.log('🔄 Starting registerWithoutLogin for:', email);

      // Create user in Firebase Auth
      console.log('🔄 Creating Firebase Auth user...');
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase Auth user created:', user.uid);

      // Update the user's display name
      if (userData.name) {
        console.log('🔄 Updating display name...');
        await updateProfile(user, { displayName: userData.name });
        console.log('✅ Display name updated');
      }

      // Create user document in Firestore
      const newUserData: UserData = {
        id: user.uid,
        email: user.email!,
        name: userData.name || '',
        role: userData.role || 'customer',
        phone: userData.phone || '',
        address: userData.address || '',
      };

      console.log('🔄 Creating Firestore user document:', newUserData);
      await UserService.createUser(newUserData);
      console.log('✅ Firestore user document created');

      // Sign out the user immediately after registration
      console.log('🔄 Signing out user after registration...');
      await signOut(auth);
      console.log('✅ User signed out successfully');

      return newUserData;
    } catch (error) {
      console.error('❌ Error in registerWithoutLogin:', error);
      throw error;
    }
  }

  // Sign in user
  static async login(email: string, password: string): Promise<UserData> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userData = await UserService.getUserById(user.uid);
      if (!userData) {
        throw new Error('User data not found');
      }

      return userData as UserData;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign out user
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to authentication state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userData: Partial<UserData>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Update Firebase Auth profile
      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      // Update Firestore user document
      await UserService.updateUser(user.uid, userData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user data from Firestore
  static async getUserData(uid: string): Promise<UserData | null> {
    try {
      console.log('🔄 Getting user data for UID:', uid);
      const userData = await UserService.getUserById(uid) as UserData;
      console.log('🔄 User data result:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  // Check if user has specific role
  static async hasRole(uid: string, role: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(uid);
      return userData?.role === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  // Create default admin user (for initial setup)
  static async createDefaultAdmin(): Promise<void> {
    try {
      const adminEmail = 'admin@grubz.com';
      const adminPassword = 'password123';

      // Check if admin already exists
      const existingAdmin = await UserService.getUserByEmail(adminEmail);
      if (existingAdmin) {
        console.log('Default admin already exists');
      } else {
        // Create admin user
        await this.register(adminEmail, adminPassword, {
          name: 'System Administrator',
          role: 'admin',
          phone: '+1 (555) 123-4567'
        });
        console.log('Default admin user created successfully');
      }

      // Also create a default customer for testing
      const customerEmail = 'customer@grubz.com';
      const existingCustomer = await UserService.getUserByEmail(customerEmail);
      if (!existingCustomer) {
        await this.register(customerEmail, adminPassword, {
          name: 'Test Customer',
          role: 'customer',
          phone: '+1 (555) 123-4567'
        });
        console.log('Default customer user created successfully');
      } else {
        console.log('Default customer already exists');
      }
    } catch (error) {
      console.error('Error creating default users:', error);
    }
  }

  // Create a test customer account for debugging
  static async createTestCustomer(): Promise<void> {
    try {
      const testEmail = 'test@customer.com';
      const testPassword = 'password123';

      console.log('🔄 Checking if test customer exists...');

      // Check if test customer already exists
      const existingCustomer = await UserService.getUserByEmail(testEmail);
      if (existingCustomer) {
        console.log('✅ Test customer already exists:', existingCustomer);
        return;
      }

      console.log('🔄 Creating test customer account...');

      // Create test customer user
      const userData = await this.register(testEmail, testPassword, {
        name: 'Test Customer',
        role: 'customer',
        phone: '+1 (555) 123-4567'
      });

      console.log('✅ Test customer user created successfully:', userData);
    } catch (error) {
      console.error('❌ Error creating test customer:', error);
    }
  }
}
