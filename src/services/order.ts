import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type OrderStatus =
  | 'pending'           // Customer placed order
  | 'accepted'          // Restaurant accepted
  | 'rejected'          // Restaurant rejected
  | 'preparing'         // Restaurant is preparing
  | 'readyForPickup'    // Ready for pickup/delivery - available to all drivers
  | 'assigned'          // Driver assigned
  | 'out_for_delivery'  // Driver picked up
  | 'delivered'         // Order completed
  | 'cancelled';        // Order cancelled

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  preparationTime: number;
  specialInstructions?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  instructions?: string;
}

export interface Order {
  id: string;
  
  // Customer Information
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  
  // Restaurant Information
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  
  // Order Details
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  
  // Order Management
  status: OrderStatus;
  orderNumber: string;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  
  // Driver Information (when assigned)
  assignedDriverId?: string;
  driverName?: string;
  driverPhone?: string;
  
  // Payment
  paymentMethod: 'cash' | 'card' | 'digital_wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Special Instructions
  specialInstructions?: string;
  restaurantNotes?: string;
  driverNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  readyAt?: Date;
  assignedAt?: Date;
  deliveredAt?: Date;
}

export interface CreateOrderData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital_wallet';
  specialInstructions?: string;
}

export class OrderService {
  private static readonly COLLECTION_NAME = 'orders';

  // Generate unique order number
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  // Create a new order
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const now = new Date();
      const estimatedDeliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now

      // Ensure all required fields have valid values (no undefined)
      const sanitizedOrderData: CreateOrderData = {
        customerId: orderData.customerId ?? '',
        customerName: orderData.customerName ?? '',
        customerEmail: orderData.customerEmail ?? '',
        customerPhone: orderData.customerPhone ?? '',
        deliveryAddress: {
          street: orderData.deliveryAddress?.street ?? '',
          city: orderData.deliveryAddress?.city ?? '',
          state: orderData.deliveryAddress?.state ?? '',
          zipCode: orderData.deliveryAddress?.zipCode ?? '',
          country: orderData.deliveryAddress?.country ?? 'US',
          coordinates: orderData.deliveryAddress?.coordinates ?? null,
          instructions: orderData.deliveryAddress?.instructions ?? ''
        },
        restaurantId: orderData.restaurantId ?? '',
        restaurantName: orderData.restaurantName ?? '',
        restaurantPhone: orderData.restaurantPhone ?? '',
        restaurantAddress: orderData.restaurantAddress ?? '',
        items: (orderData.items ?? []).map(item => ({
          id: item.id ?? '',
          name: item.name ?? '',
          description: item.description ?? '',
          price: item.price ?? 0,
          quantity: item.quantity ?? 0,
          category: item.category ?? '',
          preparationTime: item.preparationTime ?? 15,
          specialInstructions: item.specialInstructions ?? ''
        })),
        subtotal: orderData.subtotal ?? 0,
        deliveryFee: orderData.deliveryFee ?? 0,
        tax: orderData.tax ?? 0,
        total: orderData.total ?? 0,
        paymentMethod: orderData.paymentMethod ?? 'cash',
        specialInstructions: orderData.specialInstructions ?? ''
      };

      const newOrder: Omit<Order, 'id'> = {
        ...sanitizedOrderData,
        status: 'pending',
        orderNumber: this.generateOrderNumber(),
        estimatedDeliveryTime,
        paymentStatus: 'pending',
        createdAt: now,
        updatedAt: now
      };

      // Create Firestore document with only defined values
      const firestoreData = {
        ...newOrder,
        createdAt: Timestamp.fromDate(newOrder.createdAt),
        updatedAt: Timestamp.fromDate(newOrder.updatedAt),
        estimatedDeliveryTime: Timestamp.fromDate(newOrder.estimatedDeliveryTime)
      };

      // Remove any remaining undefined values (extra safety)
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key as keyof typeof firestoreData] === undefined) {
          delete firestoreData[key as keyof typeof firestoreData];
        }
      });

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);

      console.log('✅ Order created successfully:', docRef.id);
      return { id: docRef.id, ...newOrder };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate(),
          acceptedAt: data.acceptedAt?.toDate(),
          readyAt: data.readyAt?.toDate(),
          assignedAt: data.assignedAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate()
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    additionalData?: Partial<Order>
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
        ...additionalData
      };

      // Add timestamp for specific status changes
      const now = Timestamp.fromDate(new Date());
      switch (status) {
        case 'accepted':
          updateData.acceptedAt = now;
          break;
        case 'readyForPickup':
          updateData.readyAt = now;
          break;
        case 'assigned':
        case 'out_for_delivery':
          updateData.assignedAt = now;
          break;
        case 'delivered':
          updateData.deliveredAt = now;
          updateData.actualDeliveryTime = now;
          break;
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, orderId), updateData);
      console.log('✅ Order status updated:', orderId, status);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Assign driver to order
  static async assignDriver(
    orderId: string, 
    driverId: string, 
    driverName: string, 
    driverPhone: string
  ): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'assigned', {
        assignedDriverId: driverId,
        driverName,
        driverPhone
      });
      console.log('✅ Driver assigned to order:', orderId, driverId);
    } catch (error) {
      console.error('❌ Error assigning driver:', error);
      throw new Error('Failed to assign driver');
    }
  }

  // Get orders for customer
  static getCustomerOrders(customerId: string, callback: (orders: Order[]) => void) {
    console.log('🔍 OrderService.getCustomerOrders called with customerId:', customerId);

    // Use customerId field consistently (this matches our order creation)
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('customerId', '==', customerId)
    );

    return onSnapshot(q, (querySnapshot) => {
      console.log('📄 OrderService query snapshot received, size:', querySnapshot.size);
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📋 Order document:', doc.id, data);
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate(),
          acceptedAt: data.acceptedAt?.toDate(),
          readyAt: data.readyAt?.toDate(),
          assignedAt: data.assignedAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate()
        } as Order);
      });

      // Sort by createdAt desc on client side
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log('✅ OrderService returning', orders.length, 'orders');
      callback(orders);
    }, (error) => {
      console.error('❌ OrderService query error:', error);
    });
  }

  // Get orders for restaurant
  static getRestaurantOrders(restaurantId: string, callback: (orders: Order[]) => void) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate(),
          acceptedAt: data.acceptedAt?.toDate(),
          readyAt: data.readyAt?.toDate(),
          assignedAt: data.assignedAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate()
        } as Order);
      });
      callback(orders);
    });
  }

  // Get orders for driver (assigned to them)
  static getDriverOrders(driverId: string, callback: (orders: Order[]) => void) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('assignedDriverId', '==', driverId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate(),
          acceptedAt: data.acceptedAt?.toDate(),
          readyAt: data.readyAt?.toDate(),
          assignedAt: data.assignedAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate()
        } as Order);
      });

      // Sort by createdAt desc on client side (temporary while index builds)
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      callback(orders);
    });
  }

  // Get available orders for drivers to claim (status = 'readyForPickup' and no assigned driver)
  static getAvailableOrdersForDrivers(callback: (orders: Order[]) => void) {
    // Query for orders that are ready for pickup and not yet assigned
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', '==', 'readyForPickup')
      // Note: We'll filter out assigned orders in the callback since we can't use compound queries without index
    );

    return onSnapshot(q, (querySnapshot) => {
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include orders that are readyForPickup and don't have an assigned driver
        if (data.status === 'readyForPickup' && !data.assignedDriverId) {
          orders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
            actualDeliveryTime: data.actualDeliveryTime?.toDate(),
            acceptedAt: data.acceptedAt?.toDate(),
            readyAt: data.readyAt?.toDate(),
            assignedAt: data.assignedAt?.toDate(),
            deliveredAt: data.deliveredAt?.toDate()
          } as Order);
        }
      });

      // Sort by readyAt time (most recent first)
      orders.sort((a, b) => {
        const aTime = a.readyAt?.getTime() || a.createdAt.getTime();
        const bTime = b.readyAt?.getTime() || b.createdAt.getTime();
        return bTime - aTime;
      });

      console.log(`📋 Available orders for drivers: ${orders.length}`);
      callback(orders);
    });
  }

  // Backward compatibility method
  static getAvailableOrders(callback: (orders: Order[]) => void) {
    return this.getAvailableOrdersForDrivers(callback);
  }

  // Atomically claim an order (prevents race conditions)
  static async claimOrder(
    orderId: string,
    driverId: string,
    driverName: string,
    driverPhone: string
  ): Promise<void> {
    try {
      console.log('🚗 Driver attempting to claim order:', orderId, driverId);

      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, this.COLLECTION_NAME, orderId);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists()) {
          throw new Error('Order not found');
        }

        const orderData = orderDoc.data();

        // Check if order is still available for claiming
        if (orderData.status !== 'readyForPickup') {
          throw new Error(`Order is not ready for pickup. Current status: ${orderData.status}`);
        }

        if (orderData.assignedDriverId) {
          throw new Error('Order has already been claimed by another driver');
        }

        // Atomically update the order with driver assignment
        const now = Timestamp.fromDate(new Date());
        transaction.update(orderRef, {
          status: 'assigned',
          assignedDriverId: driverId,
          driverName,
          driverPhone,
          assignedAt: now,
          updatedAt: now
        });

        console.log('✅ Order claimed successfully in transaction:', orderId, driverId);
      });

      console.log('✅ Transaction completed - Order claimed:', orderId, driverId);
    } catch (error) {
      console.error('❌ Error claiming order:', error);
      throw error;
    }
  }
}
