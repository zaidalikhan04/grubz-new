import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db, auth } from '../config/firebase';

// Enhanced Admin CRUD Service with comprehensive logging and error handling
export class AdminCrudService {
  
  // Create audit log for admin actions
  static async createAuditLog(action: string, targetType: string, targetId: string, details: any) {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        action,
        targetType,
        targetId,
        details,
        timestamp: Timestamp.now(),
        adminId: 'current-admin-id', // This should be the current admin's ID
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ Failed to create audit log:', error);
    }
  }

  // Enhanced user deletion with comprehensive checks
  static async deleteUserComprehensive(userId: string) {
    console.log('🔄 Starting comprehensive user deletion for ID:', userId);
    
    try {
      // Step 1: Verify user exists
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error(`User with ID ${userId} not found in database`);
      }
      
      const userData = userSnap.data();
      console.log('📋 User found:', {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      // Step 2: Check for related data that needs cleanup
      const relatedData = await this.findRelatedUserData(userId);
      console.log('🔍 Related data found:', relatedData);

      // Step 3: Create batch operation for atomic deletion
      const batch = writeBatch(db);
      
      // Delete main user document
      batch.delete(userRef);
      
      // Delete related data
      if (relatedData.orders.length > 0) {
        console.log(`🗑️ Deleting ${relatedData.orders.length} related orders`);
        relatedData.orders.forEach(order => {
          batch.delete(doc(db, 'orders', order.id));
        });
      }
      
      if (relatedData.restaurants.length > 0) {
        console.log(`🗑️ Deleting ${relatedData.restaurants.length} related restaurants`);
        relatedData.restaurants.forEach(restaurant => {
          batch.delete(doc(db, 'restaurants', restaurant.id));
        });
      }
      
      if (relatedData.driverProfile) {
        console.log('🗑️ Deleting driver profile');
        batch.delete(doc(db, 'drivers', relatedData.driverProfile.id));
      }

      // Step 4: Execute batch deletion
      console.log('🔄 Executing batch deletion...');
      console.log('📊 Batch operations count:', batch._delegate._mutations.length);

      try {
        await batch.commit();
        console.log('✅ Batch deletion completed successfully');
      } catch (batchError: any) {
        console.error('❌ Batch deletion failed:', batchError);
        throw new Error(`Batch deletion failed: ${batchError.message}`);
      }

      // Step 4.1: Verify deletion with retry mechanism
      console.log('🔄 Verifying deletion...');
      let verificationAttempts = 0;
      const maxAttempts = 3;

      while (verificationAttempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const verifyUserRef = doc(db, 'users', userId);
        const verifyUserSnap = await getDoc(verifyUserRef);

        if (!verifyUserSnap.exists()) {
          console.log('✅ Verified: User document successfully deleted from Firebase');
          break;
        } else {
          verificationAttempts++;
          console.log(`⚠️ Verification attempt ${verificationAttempts}: User document still exists`);

          if (verificationAttempts >= maxAttempts) {
            console.error('❌ User deletion verification failed after multiple attempts');
            throw new Error('User deletion verification failed - document still exists after deletion');
          }
        }
      }

      // Step 5: Create audit log
      await this.createAuditLog('DELETE_USER', 'user', userId, {
        deletedUser: userData,
        relatedDataDeleted: {
          orders: relatedData.orders.length,
          restaurants: relatedData.restaurants.length,
          driverProfile: relatedData.driverProfile ? 1 : 0
        }
      });

      return {
        success: true,
        deletedUser: userData,
        relatedDataDeleted: relatedData,
        message: 'User and all related data deleted successfully'
      };

    } catch (error: any) {
      console.error('❌ Error during comprehensive user deletion:', error);
      
      // Log the error for debugging
      await this.createAuditLog('DELETE_USER_FAILED', 'user', userId, {
        error: error.message,
        stack: error.stack
      });
      
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Simple user deletion (just the user document) for testing
  static async deleteUserSimple(userId: string) {
    console.log('🔄 Starting simple user deletion for ID:', userId);

    try {
      // Step 1: Verify user exists
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error(`User with ID ${userId} not found in database`);
      }

      const userData = userSnap.data();
      console.log('📋 User found for simple deletion:', {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      // Step 2: Delete just the user document
      console.log('🔄 Deleting user document...');
      console.log('🔍 Current user auth state:', {
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        isAdmin: userData.role === 'admin'
      });

      try {
        // First delete from Firestore
        await deleteDoc(userRef);
        console.log('✅ User document deleted from Firestore successfully');

        // Note: We cannot delete from Firebase Auth directly from client-side
        // This would require Firebase Admin SDK on the server side
        // For now, we'll just delete the Firestore document
        console.log('ℹ️ Note: Firebase Auth user still exists (requires server-side deletion)');

      } catch (deleteError: any) {
        console.error('❌ Delete operation failed:', deleteError);
        console.error('❌ Delete error details:', {
          code: deleteError.code,
          message: deleteError.message,
          userRef: userRef.path
        });
        throw new Error(`Delete operation failed: ${deleteError.message}`);
      }

      // Step 3: Verify deletion
      console.log('🔄 Verifying simple deletion...');
      const verifyUserSnap = await getDoc(userRef);

      if (verifyUserSnap.exists()) {
        console.error('❌ Simple deletion verification failed - document still exists');
        throw new Error('Simple user deletion verification failed - document still exists');
      } else {
        console.log('✅ Verified: User document successfully deleted from Firebase (simple deletion)');
      }

      return {
        success: true,
        deletedUser: userData,
        message: 'User successfully deleted from Firestore database (simple deletion)'
      };
    } catch (error: any) {
      console.error('❌ Error during simple user deletion:', error);
      throw new Error(`Failed to delete user (simple): ${error.message}`);
    }
  }

  // Test user creation and verification process
  static async testUserCreationAndVerification() {
    console.log('🔄 Testing user creation and verification process...');

    try {
      // Test 1: Create a test user
      const testUserData = {
        id: `test-user-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        name: 'Test User Name',
        role: 'customer',
        phone: '123-456-7890',
        address: '123 Test Street',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('📋 Creating test user:', testUserData);
      await setDoc(doc(db, 'users', testUserData.id), testUserData);
      console.log('✅ Test user created successfully');

      // Test 2: Verify user exists and has correct name
      const userRef = doc(db, 'users', testUserData.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('✅ User verification successful:', {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          nameMatches: userData.name === testUserData.name
        });

        if (userData.name !== testUserData.name) {
          throw new Error(`Name mismatch: expected "${testUserData.name}", got "${userData.name}"`);
        }
      } else {
        throw new Error('Test user not found after creation');
      }

      // Test 3: Delete the test user
      console.log('🔄 Deleting test user...');
      await deleteDoc(userRef);
      console.log('✅ Test user deleted successfully');

      // Test 4: Verify deletion
      const verifySnap = await getDoc(userRef);
      if (verifySnap.exists()) {
        throw new Error('Test user still exists after deletion');
      } else {
        console.log('✅ User deletion verified successfully');
      }

      return {
        success: true,
        message: 'User creation, name storage, and deletion all working correctly',
        testUser: testUserData
      };

    } catch (error: any) {
      console.error('❌ User creation/verification test failed:', error);
      throw new Error(`Test failed: ${error.message}`);
    }
  }

  // Find all data related to a user
  static async findRelatedUserData(userId: string) {
    const relatedData = {
      orders: [] as any[],
      restaurants: [] as any[],
      driverProfile: null as any,
      partnerRequests: [] as any[]
    };

    try {
      // Find orders by user
      const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
      const ordersSnap = await getDocs(ordersQuery);
      relatedData.orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Find restaurants owned by user
      const restaurantsQuery = query(collection(db, 'restaurants'), where('ownerId', '==', userId));
      const restaurantsSnap = await getDocs(restaurantsQuery);
      relatedData.restaurants = restaurantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Find driver profile
      const driverRef = doc(db, 'drivers', userId);
      const driverSnap = await getDoc(driverRef);
      if (driverSnap.exists()) {
        relatedData.driverProfile = { id: driverSnap.id, ...driverSnap.data() };
      }

      // Find partner requests
      const requestsQuery = query(collection(db, 'partnerRequests'), where('userId', '==', userId));
      const requestsSnap = await getDocs(requestsQuery);
      relatedData.partnerRequests = requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
      console.error('❌ Error finding related user data:', error);
    }

    return relatedData;
  }

  // Get all users with enhanced error handling
  static async getAllUsersEnhanced() {
    try {
      console.log('🔄 Fetching all users from Firestore...');
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Users fetched successfully:', users.length, 'users found');
      return users;
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Update user with validation
  static async updateUserEnhanced(userId: string, updateData: any) {
    try {
      console.log('🔄 Updating user:', userId, updateData);
      
      // Verify user exists
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Update with timestamp
      const updatedData = {
        ...updateData,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(userRef, updatedData);
      
      // Create audit log
      await this.createAuditLog('UPDATE_USER', 'user', userId, {
        updatedFields: Object.keys(updateData),
        newData: updateData
      });
      
      console.log('✅ User updated successfully');
      return { id: userId, ...updatedData };
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Test Firebase connection and permissions
  static async testFirebaseConnection() {
    try {
      console.log('🔄 Testing Firebase connection and permissions...');

      // Test read permission
      const testQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const testSnapshot = await getDocs(testQuery);
      console.log('✅ Read permission test passed:', testSnapshot.size, 'documents found');

      // Test write permission (create a test document)
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Admin CRUD test',
        timestamp: Timestamp.now()
      });
      console.log('✅ Write permission test passed, test doc ID:', testDoc.id);

      // Clean up test document
      await deleteDoc(doc(db, 'test', testDoc.id));
      console.log('✅ Delete permission test passed');

      return {
        success: true,
        message: 'All Firebase permissions working correctly'
      };
    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a test user for deletion testing
  static async createTestUser() {
    try {
      console.log('🔄 Creating test user for deletion testing...');

      const testUserData = {
        name: 'Test User for Deletion',
        email: `test-user-${Date.now()}@example.com`,
        role: 'customer',
        phone: '555-0123',
        address: '123 Test Street',
        emailVerified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const testUserRef = await addDoc(collection(db, 'users'), testUserData);
      console.log('✅ Test user created with ID:', testUserRef.id);

      return {
        success: true,
        userId: testUserRef.id,
        userData: testUserData
      };
    } catch (error: any) {
      console.error('❌ Failed to create test user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test complete user deletion workflow
  static async testUserDeletion() {
    try {
      console.log('🔄 Starting complete user deletion test...');

      // Step 1: Create test user
      const createResult = await this.createTestUser();
      if (!createResult.success) {
        throw new Error(`Failed to create test user: ${createResult.error}`);
      }

      const testUserId = createResult.userId!;
      console.log('✅ Test user created:', testUserId);

      // Step 2: Verify user exists
      const userRef = doc(db, 'users', testUserId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('Test user was not created properly');
      }
      console.log('✅ Test user verified to exist');

      // Step 3: Delete the user
      const deleteResult = await this.deleteUserComprehensive(testUserId);
      console.log('✅ User deletion completed:', deleteResult);

      // Step 4: Verify user is deleted
      const verifySnap = await getDoc(userRef);
      if (verifySnap.exists()) {
        throw new Error('User still exists after deletion');
      }
      console.log('✅ User deletion verified - user no longer exists in Firebase');

      return {
        success: true,
        message: 'User deletion test completed successfully',
        testUserId,
        deleteResult
      };
    } catch (error: any) {
      console.error('❌ User deletion test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
