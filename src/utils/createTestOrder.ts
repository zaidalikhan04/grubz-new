import { OrderService, CreateOrderData } from '../services/order';
import { RestaurantService } from '../services/restaurant';

export const createTestOrder = async (restaurantId: string) => {
  try {
    // Get restaurant details
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Create test order data
    const testOrderData: CreateOrderData = {
      customerId: 'test-customer-123',
      customerName: 'John Test Customer',
      customerEmail: 'customer@test.com',
      customerPhone: '+1 (555) 123-4567',
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        instructions: 'Apt 2B'
      },
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantPhone: restaurant.phone,
      restaurantAddress: restaurant.address || '123 Restaurant Street, Food City, FC 12345',
      items: [
        {
          id: 'test-item-1',
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          price: 15.99,
          quantity: 2,
          category: 'main',
          preparationTime: 20,
          specialInstructions: 'Extra cheese'
        },
        {
          id: 'test-item-2',
          name: 'Test Salad',
          description: 'Fresh test salad',
          price: 8.99,
          quantity: 1,
          category: 'salad',
          preparationTime: 10,
          specialInstructions: 'Dressing on the side'
        }
      ],
      subtotal: 40.97,
      deliveryFee: 2.99,
      tax: 3.28,
      total: 47.24,
      paymentMethod: 'card',
      specialInstructions: 'Please ring doorbell twice'
    };

    // Create the order
    const order = await OrderService.createOrder(testOrderData);
    console.log('✅ Test order created:', order);
    return order;

  } catch (error) {
    console.error('❌ Error creating test order:', error);
    throw error;
  }
};

// Create multiple test orders with different statuses
export const createMultipleTestOrders = async (restaurantId: string) => {
  try {
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const testOrders = [
      {
        customerName: 'Alice Johnson',
        customerEmail: 'alice@test.com',
        items: [
          {
            id: 'item-1',
            name: 'Margherita Pizza',
            description: 'Classic pizza with tomato and mozzarella',
            price: 14.99,
            quantity: 1,
            category: 'pizza',
            preparationTime: 15
          }
        ],
        total: 18.27
      },
      {
        customerName: 'Bob Smith',
        customerEmail: 'bob@test.com',
        items: [
          {
            id: 'item-2',
            name: 'Chicken Burger',
            description: 'Grilled chicken burger with fries',
            price: 12.99,
            quantity: 2,
            category: 'burger',
            preparationTime: 12
          }
        ],
        total: 28.96
      },
      {
        customerName: 'Carol Davis',
        customerEmail: 'carol@test.com',
        items: [
          {
            id: 'item-3',
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce with caesar dressing',
            price: 9.99,
            quantity: 1,
            category: 'salad',
            preparationTime: 8
          },
          {
            id: 'item-4',
            name: 'Garlic Bread',
            description: 'Toasted bread with garlic butter',
            price: 4.99,
            quantity: 2,
            category: 'appetizer',
            preparationTime: 5
          }
        ],
        total: 22.95
      }
    ];

    const createdOrders = [];
    
    for (let i = 0; i < testOrders.length; i++) {
      const testOrder = testOrders[i];
      const subtotal = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 2.99;
      const tax = subtotal * 0.08;
      const total = subtotal + deliveryFee + tax;

      const orderData: CreateOrderData = {
        customerId: `test-customer-${i + 1}`,
        customerName: testOrder.customerName,
        customerEmail: testOrder.customerEmail,
        customerPhone: `+1 (555) ${100 + i}${200 + i}-${300 + i}${400 + i}`,
        deliveryAddress: {
          street: `${100 + i * 10} Test Street`,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
          instructions: `Apt ${i + 1}A`
        },
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantPhone: restaurant.phone,
        items: testOrder.items,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod: i % 2 === 0 ? 'card' : 'cash',
        specialInstructions: i === 0 ? 'Please call when arriving' : undefined
      };

      const order = await OrderService.createOrder(orderData);
      createdOrders.push(order);
      console.log(`✅ Test order ${i + 1} created:`, order.orderNumber);
    }

    return createdOrders;

  } catch (error) {
    console.error('❌ Error creating multiple test orders:', error);
    throw error;
  }
};
