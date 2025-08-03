import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type UserRole = 'admin' | 'customer' | 'restaurant_owner' | 'delivery_rider';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  photoURL?: string;
  profilePictureUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  restaurantId?: string;
  isActive: boolean;
}

export class AuthService {
  static async register(email: string, password: string, userData: Partial<UserData>): Promise<UserData> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      // Determine role - allow admin if explicitly specified, otherwise default to customer
      const userRole = userData.role === 'admin' ? 'admin' : 'customer';

      // Send email verification immediately after registration (skip for admin users)
      if (userRole !== 'admin') {
        await sendEmailVerification(user);
        console.log('📧 Email verification sent to:', user.email);
      } else {
        console.log('🔑 Admin user created - email verification skipped');
      }

      const newUserData: UserData = {
        id: user.uid,
        email: user.email!,
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        ...userData,
        role: userRole // Ensure role is set correctly (override any role from userData)
      };

      await setDoc(doc(db, 'users', user.uid), newUserData);
      console.log('✅ User registered successfully with default role: customer');
      return newUserData;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<UserData> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = await this.getUserData(user.uid);
      if (!userData) {
        throw new Error('User data not found');
      }

      // Check if email is verified (skip verification for admin users)
      if (!user.emailVerified && userData.role !== 'admin') {
        // Sign out the user since they can't access the app
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for a verification link.');
      }

      // Update emailVerified status in Firestore if it's different
      if (userData.emailVerified !== user.emailVerified) {
        await this.updateUserProfile({ emailVerified: user.emailVerified });
        userData.emailVerified = user.emailVerified;
      }

      console.log('✅ User logged in successfully:', userData.email, 'Role:', userData.role);
      if (userData.role === 'admin') {
        console.log('🔑 Admin user - email verification bypassed');
      }
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  static async loginWithGoogle(): Promise<UserData> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      let userData = await this.getUserData(user.uid);

      if (!userData) {
        // Create new user document for Google sign-in
        const newUserData: UserData = {
          id: user.uid,
          email: user.email!,
          name: user.displayName || '',
          role: 'customer', // Default role for Google sign-in
          phone: '',
          address: '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        await setDoc(doc(db, 'users', user.uid), newUserData);
        userData = newUserData;
        console.log('✅ New Google user created successfully');
      } else {
        // Update existing user's photo URL if it's different
        if (userData.photoURL !== user.photoURL) {
          await this.updateUserProfile({ photoURL: user.photoURL || '' });
          userData.photoURL = user.photoURL || '';
        }
        console.log('✅ Existing Google user logged in successfully');
      }

      return userData;
    } catch (error) {
      console.error('❌ Google login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  static async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserData;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userData: Partial<UserData>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      const updates: Partial<UserData> = {
        ...userData,
        updatedAt: new Date()
      };

      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  static async resendEmailVerification(email: string, password: string): Promise<boolean> {
    try {
      // Sign in the user temporarily to get access to their account
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      // Send email verification
      await sendEmailVerification(user);
      console.log('📧 Email verification resent to:', user.email);

      // Sign out after sending verification
      await signOut(auth);

      return true;
    } catch (error) {
      console.error('❌ Error resending email verification:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('📧 Password reset email sent to:', email);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }

  static async updateProfilePicture(userId: string, profilePictureUrl: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profilePictureUrl,
        updatedAt: new Date()
      });
      console.log('✅ Profile picture updated successfully');
    } catch (error) {
      console.error('❌ Error updating profile picture:', error);
      throw new Error('Failed to update profile picture');
    }
  }

  static async updateProfile(userId: string, userData: Partial<UserData>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
      console.log('✅ User profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }
}
