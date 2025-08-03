// Utility to update current user's role for testing
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const updateCurrentUserRole = async (userId: string, newRole: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date()
    });
    console.log(`✅ Updated user ${userId} role to ${newRole}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return false;
  }
};

// Helper function to make current user a driver
export const makeCurrentUserDriver = async (userId: string) => {
  return await updateCurrentUserRole(userId, 'delivery_rider');
};

// Helper function to make current user admin (for testing)
export const makeCurrentUserAdmin = async (userId: string) => {
  return await updateCurrentUserRole(userId, 'admin');
};
