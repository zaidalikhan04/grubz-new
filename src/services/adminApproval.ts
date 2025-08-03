import { doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ApprovalData {
  userId: string;
  type: 'restaurant_owner' | 'delivery_rider';
  status: 'approved' | 'rejected';
  adminNotes?: string;
  processedBy: string;
  processedAt: Date;
}

export class AdminApprovalService {
  /**
   * Approve a restaurant application
   * - Updates user role to 'restaurant_owner'
   * - Moves application data to restaurants/{uid}
   * - Updates application status
   */
  static async approveRestaurantApplication(
    userId: string, 
    adminId: string, 
    adminNotes?: string
  ): Promise<void> {
    try {
      console.log('🔄 Approving restaurant application for user:', userId);

      // Get the application data
      const applicationDoc = await getDoc(doc(db, 'restaurantApplications', userId));
      if (!applicationDoc.exists()) {
        throw new Error('Restaurant application not found');
      }

      const applicationData = applicationDoc.data();

      // Update user role
      await updateDoc(doc(db, 'users', userId), {
        role: 'restaurant_owner',
        updatedAt: new Date()
      });

      // Move application data to restaurants collection with proper structure
      await setDoc(doc(db, 'restaurants', userId), {
        // Restaurant core fields
        name: applicationData.restaurantName,
        ownerId: userId,
        description: applicationData.description || '',
        location: applicationData.address || '',
        phone: applicationData.phone || '',
        email: applicationData.userEmail || '',
        website: applicationData.website || '',
        cuisine: applicationData.cuisine || '',
        category: applicationData.category || '',
        image: applicationData.image || '', // Can be added later

        // Operational fields
        status: 'approved',
        isActive: true,
        rating: 4.5, // Default rating
        totalOrders: 0,
        totalReviews: 0,

        // Admin approval fields
        adminNotes: adminNotes || '',
        processedBy: adminId,
        processedAt: new Date(),

        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),

        // Keep original application data for reference
        originalApplication: applicationData
      });

      // Update application status
      await updateDoc(doc(db, 'restaurantApplications', userId), {
        status: 'approved',
        adminNotes: adminNotes || '',
        processedBy: adminId,
        processedAt: new Date()
      });

      console.log('✅ Restaurant application approved successfully');
    } catch (error) {
      console.error('❌ Error approving restaurant application:', error);
      throw error;
    }
  }

  /**
   * Approve a delivery driver application
   * - Updates user role to 'delivery_rider'
   * - Moves application data to drivers/{uid}
   * - Updates application status
   */
  static async approveDeliveryApplication(
    userId: string, 
    adminId: string, 
    adminNotes?: string
  ): Promise<void> {
    try {
      console.log('🔄 Approving delivery application for user:', userId);

      // Get the application data
      const applicationDoc = await getDoc(doc(db, 'deliveryApplications', userId));
      if (!applicationDoc.exists()) {
        throw new Error('Delivery application not found');
      }

      const applicationData = applicationDoc.data();

      // Update user role
      await updateDoc(doc(db, 'users', userId), {
        role: 'delivery_rider',
        updatedAt: new Date()
      });

      // Move application data to drivers collection
      await setDoc(doc(db, 'drivers', userId), {
        ...applicationData,
        status: 'approved',
        adminNotes: adminNotes || '',
        processedBy: adminId,
        processedAt: new Date(),
        isActive: true,
        isAvailable: true,
        currentOrders: 0,
        totalDeliveries: 0,
        rating: 5.0,
        earnings: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update application status
      await updateDoc(doc(db, 'deliveryApplications', userId), {
        status: 'approved',
        adminNotes: adminNotes || '',
        processedBy: adminId,
        processedAt: new Date()
      });

      console.log('✅ Delivery application approved successfully');
    } catch (error) {
      console.error('❌ Error approving delivery application:', error);
      throw error;
    }
  }

  /**
   * Reject an application
   */
  static async rejectApplication(
    userId: string,
    type: 'restaurant_owner' | 'delivery_rider',
    adminId: string,
    adminNotes: string
  ): Promise<void> {
    try {
      console.log(`🔄 Rejecting ${type} application for user:`, userId);

      const collectionName = type === 'restaurant_owner' ? 'restaurantApplications' : 'deliveryApplications';

      // Update application status
      await updateDoc(doc(db, collectionName, userId), {
        status: 'rejected',
        adminNotes: adminNotes,
        processedBy: adminId,
        processedAt: new Date()
      });

      console.log(`✅ ${type} application rejected successfully`);
    } catch (error) {
      console.error(`❌ Error rejecting ${type} application:`, error);
      throw error;
    }
  }

  /**
   * Get application data for admin review
   */
  static async getApplicationData(
    userId: string,
    type: 'restaurant_owner' | 'delivery_rider'
  ): Promise<any> {
    try {
      const collectionName = type === 'restaurant_owner' ? 'restaurantApplications' : 'deliveryApplications';
      const applicationDoc = await getDoc(doc(db, collectionName, userId));
      
      if (!applicationDoc.exists()) {
        return null;
      }

      return {
        id: applicationDoc.id,
        ...applicationDoc.data()
      };
    } catch (error) {
      console.error('❌ Error getting application data:', error);
      throw error;
    }
  }

  /**
   * Get restaurant data for approved restaurant owners
   */
  static async getRestaurantData(userId: string): Promise<any> {
    try {
      const restaurantDoc = await getDoc(doc(db, 'restaurants', userId));
      
      if (!restaurantDoc.exists()) {
        return null;
      }

      return {
        id: restaurantDoc.id,
        ...restaurantDoc.data()
      };
    } catch (error) {
      console.error('❌ Error getting restaurant data:', error);
      throw error;
    }
  }

  /**
   * Get driver data for approved delivery drivers
   */
  static async getDriverData(userId: string): Promise<any> {
    try {
      const driverDoc = await getDoc(doc(db, 'drivers', userId));
      
      if (!driverDoc.exists()) {
        return null;
      }

      return {
        id: driverDoc.id,
        ...driverDoc.data()
      };
    } catch (error) {
      console.error('❌ Error getting driver data:', error);
      throw error;
    }
  }
}
