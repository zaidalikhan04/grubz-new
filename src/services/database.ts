import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic database service class
export class DatabaseService {
  // Create a new document
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Get a single document by ID
  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Get all documents from a collection
  static async getAll(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Update a document
  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document
  static async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Listen to real-time updates
  static subscribe(
    collectionName: string, 
    callback: (data: any[]) => void,
    constraints: QueryConstraint[] = []
  ) {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  }

  // Query documents with conditions
  static async query(
    collectionName: string,
    conditions: { field: string; operator: any; value: any }[],
    orderByField?: string,
    limitCount?: number
  ) {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Add where conditions
      conditions.forEach(condition => {
        constraints.push(where(condition.field, condition.operator, condition.value));
      });
      
      // Add order by
      if (orderByField) {
        constraints.push(orderBy(orderByField));
      }
      
      // Add limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }
      
      return await this.getAll(collectionName, constraints);
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }
}

// Specific service classes for your app entities
export class UserService extends DatabaseService {
  static collectionName = 'users';

  static async createUser(userData: any) {
    console.log('🔄 Creating user in Firestore:', userData);
    const result = await this.create(this.collectionName, userData);
    console.log('✅ User created in Firestore:', result);
    return result;
  }

  static async getUserById(id: string) {
    return await this.getById(this.collectionName, id);
  }

  static async getUserByEmail(email: string) {
    const users = await this.query(this.collectionName, [
      { field: 'email', operator: '==', value: email }
    ]);
    return users.length > 0 ? users[0] : null;
  }

  static async updateUser(id: string, userData: any) {
    return await this.update(this.collectionName, id, userData);
  }

  static async getAllUsers() {
    return await this.getAll(this.collectionName, [orderBy('createdAt', 'desc')]);
  }

  static async deleteUser(id: string) {
    console.log('🔄 Deleting user from Firestore:', id);
    const result = await this.delete(this.collectionName, id);
    console.log('✅ User deleted from Firestore:', id);
    return result;
  }
}

export class RestaurantService extends DatabaseService {
  static collectionName = 'restaurants';

  static async createRestaurant(restaurantData: any) {
    return await this.create(this.collectionName, restaurantData);
  }

  static async getRestaurantById(id: string) {
    return await this.getById(this.collectionName, id);
  }

  static async getAllRestaurants() {
    return await this.getAll(this.collectionName, [orderBy('createdAt', 'desc')]);
  }

  static async getActiveRestaurants() {
    return await this.query(this.collectionName, [
      { field: 'status', operator: '==', value: 'active' }
    ]);
  }

  static async updateRestaurant(id: string, restaurantData: any) {
    return await this.update(this.collectionName, id, restaurantData);
  }
}

export class OrderService extends DatabaseService {
  static collectionName = 'orders';

  static async createOrder(orderData: any) {
    return await this.create(this.collectionName, orderData);
  }

  static async getOrderById(id: string) {
    return await this.getById(this.collectionName, id);
  }

  static async getOrdersByUser(userId: string) {
    return await this.query(this.collectionName, [
      { field: 'userId', operator: '==', value: userId }
    ], 'createdAt');
  }

  static async getOrdersByRestaurant(restaurantId: string) {
    return await this.query(this.collectionName, [
      { field: 'restaurantId', operator: '==', value: restaurantId }
    ], 'createdAt');
  }

  static async updateOrderStatus(id: string, status: string) {
    return await this.update(this.collectionName, id, { status });
  }
}

export class DriverService extends DatabaseService {
  static collectionName = 'drivers';

  static async createDriver(driverData: any) {
    return await this.create(this.collectionName, driverData);
  }

  static async getDriverById(id: string) {
    return await this.getById(this.collectionName, id);
  }

  static async getAllDrivers() {
    return await this.getAll(this.collectionName, [orderBy('createdAt', 'desc')]);
  }

  static async getAvailableDrivers() {
    return await this.query(this.collectionName, [
      { field: 'status', operator: '==', value: 'available' }
    ]);
  }

  static async updateDriverStatus(id: string, status: string) {
    return await this.update(this.collectionName, id, { status });
  }
}
