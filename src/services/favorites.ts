import { 
  doc, 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Test Firebase connection
console.log('🔥 Firebase db instance:', db);

export interface FavoriteRestaurant {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantCuisine: string;
  restaurantRating: number;
  restaurantAddress: string;
  addedAt: Date;
}

export class FavoritesService {
  // Add restaurant to favorites
  static async addToFavorites(userId: string, restaurantData: {
    restaurantId: string;
    restaurantName: string;
    restaurantCuisine: string;
    restaurantRating: number;
    restaurantAddress: string;
  }): Promise<void> {
    try {
      console.log('🤍 Adding restaurant to favorites:', restaurantData.restaurantName);

      // Check if already in favorites
      const isAlreadyFavorite = await this.isFavorite(userId, restaurantData.restaurantId);
      if (isAlreadyFavorite) {
        console.log('⚠️ Restaurant already in favorites');
        return;
      }

      // Try Firestore first, fallback to localStorage
      try {
        console.log('📝 Creating favorites document...');
        const docRef = await addDoc(collection(db, 'favorites'), {
          userId,
          restaurantId: restaurantData.restaurantId,
          restaurantName: restaurantData.restaurantName,
          restaurantCuisine: restaurantData.restaurantCuisine,
          restaurantRating: restaurantData.restaurantRating,
          restaurantAddress: restaurantData.restaurantAddress,
          addedAt: Timestamp.now()
        });
        console.log('✅ Favorites document created with ID:', docRef.id);

        // Update user's favorite count
        await updateDoc(doc(db, 'users', userId), {
          favoriteRestaurants: increment(1)
        });
        console.log('✅ User favorite count updated');
      } catch (firestoreError) {
        console.log('⚠️ Firestore failed, using localStorage fallback');
        // Fallback to localStorage
        const localFavorites = localStorage.getItem(`favorites_${userId}`);
        const favorites = localFavorites ? JSON.parse(localFavorites) : [];
        if (!favorites.includes(restaurantData.restaurantId)) {
          favorites.push(restaurantData.restaurantId);
          localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));

          // Also store restaurant data
          const favoriteData = localStorage.getItem(`favoriteData_${userId}`);
          const favData = favoriteData ? JSON.parse(favoriteData) : {};
          favData[restaurantData.restaurantId] = restaurantData;
          localStorage.setItem(`favoriteData_${userId}`, JSON.stringify(favData));
        }
      }

      console.log('✅ Restaurant added to favorites successfully');
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove restaurant from favorites
  static async removeFromFavorites(userId: string, restaurantId: string): Promise<void> {
    try {
      console.log('💔 Removing restaurant from favorites:', restaurantId);

      // Try Firestore first, fallback to localStorage
      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', userId),
          where('restaurantId', '==', restaurantId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);
          await updateDoc(doc(db, 'users', userId), {
            favoriteRestaurants: increment(-1)
          });
          console.log('✅ Restaurant removed from Firestore favorites');
        }
      } catch (firestoreError) {
        console.log('⚠️ Firestore failed, using localStorage fallback');
      }

      // Always update localStorage as well
      const localFavorites = localStorage.getItem(`favorites_${userId}`);
      if (localFavorites) {
        const favorites = JSON.parse(localFavorites);
        const updatedFavorites = favorites.filter((id: string) => id !== restaurantId);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));

        // Remove from favorite data as well
        const favoriteData = localStorage.getItem(`favoriteData_${userId}`);
        if (favoriteData) {
          const favData = JSON.parse(favoriteData);
          delete favData[restaurantId];
          localStorage.setItem(`favoriteData_${userId}`, JSON.stringify(favData));
        }
      }

      console.log('✅ Restaurant removed from favorites successfully');
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  }

  // Check if restaurant is in favorites
  static async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    try {
      // Always check localStorage first for immediate response
      const localFavorites = localStorage.getItem(`favorites_${userId}`);
      if (localFavorites) {
        const favorites = JSON.parse(localFavorites);
        const isLocalFavorite = favorites.includes(restaurantId);
        console.log('📱 localStorage check:', isLocalFavorite);
        return isLocalFavorite;
      }

      // Try Firestore as backup (but don't fail if it doesn't work)
      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', userId),
          where('restaurantId', '==', restaurantId)
        );

        const querySnapshot = await getDocs(q);
        const isFirestoreFavorite = !querySnapshot.empty;
        console.log('🔥 Firestore check:', isFirestoreFavorite);
        return isFirestoreFavorite;
      } catch (firestoreError) {
        console.log('⚠️ Firestore check failed, using localStorage only');
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking favorite status:', error);
      return false;
    }
  }

  // Get user's favorite restaurants
  static async getUserFavorites(userId: string): Promise<FavoriteRestaurant[]> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const favorites: FavoriteRestaurant[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        favorites.push({
          id: doc.id,
          userId: data.userId,
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName,
          restaurantCuisine: data.restaurantCuisine,
          restaurantRating: data.restaurantRating,
          restaurantAddress: data.restaurantAddress,
          addedAt: data.addedAt?.toDate() || new Date()
        });
      });
      
      return favorites;
    } catch (error) {
      console.error('❌ Error getting user favorites:', error);
      throw error;
    }
  }

  // Real-time subscription to user's favorites
  static subscribeToUserFavorites(
    userId: string,
    callback: (favorites: FavoriteRestaurant[]) => void
  ): () => void {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const favorites: FavoriteRestaurant[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        favorites.push({
          id: doc.id,
          userId: data.userId,
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName,
          restaurantCuisine: data.restaurantCuisine,
          restaurantRating: data.restaurantRating,
          restaurantAddress: data.restaurantAddress,
          addedAt: data.addedAt?.toDate() || new Date()
        });
      });
      
      callback(favorites);
    }, (error) => {
      console.error('❌ Error in favorites subscription:', error);
      callback([]);
    });
  }

  // Toggle favorite status
  static async toggleFavorite(userId: string, restaurantData: {
    restaurantId: string;
    restaurantName: string;
    restaurantCuisine: string;
    restaurantRating: number;
    restaurantAddress: string;
  }): Promise<boolean> {
    try {
      console.log('🔄 FavoritesService.toggleFavorite called with:', { userId, restaurantData });

      // Check current status from localStorage (most reliable)
      const localFavorites = localStorage.getItem(`favorites_${userId}`);
      const favorites = localFavorites ? JSON.parse(localFavorites) : [];
      const isFav = favorites.includes(restaurantData.restaurantId);

      console.log('📊 Current favorite status (localStorage):', isFav);

      if (isFav) {
        console.log('🗑️ Removing from favorites...');
        await this.removeFromFavorites(userId, restaurantData.restaurantId);
        return false;
      } else {
        console.log('➕ Adding to favorites...');
        await this.addToFavorites(userId, restaurantData);
        return true;
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);

      // Even if there's an error, try to toggle localStorage
      try {
        const localFavorites = localStorage.getItem(`favorites_${userId}`);
        const favorites = localFavorites ? JSON.parse(localFavorites) : [];
        const isFav = favorites.includes(restaurantData.restaurantId);

        if (isFav) {
          const updatedFavorites = favorites.filter((id: string) => id !== restaurantData.restaurantId);
          localStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
          return false;
        } else {
          favorites.push(restaurantData.restaurantId);
          localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));

          // Store restaurant data
          const favoriteData = localStorage.getItem(`favoriteData_${userId}`);
          const favData = favoriteData ? JSON.parse(favoriteData) : {};
          favData[restaurantData.restaurantId] = restaurantData;
          localStorage.setItem(`favoriteData_${userId}`, JSON.stringify(favData));
          return true;
        }
      } catch (localError) {
        console.error('❌ Even localStorage failed:', localError);
        throw error;
      }
    }
  }
}
