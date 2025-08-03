import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  Timestamp,
  DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Restaurant Application Interface
export interface RestaurantApplication {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  address: string;
  
  // Restaurant Information
  restaurantName: string;
  restaurantDescription: string;
  cuisineType: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail: string;
  website?: string;
  
  // Business Information
  businessLicense?: string;
  taxId?: string;
  yearsOfExperience?: string;
  previousRestaurantExperience?: string;
  
  // Operating Information
  plannedHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  
  // Additional Information
  specialRequirements?: string;
  additionalNotes?: string;
}

// Delivery Application Interface
export interface DeliveryApplication {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Vehicle Information
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  licensePlate?: string;
  
  // Documentation
  driversLicense: string;
  vehicleRegistration?: string;
  insurancePolicy?: string;
  
  // Availability
  availableDays: {
    [key: string]: boolean;
  };
  preferredHours: {
    start: string;
    end: string;
  };
  
  // Experience
  deliveryExperience?: string;
  previousEmployer?: string;
  yearsOfExperience?: string;
  
  // Additional Information
  specialSkills?: string;
  additionalNotes?: string;
}

export class ApplicationService {
  // Submit Restaurant Owner Application
  static async submitRestaurantApplication(
    userId: string, 
    applicationData: Omit<RestaurantApplication, 'id'>
  ): Promise<RestaurantApplication> {
    try {
      const application: RestaurantApplication = {
        id: userId, // Use userId as document ID for restaurantApplications/{uid}
        ...applicationData
      };

      const applicationDoc = {
        ...application,
        submittedAt: Timestamp.fromDate(application.submittedAt),
        reviewedAt: application.reviewedAt ? Timestamp.fromDate(application.reviewedAt) : null
      };

      await setDoc(doc(db, 'restaurantApplications', userId), applicationDoc);
      return application;
    } catch (error) {
      console.error('Error submitting restaurant application:', error);
      throw error;
    }
  }

  // Submit Delivery Driver Application
  static async submitDeliveryApplication(
    userId: string, 
    applicationData: Omit<DeliveryApplication, 'id'>
  ): Promise<DeliveryApplication> {
    try {
      const application: DeliveryApplication = {
        id: userId, // Use userId as document ID for deliveryApplications/{uid}
        ...applicationData
      };

      const applicationDoc = {
        ...application,
        submittedAt: Timestamp.fromDate(application.submittedAt),
        reviewedAt: application.reviewedAt ? Timestamp.fromDate(application.reviewedAt) : null
      };

      await setDoc(doc(db, 'deliveryApplications', userId), applicationDoc);
      return application;
    } catch (error) {
      console.error('Error submitting delivery application:', error);
      throw error;
    }
  }

  // Get Restaurant Application
  static async getRestaurantApplication(userId: string): Promise<RestaurantApplication | null> {
    try {
      const docRef = doc(db, 'restaurantApplications', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || undefined
        } as RestaurantApplication;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting restaurant application:', error);
      throw error;
    }
  }

  // Get Delivery Application
  static async getDeliveryApplication(userId: string): Promise<DeliveryApplication | null> {
    try {
      const docRef = doc(db, 'deliveryApplications', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || undefined
        } as DeliveryApplication;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting delivery application:', error);
      throw error;
    }
  }

  // Real-time listener for Restaurant Application
  static subscribeToRestaurantApplication(
    userId: string, 
    callback: (application: RestaurantApplication | null) => void
  ): () => void {
    const docRef = doc(db, 'restaurantApplications', userId);
    
    return onSnapshot(docRef, (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const application: RestaurantApplication = {
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || undefined
        } as RestaurantApplication;
        callback(application);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to restaurant application:', error);
      callback(null);
    });
  }

  // Real-time listener for Delivery Application
  static subscribeToDeliveryApplication(
    userId: string, 
    callback: (application: DeliveryApplication | null) => void
  ): () => void {
    const docRef = doc(db, 'deliveryApplications', userId);
    
    return onSnapshot(docRef, (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const application: DeliveryApplication = {
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || undefined
        } as DeliveryApplication;
        callback(application);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to delivery application:', error);
      callback(null);
    });
  }

  // Update Application Status (for admin use)
  static async updateRestaurantApplicationStatus(
    userId: string, 
    status: 'approved' | 'rejected', 
    reviewedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'restaurantApplications', userId);
      await updateDoc(docRef, {
        status,
        reviewedAt: Timestamp.now(),
        reviewedBy
      });
    } catch (error) {
      console.error('Error updating restaurant application status:', error);
      throw error;
    }
  }

  // Update Delivery Application Status (for admin use)
  static async updateDeliveryApplicationStatus(
    userId: string, 
    status: 'approved' | 'rejected', 
    reviewedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'deliveryApplications', userId);
      await updateDoc(docRef, {
        status,
        reviewedAt: Timestamp.now(),
        reviewedBy
      });
    } catch (error) {
      console.error('Error updating delivery application status:', error);
      throw error;
    }
  }
}
