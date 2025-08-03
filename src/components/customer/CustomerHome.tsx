import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, where, orderBy, getDocs, setDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { OrderService, CreateOrderData, OrderItem, DeliveryAddress } from '../../services/order';
import { MenuItem as ServiceMenuItem } from '../../services/restaurant';
import { RestaurantGrid } from './RestaurantGrid';
import {
  Search,
  Star,
  Clock,
  MapPin,
  TrendingUp,
  Heart,
  ShoppingBag,
  ChefHat,
  Zap,
  Plus,
  Minus,
  Loader2,
  X,
  Home,
  CreditCard,
  Wallet,
  Banknote,
  FileText,
  Package,
  AlertTriangle
} from 'lucide-react';

interface CustomerHomeProps {
  onPageChange: (page: string) => void;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  category?: string; // Add category field
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating: number;
  totalOrders: number;
  isActive: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  calories?: number;
  restaurantId: string;
}



export const CustomerHome: React.FC<CustomerHomeProps> = ({ onPageChange }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    instructions: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital_wallet'>('card');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);

  // Dynamic categories based on actual restaurant data
  const getCategories = () => {
    const categoryMap = new Map();

    // Always include "All Food" category first
    categoryMap.set('all', { id: 'all', name: 'All Food', icon: '🍽️', count: restaurants.length });

    // Initialize all possible categories with 0 count
    const allPossibleCategories = ['appetizers', 'main-courses', 'desserts', 'beverages', 'sides'];
    allPossibleCategories.forEach(categoryId => {
      const categoryInfo = getCategoryInfo(categoryId);
      categoryMap.set(categoryId, {
        ...categoryInfo,
        count: 0
      });
    });

    // Count restaurants by category
    restaurants.forEach(restaurant => {
      const category = restaurant.category || 'all-food';

      if (category !== 'all-food' && allPossibleCategories.includes(category)) {
        const existing = categoryMap.get(category);
        if (existing) {
          categoryMap.set(category, {
            ...existing,
            count: existing.count + 1
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  };

  const getCategoryInfo = (categoryId: string) => {
    const categoryMapping: Record<string, { id: string; name: string; icon: string }> = {
      'all-food': { id: 'all-food', name: 'All Food', icon: '🍽️' },
      'appetizers': { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
      'main-courses': { id: 'main-courses', name: 'Main Courses', icon: '🍽️' },
      'desserts': { id: 'desserts', name: 'Desserts', icon: '🍰' },
      'beverages': { id: 'beverages', name: 'Beverages', icon: '🥤' },
      'sides': { id: 'sides', name: 'Sides', icon: '🍟' }
    };

    return categoryMapping[categoryId] || { id: categoryId, name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1), icon: '🍽️' };
  };

  const categories = getCategories();

  // Debug categories
  console.log('📊 Generated categories:', categories);

  // Debug function to check all restaurants
  const debugRestaurants = async () => {
    try {
      console.log('🔍 Debug: Checking all restaurants in database...');

      // Check all restaurants
      const allRestaurantsQuery = query(collection(db, 'restaurants'));
      const snapshot = await getDocs(allRestaurantsQuery);

      console.log('🔍 Total restaurants in database:', snapshot.size);
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('🔍 Restaurant:', doc.id, {
          name: data.restaurantName || data.name,
          status: data.status,
          isActive: data.isActive,
          data: data
        });
      });

      // Check approved restaurants specifically
      const approvedQuery = query(collection(db, 'restaurants'), where('status', '==', 'approved'));
      const approvedSnapshot = await getDocs(approvedQuery);
      console.log('🔍 Approved restaurants:', approvedSnapshot.size);

      // Check current state
      console.log('🔍 Current state:');
      console.log('- restaurants:', restaurants.length);
      console.log('- restaurantsWithMenus:', restaurantsWithMenus.length);
      console.log('- menuItems:', menuItems.length);
      console.log('- loading:', loading);

    } catch (error) {
      console.error('🔍 Debug error:', error);
    }
  };

  // Cleanup function to remove test restaurant
  const removeTestRestaurant = async () => {
    try {
      console.log('🧹 Removing test restaurant...');
      const testRestaurantId = 'test-restaurant-123';

      // Delete all menu items first
      const menuQuery = query(collection(db, 'restaurants', testRestaurantId, 'menu'));
      const menuSnapshot = await getDocs(menuQuery);

      const deletePromises = menuSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the restaurant document
      await deleteDoc(doc(db, 'restaurants', testRestaurantId));

      console.log('✅ Test restaurant removed successfully');
    } catch (error) {
      console.error('❌ Error removing test restaurant:', error);
    }
  };

  // Real-time data fetching
  useEffect(() => {
    console.log('🔄 Setting up real-time listeners for customer dashboard');
    setLoading(true);
    setError(null); // Clear any previous errors

    // Run debug function
    debugRestaurants();

    let loadedCount = 0;
    const totalListeners = 1; // Only restaurants listener now

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalListeners) {
        setLoading(false);
      }
    };

    // Listen to all active restaurants (removed status filter to debug)
    const restaurantsQuery = query(
      collection(db, 'restaurants')
    );

    const unsubscribeRestaurants = onSnapshot(
      restaurantsQuery,
      (querySnapshot) => {
        console.log('📄 Real-time restaurants update, total count:', querySnapshot.size);

        // Log document changes for debugging
        querySnapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          if (change.type === "added") {
            console.log(`➕ Restaurant added: ${data.name || data.restaurantName}`);
          }
          if (change.type === "modified") {
            console.log(`✏️ Restaurant modified: ${data.name || data.restaurantName}`);
          }
          if (change.type === "removed") {
            console.log(`➖ Restaurant removed: ${data.name || data.restaurantName}`);
          }
        });

        const restaurantsList: Restaurant[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🏪 Restaurant document:', doc.id, {
            name: data.name || data.restaurantName,
            status: data.status,
            isActive: data.isActive,
            ownerId: data.ownerId
          });

          // Include restaurants that are active or approved (more inclusive filtering)
          const isApproved = data.status === 'approved' || data.status === 'active' || !data.status;
          const isActiveRestaurant = data.isActive !== false;

          if (isActiveRestaurant && isApproved) {
            restaurantsList.push({
              id: doc.id,
              name: data.name || data.restaurantName || '',
              description: data.description || '',
              cuisine: data.cuisine || '',
              category: data.category || 'all-food', // Include category field with fallback
              address: data.location || data.address || '',
              phone: data.phone || '',
              email: data.email || '',
              website: data.website || '',
              logoUrl: data.logoUrl || '', // Include restaurant logo URL
              bannerUrl: data.bannerUrl || '', // Include banner URL if available
              rating: data.rating || 4.5,
              totalOrders: data.totalOrders || 0,
              isActive: data.isActive !== false,
              deliveryFee: data.deliveryFee || 0,
              minimumOrder: data.minimumOrder || 0,
              estimatedDeliveryTime: data.estimatedDeliveryTime || '30-45 min',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              ownerId: data.ownerId || doc.id // Use ownerId field or fallback to document ID
            });
          } else {
            console.log('⚠️ Skipping inactive restaurant:', doc.id);
          }
        });

        console.log('🏪 Real-time update: Active approved restaurants:', restaurantsList.length);
        console.log('📊 Restaurant categories:', restaurantsList.map(r => ({ name: r.name, category: r.category })));
        setRestaurants(restaurantsList);
        setError(null); // Clear any previous errors
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in real-time restaurants listener:', error);
        console.error('Error details:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        // Set error state and empty restaurants array
        setError(`Failed to load restaurants: ${error.message}`);
        setRestaurants([]);
        checkComplete();
      }
    );

    // We'll fetch menu items after restaurants are loaded
    // This is handled in the second useEffect
    checkComplete();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up customer dashboard listeners');
      unsubscribeRestaurants();
    };
  }, []);

  // Load all menu items when restaurants change
  useEffect(() => {
    if (restaurants.length === 0) {
      setAllMenuItems([]);
      return;
    }

    console.log('🍽️ Loading menu items for all restaurants');
    const menuItems: MenuItem[] = [];
    let loadedRestaurants = 0;

    const loadMenuForRestaurant = (restaurant: Restaurant) => {
      // Simplified query to avoid index issues - we'll sort on client side
      const menuQuery = query(
        collection(db, 'restaurants', restaurant.id, 'menu')
      );

      onSnapshot(menuQuery, (querySnapshot) => {
        // Remove existing items for this restaurant
        const filteredItems = menuItems.filter(item => item.restaurantId !== restaurant.id);

        // Add new items for this restaurant
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const isAvailable = data.available !== false && data.isAvailable !== false;

          if (isAvailable) {
            filteredItems.push({
              id: doc.id,
              name: data.name || '',
              description: data.description || '',
              price: data.price || 0,
              category: data.category || 'main',
              imageUrl: data.imageUrl || data.image || '',
              isAvailable,
              preparationTime: data.preparationTime || 15,
              ingredients: data.ingredients || [],
              allergens: data.allergens || [],
              isVegetarian: data.isVegetarian || false,
              isVegan: data.isVegan || false,
              isGlutenFree: data.isGlutenFree || false,
              calories: data.calories || 0,
              restaurantId: restaurant.id
            });
          }
        });

        // Update the menuItems array and state
        menuItems.length = 0;
        menuItems.push(...filteredItems);
        setAllMenuItems([...menuItems]);

        loadedRestaurants++;
        console.log(`📄 Menu loaded for ${restaurant.name}: ${querySnapshot.size} items (${loadedRestaurants}/${restaurants.length} restaurants loaded)`);
      });
    };

    // Load menu for each restaurant
    restaurants.forEach(loadMenuForRestaurant);
  }, [restaurants]);

  // Dynamic stats based on real data
  const quickStats = [
    { label: 'Restaurants', value: (restaurants || []).length.toString(), icon: ChefHat, color: 'text-blue-600' },
    { label: 'Active Now', value: (restaurants || []).filter(r => r.isActive).length.toString(), icon: ShoppingBag, color: 'text-green-600' },
    { label: 'Cuisines', value: new Set((restaurants || []).map(r => r.cuisine || 'Unknown')).size.toString(), icon: Heart, color: 'text-red-600' },
    { label: 'Avg Rating', value: (restaurants || []).length > 0 ? `${((restaurants || []).reduce((sum, r) => sum + (r.rating || 0), 0) / (restaurants || []).length).toFixed(1)}⭐` : '0⭐', icon: Zap, color: 'text-yellow-600' }
  ];

  const addToCart = (item: MenuItem, restaurantId: string) => {
    setCartItems(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    let total = 0;
    let count = 0;
    allMenuItems.forEach(item => {
      const quantity = cartItems[item.id] || 0;
      total += item.price * quantity;
      count += quantity;
    });
    return { total, count };
  };

  const { total: cartTotal, count: cartCount } = getCartTotal();

  // Get cart items with details
  const getCartItemsWithDetails = (): OrderItem[] => {
    const cartItemsWithDetails: OrderItem[] = [];
    allMenuItems.forEach(item => {
      const quantity = cartItems[item.id] || 0;
      if (quantity > 0) {
        cartItemsWithDetails.push({
          id: item.id ?? '',
          name: item.name ?? '',
          description: item.description ?? '',
          price: item.price ?? 0,
          quantity,
          category: item.category ?? '',
          preparationTime: item.preparationTime ?? 15
        });
      }
    });
    return cartItemsWithDetails;
  };

  // Get restaurant for cart items
  const getCartRestaurant = () => {
    const cartItemsWithDetails = getCartItemsWithDetails();
    if (cartItemsWithDetails.length === 0) return null;

    // Find restaurant that has items in cart
    const cartItem = cartItemsWithDetails[0]; // Get first cart item
    const menuItem = allMenuItems.find(item => item.id === cartItem.id);
    if (menuItem) {
      return restaurants.find(restaurant => restaurant.id === menuItem.restaurantId);
    }
    return null;
  };

  // Calculate order totals
  const calculateOrderTotals = () => {
    const subtotal = cartTotal;
    const deliveryFee = subtotal > 25 ? 0 : 2.99; // Free delivery over $25
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    return { subtotal, deliveryFee, tax, total };
  };

  // Clear cart
  const clearCart = () => {
    setCartItems({});
  };

  // Place order
  const placeOrder = async () => {
    if (!currentUser) {
      alert('Please log in to place an order');
      return;
    }

    const cartItemsWithDetails = getCartItemsWithDetails();
    const restaurant = getCartRestaurant();

    if (cartItemsWithDetails.length === 0 || !restaurant) {
      alert('Your cart is empty');
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      alert('Please fill in your delivery address');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const { subtotal, deliveryFee, tax, total } = calculateOrderTotals();

      const orderData: CreateOrderData = {
        customerId: currentUser.id ?? '',
        customerName: currentUser.name ?? currentUser.displayName ?? 'Customer',
        customerEmail: currentUser.email ?? '',
        customerPhone: currentUser.phone ?? '',
        deliveryAddress,
        restaurantId: restaurant.id ?? '',
        restaurantName: restaurant.name ?? '',
        restaurantPhone: restaurant.phone ?? '',
        restaurantAddress: restaurant.address ?? '',
        items: cartItemsWithDetails,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod,
        specialInstructions: specialInstructions ?? ''
      };

      const order = await OrderService.createOrder(orderData);

      console.log('✅ Order placed successfully:', order);
      alert(`Order placed successfully! Order number: ${order.orderNumber}`);

      // Clear cart and close checkout
      clearCart();
      setShowCheckout(false);
      setSpecialInstructions('');

    } catch (error) {
      console.error('❌ Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Filter restaurants based on search and category
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
                           restaurant.category === selectedCategory ||
                           (selectedCategory === 'all-food' && (!restaurant.category || restaurant.category === 'all-food'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section - Similar to landing page */}
      <div className="relative bg-gradient-to-br from-[#dd3333] via-[#c52e2e] to-[#b02a2a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Food That Moves 🍽️
              </h1>
              <p className="text-xl text-red-100 mb-6 max-w-2xl">
                Order from your favorite local restaurants and get it delivered quickly and safely to your doorstep
              </p>

              {/* Search Bar */}
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search restaurants, cuisines, or dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl border-0 shadow-lg text-lg"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#dd3333] hover:bg-[#c52e2e] px-6">
                  Search
                </Button>
              </div>
            </div>

            {/* Cart Summary */}
            {cartCount > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 shadow-xl">
                <div className="text-white/80 text-sm font-medium mb-2">Your Cart</div>
                <div className="text-2xl font-bold text-white mb-1">{cartCount} items</div>
                <div className="text-lg text-white/90">${cartTotal.toFixed(2)}</div>
                <Button className="mt-4 bg-white text-[#dd3333] hover:bg-gray-100 font-semibold">
                  View Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Browse by Category Section - Moved up after Hero */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">Find exactly what you're craving</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`group flex flex-col items-center p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-br from-[#dd3333] to-[#c52e2e] text-white shadow-xl scale-105'
                  : 'bg-gray-50 hover:bg-gradient-to-br hover:from-[#dd3333] hover:to-[#c52e2e] hover:text-white hover:shadow-lg hover:scale-105'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h4 className="font-semibold text-sm text-center mb-1">{category.name}</h4>
              <p className={`text-xs ${
                selectedCategory === category.id ? 'text-white/80' : 'text-gray-500 group-hover:text-white/80'
              }`}>
                {category.count || 0} restaurants
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurant List Section - Moved up after Categories */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#dd3333]" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading restaurants...</h3>
            <p className="text-gray-600">Finding the best food options for you</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Restaurants</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#dd3333] hover:bg-[#c52e2e]"
              >
                Retry
              </Button>
              <Button
                onClick={debugRestaurants}
                variant="outline"
              >
                Debug
              </Button>
            </div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No restaurants found' : 'No restaurants available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `Try searching for something else or clear your search`
                : 'Restaurant owners can add their menus to appear here!'
              }
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                className="bg-[#dd3333] hover:bg-[#c52e2e] mr-4"
              >
                Clear Search
              </Button>
            )}
            <div className="flex gap-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh
              </Button>
              <Button
                onClick={debugRestaurants}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Debug Database
              </Button>
              <Button
                onClick={removeTestRestaurant}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Test Restaurant
              </Button>
            </div>
          </div>
        ) : (
          <RestaurantGrid
            restaurants={filteredRestaurants}
            onAddToCart={addToCart}
            cartItems={cartItems}
          />
        )}
      </div>



      {/* Why Choose Us Section - Similar to landing page */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Choose <span className="text-[#dd3333]">Grubz?</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We're committed to providing the best food delivery experience with
          unmatched quality and service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-[#dd3333]" />
          </div>
          <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
          <p className="text-gray-600 text-sm">Get your food delivered in 30 minutes or less</p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">Safe & Secure</h3>
          <p className="text-gray-600 text-sm">Your payments and data are always protected</p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">Quality Food</h3>
          <p className="text-gray-600 text-sm">Only the best restaurants and highest quality meals</p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">Real-time Tracking</h3>
          <p className="text-gray-600 text-sm">Track your order from kitchen to your doorstep</p>
        </div>
      </div>

      {/* Floating Cart Summary */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="bg-white shadow-xl border-0 min-w-[300px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Your Order</h3>
                  <p className="text-sm text-gray-600">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">${cartTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {getCartItemsWithDetails().map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="flex-1">{item.quantity}x {item.name}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowCheckout(true)}
                  className="flex-1 bg-[#dd3333] hover:bg-[#c52e2e]"
                >
                  Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-md border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCheckout(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Enhanced Order Summary */}
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Order Summary</h3>
                  </div>

                  <div className="space-y-3">
                    {getCartItemsWithDetails().map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.quantity}x {item.name}</span>
                          <p className="text-sm text-gray-600 truncate">{item.description}</p>
                        </div>
                        <span className="font-bold text-gray-900 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 pt-3 mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal:</span>
                      <span>${calculateOrderTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee:</span>
                      <span className={calculateOrderTotals().deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                        {calculateOrderTotals().deliveryFee === 0 ? 'FREE' : `$${calculateOrderTotals().deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax:</span>
                      <span>${calculateOrderTotals().tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-gray-900 border-t border-gray-300 pt-2">
                      <span>Total:</span>
                      <span className="text-red-600 transition-all duration-300">${calculateOrderTotals().total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Delivery Address */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Delivery Address</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Street Address"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                        className="pl-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="City"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="pl-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="State"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="ZIP Code"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="relative mt-4">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Delivery Instructions (optional)"
                    value={deliveryAddress.instructions}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                    className="pl-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 pl-10">e.g., "Leave at door", "Ring doorbell", "Apartment 2B"</p>
              </div>

              {/* Enhanced Payment Method */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Payment Method</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
                    { value: 'cash', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when order arrives' },
                    { value: 'digital_wallet', label: 'Digital Wallet', icon: Wallet, description: 'Apple Pay, Google Pay' }
                  ].map(method => {
                    const IconComponent = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          paymentMethod === method.value
                            ? 'border-red-500 bg-red-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === method.value
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          paymentMethod === method.value
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            paymentMethod === method.value ? 'text-red-900' : 'text-gray-900'
                          }`}>
                            {method.label}
                          </p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        {paymentMethod === method.value && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Enhanced Special Instructions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Special Instructions</h3>
                </div>

                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    placeholder="Any special requests for your order..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg resize-none focus:border-yellow-500 focus:ring-yellow-500 text-sm"
                    rows={3}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 pl-10">e.g., "Extra spicy", "No onions", "Contactless delivery"</p>
              </div>

              {/* Enhanced Place Order Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={placeOrder}
                  disabled={isPlacingOrder || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingBag className="mr-3 h-5 w-5" />
                      <span>Place Order - ${calculateOrderTotals().total.toFixed(2)}</span>
                    </div>
                  )}
                </Button>

                {(!deliveryAddress.street || !deliveryAddress.city) && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    Please fill in your delivery address to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
