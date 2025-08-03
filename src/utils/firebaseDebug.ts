import { db } from '../config/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export class FirebaseDebugger {
  
  // Test basic Firestore connection
  static async testConnection() {
    try {
      console.log('🔄 Testing Firebase connection...');
      
      // Test basic collection access
      const testQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(testQuery);
      
      console.log('✅ Firebase connection successful');
      console.log(`📊 Found ${snapshot.size} users in database`);
      
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }

  // Test restaurant queries
  static async testRestaurantQueries() {
    try {
      console.log('🔄 Testing restaurant queries...');
      
      // Test approved restaurants query
      const approvedQuery = query(
        collection(db, 'restaurants'),
        where('status', '==', 'approved')
      );
      
      const approvedSnapshot = await getDocs(approvedQuery);
      console.log(`✅ Found ${approvedSnapshot.size} approved restaurants`);
      
      // Test all restaurants
      const allQuery = query(collection(db, 'restaurants'));
      const allSnapshot = await getDocs(allQuery);
      console.log(`📊 Total restaurants: ${allSnapshot.size}`);
      
      return true;
    } catch (error) {
      console.error('❌ Restaurant query failed:', error);
      return false;
    }
  }

  // Test order queries
  static async testOrderQueries(userId?: string) {
    try {
      console.log('🔄 Testing order queries...');
      
      if (userId) {
        // Test user orders query
        const userOrdersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', userId)
        );
        
        const userOrdersSnapshot = await getDocs(userOrdersQuery);
        console.log(`✅ Found ${userOrdersSnapshot.size} orders for user ${userId}`);
      }
      
      // Test all orders
      const allOrdersQuery = query(collection(db, 'orders'));
      const allOrdersSnapshot = await getDocs(allOrdersQuery);
      console.log(`📊 Total orders: ${allOrdersSnapshot.size}`);
      
      return true;
    } catch (error) {
      console.error('❌ Order query failed:', error);
      return false;
    }
  }

  // Test real-time listeners
  static testRealTimeListeners() {
    console.log('🔄 Testing real-time listeners...');
    
    // Test restaurant listener
    const restaurantQuery = query(
      collection(db, 'restaurants'),
      where('status', '==', 'approved')
    );
    
    const unsubscribe = onSnapshot(
      restaurantQuery,
      (snapshot) => {
        console.log(`📡 Real-time update: ${snapshot.size} approved restaurants`);
        
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          console.log(`📄 ${change.type}: ${data.name || data.restaurantName}`);
        });
      },
      (error) => {
        console.error('❌ Real-time listener error:', error);
      }
    );
    
    // Return unsubscribe function
    return unsubscribe;
  }

  // Run all tests
  static async runAllTests(userId?: string) {
    console.log('🚀 Starting Firebase debug tests...');
    
    const results = {
      connection: await this.testConnection(),
      restaurants: await this.testRestaurantQueries(),
      orders: await this.testOrderQueries(userId)
    };
    
    console.log('📊 Test Results:', results);
    
    if (results.connection && results.restaurants && results.orders) {
      console.log('✅ All Firebase tests passed!');
    } else {
      console.log('❌ Some Firebase tests failed');
    }
    
    return results;
  }
}

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Run tests after a short delay to allow Firebase to initialize
  setTimeout(() => {
    FirebaseDebugger.runAllTests();
  }, 2000);
}
