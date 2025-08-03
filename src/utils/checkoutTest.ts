import { OrderService } from '../services/order';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export class CheckoutTester {
  
  // Test order creation
  static async testOrderCreation(userId: string, restaurantId: string) {
    try {
      console.log('🔄 Testing order creation...');
      
      const testOrder = {
        userId,
        restaurantId,
        items: [
          {
            id: 'test-item-1',
            name: 'Test Waffle',
            price: 6.00,
            quantity: 1,
            restaurantId
          },
          {
            id: 'test-item-2', 
            name: 'Test Chocolate',
            price: 5.00,
            quantity: 1,
            restaurantId
          }
        ],
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        paymentMethod: 'cash',
        specialInstructions: 'Test order - please ignore',
        subtotal: 11.00,
        deliveryFee: 2.99,
        tax: 0.88,
        total: 14.87
      };
      
      const orderId = await OrderService.createOrder(testOrder);
      console.log('✅ Test order created successfully:', orderId);
      
      return orderId;
    } catch (error) {
      console.error('❌ Order creation test failed:', error);
      throw error;
    }
  }

  // Test order retrieval
  static async testOrderRetrieval(userId: string) {
    try {
      console.log('🔄 Testing order retrieval...');
      
      return new Promise((resolve, reject) => {
        const unsubscribe = OrderService.getCustomerOrders(userId, (orders) => {
          console.log(`✅ Retrieved ${orders.length} orders for user`);
          orders.forEach(order => {
            console.log(`📄 Order ${order.id}: ${order.status} - $${order.total}`);
          });
          
          unsubscribe();
          resolve(orders);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Order retrieval timeout'));
        }, 5000);
      });
    } catch (error) {
      console.error('❌ Order retrieval test failed:', error);
      throw error;
    }
  }

  // Test restaurant availability
  static async testRestaurantAvailability() {
    try {
      console.log('🔄 Testing restaurant availability...');
      
      const approvedQuery = query(
        collection(db, 'restaurants'),
        where('status', '==', 'approved')
      );
      
      const snapshot = await getDocs(approvedQuery);
      console.log(`✅ Found ${snapshot.size} approved restaurants`);
      
      const restaurants: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        restaurants.push({
          id: doc.id,
          name: data.name || data.restaurantName,
          status: data.status,
          isActive: data.isActive
        });
        console.log(`🏪 ${data.name || data.restaurantName} - Active: ${data.isActive}`);
      });
      
      return restaurants;
    } catch (error) {
      console.error('❌ Restaurant availability test failed:', error);
      throw error;
    }
  }

  // Run comprehensive checkout tests
  static async runCheckoutTests(userId: string) {
    console.log('🚀 Starting comprehensive checkout tests...');
    
    try {
      // Test 1: Restaurant availability
      const restaurants = await this.testRestaurantAvailability();
      
      if (restaurants.length === 0) {
        throw new Error('No approved restaurants found for testing');
      }
      
      // Test 2: Order creation
      const restaurantId = restaurants[0].id;
      const orderId = await this.testOrderCreation(userId, restaurantId);
      
      // Test 3: Order retrieval
      await this.testOrderRetrieval(userId);
      
      console.log('✅ All checkout tests passed!');
      return {
        success: true,
        orderId,
        restaurantCount: restaurants.length
      };
      
    } catch (error) {
      console.error('❌ Checkout tests failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Auto-run tests in development if user is logged in
if (import.meta.env.DEV) {
  // Wait for auth to initialize, then run tests
  setTimeout(() => {
    // This will be called from the component when user is available
    console.log('🧪 Checkout tester ready - call CheckoutTester.runCheckoutTests(userId) to test');
  }, 3000);
}
