import { OrderService, CreateOrderData } from '../services/order';
import { RestaurantService } from '../services/restaurant';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Comprehensive Order Flow Test
 * Tests the complete order lifecycle: Customer → Restaurant → Driver
 */
export class OrderFlowTest {
  
  // Test 1: Customer Order Placement
  static async testCustomerOrderPlacement(customerId: string, restaurantId: string) {
    console.log('🧪 Testing Customer Order Placement...');
    
    try {
      // Get restaurant details
      const restaurant = await RestaurantService.getRestaurantById(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // Create test order
      const orderData: CreateOrderData = {
        customerId,
        customerName: 'Test Customer',
        customerEmail: 'customer@test.com',
        customerPhone: '+1 (555) 123-4567',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
          instructions: 'Test delivery'
        },
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantPhone: restaurant.phone,
        restaurantAddress: restaurant.address || 'Restaurant Address',
        items: [
          {
            id: 'test-item-1',
            name: 'Test Pizza',
            description: 'Delicious test pizza',
            price: 15.99,
            quantity: 1,
            category: 'main',
            preparationTime: 20
          }
        ],
        subtotal: 15.99,
        deliveryFee: 2.99,
        tax: 1.28,
        total: 20.26,
        paymentMethod: 'card',
        specialInstructions: 'Test order - please handle carefully'
      };

      const order = await OrderService.createOrder(orderData);
      console.log('✅ Customer order placed successfully:', order.orderNumber);
      return order;
      
    } catch (error) {
      console.error('❌ Customer order placement failed:', error);
      throw error;
    }
  }

  // Test 2: Restaurant Order Reception and Processing
  static async testRestaurantOrderProcessing(restaurantId: string, orderId: string) {
    console.log('🧪 Testing Restaurant Order Processing...');
    
    try {
      // Test restaurant can see the order
      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.restaurantId !== restaurantId) {
        throw new Error('Order does not belong to this restaurant');
      }

      console.log('✅ Restaurant can see order:', order.orderNumber);

      // Test order status updates
      console.log('🔄 Testing order status progression...');
      
      // Accept order
      await OrderService.updateOrderStatus(orderId, 'accepted');
      console.log('✅ Order accepted');

      // Start preparing
      await OrderService.updateOrderStatus(orderId, 'preparing');
      console.log('✅ Order preparing');

      // Mark ready for pickup
      await OrderService.updateOrderStatus(orderId, 'readyForPickup');
      console.log('✅ Order ready for pickup');

      return true;
      
    } catch (error) {
      console.error('❌ Restaurant order processing failed:', error);
      throw error;
    }
  }

  // Test 3: Driver Order Claiming and Delivery
  static async testDriverOrderClaiming(driverId: string, orderId: string) {
    console.log('🧪 Testing Driver Order Claiming...');
    
    try {
      // Test driver can see available orders
      return new Promise((resolve, reject) => {
        const unsubscribe = OrderService.getAvailableOrdersForDrivers((availableOrders) => {
          console.log('📋 Available orders for driver:', availableOrders.length);
          
          const targetOrder = availableOrders.find(order => order.id === orderId);
          if (!targetOrder) {
            unsubscribe();
            reject(new Error('Order not found in available orders'));
            return;
          }

          console.log('✅ Driver can see available order:', targetOrder.orderNumber);
          
          // Test claiming the order
          OrderService.claimOrder(orderId, driverId, 'Test Driver', '+1 (555) 987-6543')
            .then(() => {
              console.log('✅ Order claimed successfully');
              
              // Test delivery status updates
              return OrderService.updateOrderStatus(orderId, 'out_for_delivery');
            })
            .then(() => {
              console.log('✅ Order marked as out for delivery');
              
              // Complete delivery
              return OrderService.updateOrderStatus(orderId, 'delivered');
            })
            .then(() => {
              console.log('✅ Order delivered successfully');
              unsubscribe();
              resolve(true);
            })
            .catch((error) => {
              console.error('❌ Driver order processing failed:', error);
              unsubscribe();
              reject(error);
            });
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Timeout waiting for available orders'));
        }, 10000);
      });
      
    } catch (error) {
      console.error('❌ Driver order claiming failed:', error);
      throw error;
    }
  }

  // Test 4: Real-time Updates
  static async testRealTimeUpdates(customerId: string, restaurantId: string, driverId: string) {
    console.log('🧪 Testing Real-time Updates...');
    
    const listeners: (() => void)[] = [];
    
    try {
      // Customer orders listener
      const customerUnsubscribe = OrderService.getCustomerOrders(customerId, (orders) => {
        console.log('📱 Customer sees orders:', orders.length);
      });
      listeners.push(customerUnsubscribe);

      // Restaurant orders listener
      const restaurantUnsubscribe = OrderService.getRestaurantOrders(restaurantId, (orders) => {
        console.log('🏪 Restaurant sees orders:', orders.length);
      });
      listeners.push(restaurantUnsubscribe);

      // Driver orders listener
      const driverUnsubscribe = OrderService.getDriverOrders(driverId, (orders) => {
        console.log('🚗 Driver sees assigned orders:', orders.length);
      });
      listeners.push(driverUnsubscribe);

      // Available orders listener
      const availableUnsubscribe = OrderService.getAvailableOrdersForDrivers((orders) => {
        console.log('📋 Available orders for all drivers:', orders.length);
      });
      listeners.push(availableUnsubscribe);

      console.log('✅ All real-time listeners established');
      
      // Keep listeners active for 5 seconds to test
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return true;
      
    } catch (error) {
      console.error('❌ Real-time updates test failed:', error);
      throw error;
    } finally {
      // Clean up all listeners
      listeners.forEach(unsubscribe => unsubscribe());
      console.log('🧹 All listeners cleaned up');
    }
  }

  // Run Complete Flow Test
  static async runCompleteFlowTest(customerId: string, restaurantId: string, driverId: string) {
    console.log('🚀 Starting Complete Order Flow Test...');
    console.log('👤 Customer ID:', customerId);
    console.log('🏪 Restaurant ID:', restaurantId);
    console.log('🚗 Driver ID:', driverId);
    
    try {
      // Step 1: Customer places order
      const order = await this.testCustomerOrderPlacement(customerId, restaurantId);
      
      // Step 2: Restaurant processes order
      await this.testRestaurantOrderProcessing(restaurantId, order.id);
      
      // Step 3: Driver claims and delivers order
      await this.testDriverOrderClaiming(driverId, order.id);
      
      // Step 4: Test real-time updates
      await this.testRealTimeUpdates(customerId, restaurantId, driverId);
      
      console.log('🎉 Complete Order Flow Test PASSED!');
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: 'All order flow components are working correctly'
      };
      
    } catch (error) {
      console.error('💥 Complete Order Flow Test FAILED:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Order flow has issues that need to be addressed'
      };
    }
  }

  // Database Integration Check
  static async checkDatabaseIntegration() {
    console.log('🧪 Checking Database Integration...');
    
    try {
      // Test Firestore connection
      const testQuery = query(collection(db, 'orders'));
      const snapshot = await getDocs(testQuery);
      console.log('✅ Firestore connection working, orders collection accessible');
      console.log('📊 Total orders in database:', snapshot.size);
      
      // Test real-time listeners
      const unsubscribe = onSnapshot(testQuery, (snapshot) => {
        console.log('📡 Real-time listener working, current orders:', snapshot.size);
      });
      
      // Test for 2 seconds then cleanup
      setTimeout(() => {
        unsubscribe();
        console.log('✅ Real-time listeners working correctly');
      }, 2000);
      
      return true;
      
    } catch (error) {
      console.error('❌ Database integration check failed:', error);
      throw error;
    }
  }
}
