import { RestaurantService } from '../services/restaurant';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const createQuickTestRestaurant = async (userId: string, userName: string) => {
  try {
    console.log('🔄 Creating quick test restaurant for user:', userId);

    // Create restaurant data
    const restaurantData = {
      ownerId: userId,
      name: `${userName}'s Test Restaurant`,
      description: 'A test restaurant for order management testing',
      cuisine: 'American',
      address: '123 Test Street, Test City, TS 12345',
      phone: '+1 (555) 123-4567',
      email: 'test@restaurant.com',
      website: 'https://testrestaurant.com',
      hours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '23:00', closed: false },
        saturday: { open: '09:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      },
      status: 'approved',
      isActive: true,
      rating: 4.5,
      totalOrders: 0,
      totalReviews: 0
    };

    // Create the restaurant
    const restaurant = await RestaurantService.createRestaurant(restaurantData);

    // Update user document with restaurant info
    await updateDoc(doc(db, 'users', userId), {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      hasRestaurant: true,
      role: 'restaurant_owner',
      updatedAt: new Date()
    });

    console.log('✅ Quick test restaurant created:', restaurant);
    return restaurant;

  } catch (error) {
    console.error('❌ Error creating quick test restaurant:', error);
    throw error;
  }
};

export const addTestMenuItems = async (restaurantId: string) => {
  try {
    console.log('🔄 Adding test menu items to restaurant:', restaurantId);

    // This would typically use MenuService, but for simplicity we'll just log
    // In a real implementation, you'd create menu items here
    const testMenuItems = [
      {
        name: 'Test Pizza',
        description: 'Delicious test pizza with cheese and tomato',
        price: 15.99,
        category: 'pizza',
        preparationTime: '15-20 min',
        available: true
      },
      {
        name: 'Test Burger',
        description: 'Juicy test burger with fries',
        price: 12.99,
        category: 'burgers',
        preparationTime: '10-15 min',
        available: true
      },
      {
        name: 'Test Salad',
        description: 'Fresh test salad with mixed greens',
        price: 8.99,
        category: 'salads',
        preparationTime: '5-10 min',
        available: true
      }
    ];

    console.log('✅ Test menu items would be created:', testMenuItems);
    return testMenuItems;

  } catch (error) {
    console.error('❌ Error adding test menu items:', error);
    throw error;
  }
};
