import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { EmailService } from './email';
import { AuthService } from './auth';

export interface ApplicationApprovalData {
  userId: string;
  userEmail: string;
  userName: string;
  applicationType: 'restaurant_owner' | 'delivery_rider';
  applicationId: string;
  adminNotes?: string;
}

export class ApplicationApprovalService {
  
  /**
   * Approve a restaurant or driver application
   */
  static async approveApplication(data: ApplicationApprovalData): Promise<void> {
    const { userId, userEmail, userName, applicationType, applicationId, adminNotes } = data;
    
    try {
      console.log('🔄 Starting application approval process for:', userEmail);
      
      // 1. Update the application status
      const applicationCollection = applicationType === 'restaurant_owner' 
        ? 'restaurantApplications' 
        : 'deliveryApplications';
      
      await updateDoc(doc(db, applicationCollection, applicationId), {
        status: 'approved',
        adminNotes: adminNotes || '',
        processedAt: new Date(),
        processedBy: 'admin' // In a real app, this would be the current admin's ID
      });
      
      console.log('✅ Application status updated to approved');
      
      // 2. Update user role in users collection
      await updateDoc(doc(db, 'users', userId), {
        role: applicationType,
        updatedAt: new Date()
      });
      
      console.log('✅ User role updated to:', applicationType);
      
      // 3. Create role-specific profile if needed
      if (applicationType === 'restaurant_owner') {
        // Create restaurant profile placeholder
        await setDoc(doc(db, 'restaurants', userId), {
          ownerId: userId,
          name: `${userName}'s Restaurant`,
          email: userEmail,
          phone: '',
          address: '',
          description: '',
          cuisine: '',
          isActive: true,
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Restaurant profile created');
      } else if (applicationType === 'delivery_rider') {
        // Create driver profile placeholder
        await setDoc(doc(db, 'drivers', userId), {
          userId: userId,
          name: userName,
          email: userEmail,
          phone: '',
          vehicleType: '',
          licenseNumber: '',
          isActive: true,
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Driver profile created');
      }
      
      // 4. Send approval email
      await EmailService.sendApprovalEmail(
        userEmail,
        userName,
        applicationType,
        undefined // No login credentials needed since user already has account
      );
      
      console.log('✅ Application approval process completed successfully');
      
    } catch (error) {
      console.error('❌ Error approving application:', error);
      throw new Error('Failed to approve application');
    }
  }
  
  /**
   * Reject a restaurant or driver application
   */
  static async rejectApplication(
    data: ApplicationApprovalData, 
    rejectionReason?: string
  ): Promise<void> {
    const { userId, userEmail, userName, applicationType, applicationId, adminNotes } = data;
    
    try {
      console.log('🔄 Starting application rejection process for:', userEmail);
      
      // 1. Update the application status
      const applicationCollection = applicationType === 'restaurant_owner' 
        ? 'restaurantApplications' 
        : 'deliveryApplications';
      
      await updateDoc(doc(db, applicationCollection, applicationId), {
        status: 'rejected',
        adminNotes: adminNotes || rejectionReason || '',
        rejectionReason: rejectionReason || '',
        processedAt: new Date(),
        processedBy: 'admin' // In a real app, this would be the current admin's ID
      });
      
      console.log('✅ Application status updated to rejected');
      
      // 2. Send rejection email
      await EmailService.sendRejectionEmail(
        userEmail,
        userName,
        applicationType,
        rejectionReason
      );
      
      console.log('✅ Application rejection process completed successfully');
      
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      throw new Error('Failed to reject application');
    }
  }
  
  /**
   * Get application details by user ID and type
   */
  static async getApplicationDetails(
    userId: string, 
    applicationType: 'restaurant_owner' | 'delivery_rider'
  ): Promise<any> {
    try {
      const applicationCollection = applicationType === 'restaurant_owner' 
        ? 'restaurantApplications' 
        : 'deliveryApplications';
      
      const applicationDoc = await getDoc(doc(db, applicationCollection, userId));
      
      if (!applicationDoc.exists()) {
        throw new Error('Application not found');
      }
      
      return {
        id: applicationDoc.id,
        ...applicationDoc.data()
      };
      
    } catch (error) {
      console.error('❌ Error getting application details:', error);
      throw error;
    }
  }
  
  /**
   * Batch approve multiple applications
   */
  static async batchApproveApplications(applications: ApplicationApprovalData[]): Promise<void> {
    try {
      console.log('🔄 Starting batch approval for', applications.length, 'applications');
      
      const results = await Promise.allSettled(
        applications.map(app => this.approveApplication(app))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`✅ Batch approval completed: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        console.warn('⚠️ Some applications failed to approve:', 
          results
            .filter(result => result.status === 'rejected')
            .map(result => (result as PromiseRejectedResult).reason)
        );
      }
      
    } catch (error) {
      console.error('❌ Error in batch approval:', error);
      throw error;
    }
  }
  
  /**
   * Get user data for application approval
   */
  static async getUserDataForApproval(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
      
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      throw error;
    }
  }
}
