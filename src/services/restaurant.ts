import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  imageUrl?: string;
  available: boolean;
  popular: boolean;
  preparationTime: string;
  ingredients: string[];
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  cuisine: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  rating: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RestaurantService {
  // Create or update restaurant profile - saves to restaurants/{uid} structure
  static async createRestaurant(restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    try {
      // Use the owner's UID as the restaurant document ID for restaurants/{uid} structure
      const restaurantId = restaurantData.ownerId || doc(collection(db, 'restaurants')).id;
      const defaultHours = {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '23:00', closed: false },
        saturday: { open: '09:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      };

      const newRestaurant: Restaurant = {
        id: restaurantId,
        ownerId: restaurantData.ownerId || '',
        name: restaurantData.name || '',
        description: restaurantData.description || '',
        cuisine: restaurantData.cuisine || '',
        address: restaurantData.address || '',
        phone: restaurantData.phone || '',
        email: restaurantData.email || '',
        website: restaurantData.website || '',
        hours: restaurantData.hours || defaultHours,
        rating: 0,
        totalOrders: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...restaurantData
      };

      const restaurantDocData = {
        ...newRestaurant,
        createdAt: Timestamp.fromDate(newRestaurant.createdAt),
        updatedAt: Timestamp.fromDate(newRestaurant.updatedAt)
      };

      // Save to restaurants/{uid} collection structure
      await setDoc(doc(db, 'restaurants', restaurantId), restaurantDocData);

      return newRestaurant;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }

  // Get restaurant by owner ID
  static async getRestaurantByOwnerId(ownerId: string): Promise<Restaurant | null> {
    try {
      const q = query(collection(db, 'restaurants'), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Restaurant;
      }

      return null;
    } catch (error) {
      console.error('Error getting restaurant by owner ID:', error);
      throw error;
    }
  }

  // Real-time subscription to restaurant data
  static subscribeToRestaurant(
    ownerId: string,
    callback: (restaurant: Restaurant | null) => void
  ): () => void {
    // First try to get by document ID (restaurants/{uid} structure)
    const docRef = doc(db, 'restaurants', ownerId);

    return onSnapshot(docRef, (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const restaurant: Restaurant = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Restaurant;
        callback(restaurant);
      } else {
        // If not found by document ID, try query by ownerId
        const q = query(collection(db, 'restaurants'), where('ownerId', '==', ownerId));
        const unsubscribeQuery = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            const restaurant: Restaurant = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as Restaurant;
            callback(restaurant);
          } else {
            callback(null);
          }
        });
        return unsubscribeQuery;
      }
    }, (error) => {
      console.error('Error listening to restaurant:', error);
      callback(null);
    });
  }

  // Update restaurant
  static async updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(doc(db, 'restaurants', restaurantId), updateData);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }

  // Get all restaurants
  static async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'restaurants'));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Restaurant;
      });
    } catch (error) {
      console.error('Error getting restaurants:', error);
      throw error;
    }
  }
}

export class MenuService {
  // Create menu item - now saves to both menuItems and menus collections
  static async createMenuItem(menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const menuItemId = doc(collection(db, 'menuItems')).id;
      const newMenuItem: MenuItem = {
        id: menuItemId,
        ...menuItem,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const menuItemData = {
        ...newMenuItem,
        createdAt: Timestamp.fromDate(newMenuItem.createdAt),
        updatedAt: Timestamp.fromDate(newMenuItem.updatedAt)
      };

      // Save to menuItems collection (existing structure)
      await setDoc(doc(db, 'menuItems', menuItemId), menuItemData);

      // Also save to menus collection for easier querying
      await setDoc(doc(db, 'menus', menuItemId), {
        ...menuItemData,
        restaurantId: menuItem.restaurantId
      });

      // IMPORTANT: Also save to restaurants/{restaurantId}/menu subcollection for customer dashboard
      const restaurantMenuData = {
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        category: menuItem.category,
        imageUrl: menuItem.imageUrl || menuItem.image || '', // Use imageUrl first, fallback to image
        available: menuItem.available,
        isAvailable: menuItem.available, // Backward compatibility
        preparationTime: parseInt(menuItem.preparationTime) || 15,
        ingredients: menuItem.ingredients || [],
        allergens: menuItem.allergens || [],
        isVegetarian: false, // Default values - can be enhanced later
        isVegan: false,
        isGlutenFree: false,
        calories: 0,
        createdAt: Timestamp.fromDate(newMenuItem.createdAt),
        updatedAt: Timestamp.fromDate(newMenuItem.updatedAt)
      };

      await setDoc(doc(db, 'restaurants', menuItem.restaurantId, 'menu', menuItemId), restaurantMenuData);

      return newMenuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  // Get menu items by restaurant ID
  static async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(db, 'menuItems'), 
        where('restaurantId', '==', restaurantId),
        orderBy('category'),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MenuItem;
      });
    } catch (error) {
      console.error('Error getting menu items:', error);
      throw error;
    }
  }

  // Add menu item
  static async addMenuItem(restaurantId: string, menuItemData: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const menuItemRef = doc(collection(db, 'restaurants', restaurantId, 'menu'));
      const newMenuItem = {
        ...menuItemData,
        id: menuItemRef.id,
        restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(menuItemRef, {
        ...newMenuItem,
        createdAt: Timestamp.fromDate(newMenuItem.createdAt),
        updatedAt: Timestamp.fromDate(newMenuItem.updatedAt)
      });

      console.log('✅ Menu item added successfully to restaurants/' + restaurantId + '/menu/' + menuItemRef.id);
      console.log('✅ Menu item data saved:', newMenuItem);
      return newMenuItem as MenuItem;
    } catch (error) {
      console.error('❌ Error adding menu item:', error);
      throw error;
    }
  }

  // Update menu item
  static async updateMenuItem(restaurantId: string, menuItemId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      const menuItemRef = doc(db, 'restaurants', restaurantId, 'menu', menuItemId);
      await updateDoc(menuItemRef, updateData);

      // Return updated item
      const updatedDoc = await getDoc(menuItemRef);
      const updatedData = updatedDoc.data();

      console.log('✅ Menu item updated successfully at restaurants/' + restaurantId + '/menu/' + menuItemId);
      console.log('✅ Updated data:', updatedData);
      return {
        id: menuItemId,
        ...updatedData,
        createdAt: updatedData?.createdAt?.toDate() || new Date(),
        updatedAt: updatedData?.updatedAt?.toDate() || new Date()
      } as MenuItem;
    } catch (error) {
      console.error('❌ Error updating menu item:', error);
      throw error;
    }
  }

  // Delete menu item
  static async deleteMenuItem(restaurantId: string, menuItemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'menu', menuItemId));
      console.log('✅ Menu item deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      throw error;
    }
  }

  // Listen to menu items changes
  static subscribeToMenuItems(
    restaurantId: string,
    callback: (menuItems: MenuItem[]) => void
  ): () => void {
    // Simplified query to avoid index issues - sort on client side
    const q = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const menuItems = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MenuItem;
      });
      callback(menuItems);
    });
  }

  // Update restaurant logo URL
  static async updateRestaurantLogo(restaurantId: string, logoUrl: string): Promise<void> {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        logoUrl,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Restaurant logo updated successfully');
    } catch (error) {
      console.error('❌ Error updating restaurant logo:', error);
      throw new Error('Failed to update restaurant logo');
    }
  }

  // Update menu item image URL
  static async updateMenuItemImage(restaurantId: string, itemId: string, imageUrl: string): Promise<void> {
    try {
      const menuItemRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
      await updateDoc(menuItemRef, {
        imageUrl,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Menu item image updated successfully at restaurants/' + restaurantId + '/menu/' + itemId);
      console.log('✅ Image URL saved:', imageUrl);
    } catch (error) {
      console.error('❌ Error updating menu item image:', error);
      throw new Error('Failed to update menu item image');
    }
  }
}
