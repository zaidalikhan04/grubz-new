// Example usage of Firebase database services
// This file shows how to use the database services in your components

import { UserService, RestaurantService, OrderService, DriverService } from '../services/database';
import { where, orderBy, limit } from 'firebase/firestore';

// Example: User Management
export const userExamples = {
  // Create a new user
  async createUser() {
    const userData = {
      email: 'newuser@example.com',
      name: 'New User',
      role: 'customer',
      phone: '+1234567890',
      address: '123 Main St'
    };
    
    const user = await UserService.createUser(userData);
    console.log('Created user:', user);
    return user;
  },

  // Get user by ID
  async getUser(userId: string) {
    const user = await UserService.getUserById(userId);
    console.log('User:', user);
    return user;
  },

  // Get user by email
  async getUserByEmail(email: string) {
    const user = await UserService.getUserByEmail(email);
    console.log('User by email:', user);
    return user;
  },

  // Update user
  async updateUser(userId: string) {
    const updatedData = {
      name: 'Updated Name',
      phone: '+1987654321'
    };
    
    const user = await UserService.updateUser(userId, updatedData);
    console.log('Updated user:', user);
    return user;
  },

  // Get all users
  async getAllUsers() {
    const users = await UserService.getAllUsers();
    console.log('All users:', users);
    return users;
  }
};

// Example: Restaurant Management
export const restaurantExamples = {
  // Create a new restaurant
  async createRestaurant() {
    const restaurantData = {
      name: 'Pizza Palace',
      description: 'Best pizza in town',
      address: '456 Food St',
      phone: '+1234567890',
      email: 'info@pizzapalace.com',
      cuisine: 'Italian',
      status: 'pending',
      ownerId: 'user-id-here',
      menu: [
        {
          id: '1',
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato and mozzarella',
          price: 12.99,
          category: 'Pizza'
        }
      ]
    };
    
    const restaurant = await RestaurantService.createRestaurant(restaurantData);
    console.log('Created restaurant:', restaurant);
    return restaurant;
  },

  // Get active restaurants
  async getActiveRestaurants() {
    const restaurants = await RestaurantService.getActiveRestaurants();
    console.log('Active restaurants:', restaurants);
    return restaurants;
  },

  // Update restaurant status
  async updateRestaurantStatus(restaurantId: string, status: string) {
    const restaurant = await RestaurantService.updateRestaurant(restaurantId, { status });
    console.log('Updated restaurant:', restaurant);
    return restaurant;
  }
};

// Example: Order Management
export const orderExamples = {
  // Create a new order
  async createOrder() {
    const orderData = {
      userId: 'customer-user-id',
      restaurantId: 'restaurant-id',
      items: [
        {
          id: '1',
          name: 'Margherita Pizza',
          quantity: 2,
          price: 12.99
        }
      ],
      total: 25.98,
      deliveryAddress: '789 Customer St',
      status: 'pending',
      paymentMethod: 'credit_card'
    };
    
    const order = await OrderService.createOrder(orderData);
    console.log('Created order:', order);
    return order;
  },

  // Get orders for a user
  async getUserOrders(userId: string) {
    const orders = await OrderService.getOrdersByUser(userId);
    console.log('User orders:', orders);
    return orders;
  },

  // Get orders for a restaurant
  async getRestaurantOrders(restaurantId: string) {
    const orders = await OrderService.getOrdersByRestaurant(restaurantId);
    console.log('Restaurant orders:', orders);
    return orders;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const order = await OrderService.updateOrderStatus(orderId, status);
    console.log('Updated order:', order);
    return order;
  }
};

// Example: Driver Management
export const driverExamples = {
  // Create a new driver
  async createDriver() {
    const driverData = {
      userId: 'driver-user-id',
      vehicleType: 'car',
      vehicleModel: 'Honda Civic',
      licensePlate: 'ABC123',
      status: 'available',
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    };
    
    const driver = await DriverService.createDriver(driverData);
    console.log('Created driver:', driver);
    return driver;
  },

  // Get available drivers
  async getAvailableDrivers() {
    const drivers = await DriverService.getAvailableDrivers();
    console.log('Available drivers:', drivers);
    return drivers;
  },

  // Update driver status
  async updateDriverStatus(driverId: string, status: string) {
    const driver = await DriverService.updateDriverStatus(driverId, status);
    console.log('Updated driver:', driver);
    return driver;
  }
};

// Example: Real-time subscriptions
export const realtimeExamples = {
  // Listen to order updates
  subscribeToOrders(userId: string, callback: (orders: any[]) => void) {
    return UserService.subscribe(
      'orders',
      callback,
      [where('userId', '==', userId), orderBy('createdAt', 'desc')]
    );
  },

  // Listen to restaurant orders
  subscribeToRestaurantOrders(restaurantId: string, callback: (orders: any[]) => void) {
    return UserService.subscribe(
      'orders',
      callback,
      [where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc')]
    );
  },

  // Listen to available drivers
  subscribeToAvailableDrivers(callback: (drivers: any[]) => void) {
    return UserService.subscribe(
      'drivers',
      callback,
      [where('status', '==', 'available')]
    );
  }
};

// Example: Complex queries
export const queryExamples = {
  // Get recent orders with pagination
  async getRecentOrders(limitCount: number = 10) {
    const orders = await UserService.query(
      'orders',
      [],
      'createdAt',
      limitCount
    );
    console.log('Recent orders:', orders);
    return orders;
  },

  // Get orders by status
  async getOrdersByStatus(status: string) {
    const orders = await UserService.query(
      'orders',
      [{ field: 'status', operator: '==', value: status }],
      'createdAt'
    );
    console.log(`Orders with status ${status}:`, orders);
    return orders;
  },

  // Get restaurants by cuisine
  async getRestaurantsByCuisine(cuisine: string) {
    const restaurants = await UserService.query(
      'restaurants',
      [
        { field: 'cuisine', operator: '==', value: cuisine },
        { field: 'status', operator: '==', value: 'active' }
      ],
      'name'
    );
    console.log(`${cuisine} restaurants:`, restaurants);
    return restaurants;
  }
};

// Example: Error handling
export const errorHandlingExample = {
  async safeCreateUser(userData: any) {
    try {
      const user = await UserService.createUser(userData);
      return { success: true, data: user };
    } catch (error) {
      console.error('Failed to create user:', error);
      return { success: false, error: error.message };
    }
  }
};
