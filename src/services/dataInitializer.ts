import { UserService, RestaurantService, OrderService, DriverService } from './database';
import { AuthService } from './auth';

export class DataInitializer {
  // Initialize sample data for testing
  static async initializeSampleData() {
    try {
      console.log('🚀 Starting data initialization...');

      // Create sample users
      await this.createSampleUsers();
      
      // Create sample restaurants
      await this.createSampleRestaurants();
      
      // Create sample drivers
      await this.createSampleDrivers();
      
      // Create sample orders
      await this.createSampleOrders();

      console.log('✅ Sample data initialization completed!');
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
    }
  }

  static async createSampleUsers() {
    console.log('👥 Creating sample users...');

    const users = [
      {
        email: 'customer@grubz.com',
        password: 'password123',
        name: 'John Customer',
        role: 'customer' as const,
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345'
      },
      {
        email: 'restaurant@grubz.com',
        password: 'password123',
        name: 'Pizza Palace Owner',
        role: 'restaurant_owner' as const,
        phone: '+1 (555) 234-5678',
        address: '456 Business Ave, City, State 12345'
      },
      {
        email: 'driver@grubz.com',
        password: 'password123',
        name: 'Mike Driver',
        role: 'delivery_rider' as const,
        phone: '+1 (555) 345-6789',
        address: '789 Driver Lane, City, State 12345'
      }
    ];

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(userData.email);
        if (!existingUser) {
          await AuthService.register(userData.email, userData.password, {
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            address: userData.address
          });
          console.log(`✅ Created user: ${userData.email}`);
        } else {
          console.log(`ℹ️ User already exists: ${userData.email}`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }
  }

  static async createSampleRestaurants() {
    console.log('🏪 Creating sample restaurants...');

    const restaurants = [
      {
        name: 'Pizza Palace',
        description: 'Authentic Italian pizza made with fresh ingredients',
        address: '123 Pizza Street, City, State 12345',
        phone: '+1 (555) 111-2222',
        email: 'info@pizzapalace.com',
        cuisine: 'Italian',
        status: 'active',
        rating: 4.8,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minimumOrder: 15.00,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        menu: [
          {
            id: '1',
            name: 'Margherita Pizza',
            description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
            price: 14.99,
            category: 'Pizza',
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300'
          },
          {
            id: '2',
            name: 'Pepperoni Pizza',
            description: 'Traditional pizza with pepperoni and mozzarella cheese',
            price: 16.99,
            category: 'Pizza',
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300'
          },
          {
            id: '3',
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce with Caesar dressing and croutons',
            price: 9.99,
            category: 'Salads',
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300'
          }
        ]
      },
      {
        name: 'Burger Express',
        description: 'Gourmet burgers and fries made to order',
        address: '456 Burger Ave, City, State 12345',
        phone: '+1 (555) 333-4444',
        email: 'info@burgerexpress.com',
        cuisine: 'American',
        status: 'active',
        rating: 4.6,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        minimumOrder: 12.00,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
        menu: [
          {
            id: '1',
            name: 'Classic Cheeseburger',
            description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
            price: 12.99,
            category: 'Burgers',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'
          },
          {
            id: '2',
            name: 'Bacon Burger',
            description: 'Beef patty with crispy bacon, cheese, and BBQ sauce',
            price: 14.99,
            category: 'Burgers',
            image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=300'
          },
          {
            id: '3',
            name: 'French Fries',
            description: 'Crispy golden fries with sea salt',
            price: 4.99,
            category: 'Sides',
            image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300'
          }
        ]
      },
      {
        name: 'Sushi Master',
        description: 'Fresh sushi and Japanese cuisine',
        address: '789 Sushi Lane, City, State 12345',
        phone: '+1 (555) 555-6666',
        email: 'info@sushimaster.com',
        cuisine: 'Japanese',
        status: 'active',
        rating: 4.9,
        deliveryTime: '30-40 min',
        deliveryFee: 3.99,
        minimumOrder: 20.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        menu: [
          {
            id: '1',
            name: 'California Roll',
            description: 'Crab, avocado, and cucumber roll',
            price: 8.99,
            category: 'Rolls',
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300'
          },
          {
            id: '2',
            name: 'Salmon Sashimi',
            description: 'Fresh salmon slices (6 pieces)',
            price: 12.99,
            category: 'Sashimi',
            image: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=300'
          }
        ]
      }
    ];

    for (const restaurantData of restaurants) {
      try {
        // Check if restaurant already exists
        const existingRestaurants = await RestaurantService.getAllRestaurants();
        const exists = existingRestaurants.some(r => r.name === restaurantData.name);
        
        if (!exists) {
          await RestaurantService.createRestaurant(restaurantData);
          console.log(`✅ Created restaurant: ${restaurantData.name}`);
        } else {
          console.log(`ℹ️ Restaurant already exists: ${restaurantData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating restaurant ${restaurantData.name}:`, error);
      }
    }
  }

  static async createSampleDrivers() {
    console.log('🚗 Creating sample drivers...');

    const drivers = [
      {
        name: 'Mike Johnson',
        email: 'mike.driver@grubz.com',
        phone: '+1 (555) 777-8888',
        vehicleType: 'car',
        vehicleModel: 'Honda Civic 2020',
        licensePlate: 'ABC-1234',
        status: 'available'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.driver@grubz.com',
        phone: '+1 (555) 999-0000',
        vehicleType: 'motorcycle',
        vehicleModel: 'Yamaha MT-07',
        licensePlate: 'XYZ-5678',
        status: 'busy'
      }
    ];

    for (const driverData of drivers) {
      try {
        const existingDrivers = await DriverService.getAllDrivers();
        const exists = existingDrivers.some(d => d.email === driverData.email);
        
        if (!exists) {
          await DriverService.createDriver(driverData);
          console.log(`✅ Created driver: ${driverData.name}`);
        } else {
          console.log(`ℹ️ Driver already exists: ${driverData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating driver ${driverData.name}:`, error);
      }
    }
  }

  static async createSampleOrders() {
    console.log('📦 Creating sample orders...');

    // Get existing data to create realistic orders
    const users = await UserService.getAllUsers();
    const restaurants = await RestaurantService.getAllRestaurants();
    
    const customer = users.find(u => u.role === 'customer');
    const restaurant = restaurants[0]; // Use first restaurant

    if (customer && restaurant) {
      const sampleOrders = [
        {
          userId: customer.id,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          customerName: customer.name,
          items: [
            {
              id: '1',
              name: 'Margherita Pizza',
              quantity: 2,
              price: 14.99
            },
            {
              id: '3',
              name: 'Caesar Salad',
              quantity: 1,
              price: 9.99
            }
          ],
          subtotal: 39.97,
          deliveryFee: 2.99,
          tax: 3.20,
          total: 46.16,
          deliveryAddress: customer.address,
          status: 'delivered',
          paymentMethod: 'credit_card',
          estimatedDeliveryTime: '25-35 min'
        }
      ];

      for (const orderData of sampleOrders) {
        try {
          await OrderService.createOrder(orderData);
          console.log(`✅ Created sample order`);
        } catch (error) {
          console.error(`❌ Error creating sample order:`, error);
        }
      }
    }
  }

  // Clear all data (use with caution!)
  static async clearAllData() {
    console.log('🗑️ Clearing all data...');
    
    try {
      // Note: This is a simplified version. In a real app, you'd need to 
      // implement proper batch deletion with Firebase Admin SDK
      console.log('⚠️ Data clearing not implemented for safety. Use Firebase Console to delete collections manually.');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  }
}
