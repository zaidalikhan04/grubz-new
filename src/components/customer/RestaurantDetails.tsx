import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { collection, doc, getDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { OrderService, CreateOrderData, OrderItem, DeliveryAddress } from '../../services/order';
import { FavoritesService } from '../../services/favorites';
import { addSampleMenuItems } from '../../utils/addSampleMenuItems';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  Minus,
  ShoppingBag,
  Loader2,
  Heart,
  Share2,
  Info,
  X,
  CreditCard,
  Wallet,
  Banknote,
  Home
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  rating: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: Date;
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

export const RestaurantDetails: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Checkout state
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

  // Load restaurant data
  useEffect(() => {
    if (!restaurantId) {
      navigate('/dashboard');
      return;
    }

    const loadRestaurant = async () => {
      try {
        console.log(`🏪 Loading restaurant details for: ${restaurantId}`);
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));

        if (!restaurantDoc.exists()) {
          console.error('❌ Restaurant not found');
          setRestaurantLoading(false);
          navigate('/dashboard');
          return;
        }

        const data = restaurantDoc.data();
        const restaurantData: Restaurant = {
          id: restaurantDoc.id,
          name: data.name || data.restaurantName || '',
          description: data.description || '',
          cuisine: data.cuisine || '',
          address: data.location || data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          logoUrl: data.logoUrl || '',
          rating: data.rating || 4.5,
          totalOrders: data.totalOrders || 0,
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate() || new Date(),
          ownerId: data.ownerId || restaurantDoc.id
        };

        setRestaurant(restaurantData);
        setRestaurantLoading(false);
        console.log('✅ Restaurant loaded:', restaurantData.name);
      } catch (error) {
        console.error('❌ Error loading restaurant:', error);
        setRestaurantLoading(false);
        navigate('/dashboard');
      }
    };

    loadRestaurant();
  }, [restaurantId, navigate]);

  // Check if restaurant is in favorites
  useEffect(() => {
    if (!currentUser || !restaurantId) return;

    const checkFavoriteStatus = async () => {
      try {
        const isInFavorites = await FavoritesService.isFavorite(currentUser.id, restaurantId);
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error('❌ Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, restaurantId]);

  // Load menu items with real-time updates
  useEffect(() => {
    if (!restaurantId) return;

    console.log(`🍽️ Setting up real-time menu listener for: ${restaurantId}`);

    // Try without orderBy first to avoid index issues
    const menuQuery = query(
      collection(db, 'restaurants', restaurantId, 'menu')
    );

    const unsubscribe = onSnapshot(
      menuQuery,
      (querySnapshot) => {
        console.log(`📄 Menu items loaded: ${querySnapshot.size} items`);

        const items: MenuItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`📄 Menu item document:`, doc.id, data);

          const isAvailable = data.available !== false && data.isAvailable !== false;

          // Only show available items to customers
          if (isAvailable) {
            items.push({
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
              restaurantId: restaurantId
            });
          }
        });

        // Sort items manually
        items.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });

        setMenuItems(items);
        setLoading(false);
        console.log('✅ Menu items updated:', items.length);
        console.log('✅ Menu items:', items);
      },
      (error) => {
        console.error('❌ Error loading menu:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up menu listener');
      unsubscribe();
    };
  }, [restaurantId]);

  // Cart functions
  const addToCart = (item: MenuItem) => {
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

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    console.log('🔄 Favorite button clicked');
    console.log('👤 Current user:', currentUser);
    console.log('🏪 Restaurant:', restaurant);

    if (!currentUser) {
      console.error('❌ No current user found');
      alert('Please log in to add favorites');
      return;
    }

    if (!restaurant) {
      console.error('❌ No restaurant data found');
      return;
    }

    setFavoriteLoading(true);

    // For now, let's just toggle the local state to test the UI
    try {
      // Test if we can at least check the current status
      console.log('🔄 Testing favorite status check...');
      const currentStatus = await FavoritesService.isFavorite(currentUser.id, restaurant.id);
      console.log('📊 Current favorite status from DB:', currentStatus);

      // Try the full toggle
      console.log('🔄 Calling FavoritesService.toggleFavorite...');
      const newFavoriteStatus = await FavoritesService.toggleFavorite(currentUser.id, {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantCuisine: restaurant.cuisine,
        restaurantRating: restaurant.rating,
        restaurantAddress: restaurant.address
      });

      setIsFavorite(newFavoriteStatus);
      console.log(newFavoriteStatus ? '❤️ Added to favorites' : '💔 Removed from favorites');
      alert(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!');
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      console.error('❌ Error stack:', error.stack);

      // For testing, just toggle the local state
      const newState = !isFavorite;
      setIsFavorite(newState);
      alert(`Testing mode: ${newState ? 'Added to' : 'Removed from'} favorites! (Error: ${error.message})`);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!restaurant) return;

    const shareData = {
      title: `${restaurant.name} - Grubz`,
      text: `Check out ${restaurant.name} on Grubz! ${restaurant.description}`,
      url: window.location.href
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('✅ Shared successfully');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Restaurant link copied to clipboard!');
        console.log('✅ Link copied to clipboard');
      }
    } catch (error) {
      console.error('❌ Error sharing:', error);
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Restaurant link copied to clipboard!');
      } catch (clipboardError) {
        console.error('❌ Error copying to clipboard:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  const getCartTotal = () => {
    let total = 0;
    let count = 0;
    menuItems.forEach(item => {
      const quantity = cartItems[item.id] || 0;
      total += item.price * quantity;
      count += quantity;
    });
    return { total, count };
  };

  const { total: cartTotal, count: cartCount } = getCartTotal();

  // Checkout functions
  const getCartItemsWithDetails = (): OrderItem[] => {
    const items: OrderItem[] = [];
    menuItems.forEach(item => {
      const quantity = cartItems[item.id] || 0;
      if (quantity > 0) {
        items.push({
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
    return items;
  };

  const calculateOrderTotals = () => {
    const subtotal = cartTotal;
    const deliveryFee = subtotal > 25 ? 0 : 2.99; // Free delivery over $25
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;
    return { subtotal, deliveryFee, tax, total };
  };

  const clearCart = () => {
    setCartItems({});
  };

  const placeOrder = async () => {
    if (!currentUser || !restaurant) {
      alert('Please log in to place an order');
      return;
    }

    const cartItemsWithDetails = getCartItemsWithDetails();
    if (cartItemsWithDetails.length === 0) {
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
        customerName: currentUser.name ?? 'Customer',
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

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items by category (show all items for debugging)
  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  console.log('🔍 Filtered menu items:', filteredMenuItems.length, 'for category:', selectedCategory);

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#dd3333]" />
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Restaurant not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Restaurants</span>
              </Button>
            </div>
            
            {cartCount > 0 && (
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                <span className="font-medium">{cartCount} items</span>
                <span className="font-bold text-[#dd3333]">${cartTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-6 flex-1">
                {/* Restaurant Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
                  {restaurant.logoUrl ? (
                    <img
                      src={restaurant.logoUrl}
                      alt={restaurant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    restaurant.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                    <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                      {restaurant.isActive ? "Open" : "Closed"}
                    </Badge>
                  </div>
                
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{restaurant.rating} rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{restaurant.phone}</span>
                  </div>
                  {restaurant.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🔴 Button clicked!');
                    handleFavoriteToggle();
                  }}
                  disabled={favoriteLoading}
                  className={isFavorite ? 'text-red-600 border-red-600 hover:bg-red-50' : ''}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {favoriteLoading ? 'Loading...' : (isFavorite ? 'Favorited' : 'Favorite')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-[#dd3333] hover:bg-[#c52e2e]" : ""}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#dd3333]" />
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map(item => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.imageUrl && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="font-bold text-[#dd3333]">${item.price.toFixed(2)}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.preparationTime} min</span>
                      </div>
                      <div className="flex space-x-1">
                        {item.isVegetarian && <Badge variant="outline" className="text-xs">Veg</Badge>}
                        {item.isVegan && <Badge variant="outline" className="text-xs">Vegan</Badge>}
                        {item.isGlutenFree && <Badge variant="outline" className="text-xs">GF</Badge>}
                      </div>
                    </div>

                    {cartItems[item.id] > 0 ? (
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium px-3">{cartItems[item.id]}</span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="bg-[#dd3333] hover:bg-[#c52e2e]"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full bg-[#dd3333] hover:bg-[#c52e2e] text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMenuItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No menu items available in this category.</p>
                {menuItems.length === 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-3">This restaurant doesn't have any menu items yet.</p>
                    <Button
                      onClick={addSampleMenuItems}
                      className="bg-[#dd3333] hover:bg-[#c52e2e] text-white"
                    >
                      Add Sample Menu Items
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
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

              <Button
                className="w-full bg-[#dd3333] hover:bg-[#c52e2e] text-white"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCheckout(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 mb-4">
                    {getCartItemsWithDetails().map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="flex-1">{item.quantity}x {item.name}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const { subtotal, deliveryFee, tax, total } = calculateOrderTotals();
                    return (
                      <div className="border-t pt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee:</span>
                          <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Delivery Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Street Address"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                  />
                  <Input
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    placeholder="State"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
                <Input
                  className="mt-4"
                  placeholder="Delivery Instructions (Optional)"
                  value={deliveryAddress.instructions}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span className="text-sm">Card</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'digital_wallet' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('digital_wallet')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Wallet className="h-6 w-6 mb-2" />
                    <span className="text-sm">Digital</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Banknote className="h-6 w-6 mb-2" />
                    <span className="text-sm">Cash</span>
                  </Button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Special Instructions</h3>
                <Input
                  placeholder="Any special requests for your order..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              {/* Place Order Button */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={placeOrder}
                  disabled={isPlacingOrder || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode}
                  className="flex-1 bg-[#dd3333] hover:bg-[#c52e2e] text-white"
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </div>
                  ) : (
                    `Place Order - $${calculateOrderTotals().total.toFixed(2)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
