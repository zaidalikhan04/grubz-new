import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Star, 
  Clock, 
  MapPin,
  TrendingUp,
  Heart,
  ShoppingBag,
  ChefHat,
  Zap
} from 'lucide-react';

interface CustomerHomeProps {
  onPageChange: (page: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  const quickStats = [
    { label: 'Restaurants', value: '150+', icon: ChefHat, color: 'text-blue-600' },
    { label: 'Your Orders', value: '12', icon: ShoppingBag, color: 'text-green-600' },
    { label: 'Favorites', value: '8', icon: Heart, color: 'text-red-600' },
    { label: 'Fast Delivery', value: '25min', icon: Zap, color: 'text-yellow-600' }
  ];

  const featuredRestaurants = [
    {
      id: 1,
      name: "Mario's Italian Kitchen",
      cuisine: 'Italian',
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 2.99,
      distance: '1.2 km',
      image: '🍕',
      popular: true,
      promo: '20% OFF'
    },
    {
      id: 2,
      name: "Burger Palace",
      cuisine: 'American',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      distance: '0.8 km',
      image: '🍔',
      popular: false,
      promo: null
    },
    {
      id: 3,
      name: "Sushi Express",
      cuisine: 'Japanese',
      rating: 4.9,
      deliveryTime: '30-40 min',
      deliveryFee: 3.99,
      distance: '2.1 km',
      image: '🍣',
      popular: true,
      promo: 'Free Delivery'
    },
    {
      id: 4,
      name: "Taco Fiesta",
      cuisine: 'Mexican',
      rating: 4.7,
      deliveryTime: '15-25 min',
      deliveryFee: 2.49,
      distance: '0.5 km',
      image: '🌮',
      popular: false,
      promo: null
    }
  ];

  const categories = [
    { id: 'all', name: 'All Food', icon: '🍽️', count: 45 },
    { id: 'pizza', name: 'Pizza', icon: '🍕', count: 12 },
    { id: 'burgers', name: 'Burgers', icon: '🍔', count: 8 },
    { id: 'asian', name: 'Asian', icon: '🍜', count: 15 },
    { id: 'desserts', name: 'Desserts', icon: '🍰', count: 6 },
    { id: 'healthy', name: 'Healthy', icon: '🥗', count: 9 }
  ];

  const restaurantsWithMenus = [
    {
      id: 1,
      name: "Mario's Italian Kitchen",
      cuisine: 'Italian',
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 2.99,
      distance: '1.2 km',
      image: '🍕',
      popular: true,
      promo: '20% OFF',
      items: [
        { id: 1, name: 'Margherita Pizza', price: 12.99, description: 'Fresh tomatoes, mozzarella, basil', category: 'pizza' },
        { id: 2, name: 'Pepperoni Pizza', price: 14.99, description: 'Pepperoni, mozzarella, tomato sauce', category: 'pizza' },
        { id: 3, name: 'Caesar Salad', price: 8.99, description: 'Romaine lettuce, parmesan, croutons', category: 'healthy' }
      ]
    },
    {
      id: 2,
      name: "Burger Palace",
      cuisine: 'American',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      distance: '0.8 km',
      image: '🍔',
      popular: false,
      promo: null,
      items: [
        { id: 4, name: 'Classic Burger', price: 9.99, description: 'Beef patty, lettuce, tomato, onion', category: 'burgers' },
        { id: 5, name: 'Cheese Burger', price: 11.99, description: 'Beef patty, cheese, lettuce, tomato', category: 'burgers' },
        { id: 6, name: 'Chicken Wings', price: 7.99, description: 'Crispy wings with buffalo sauce', category: 'burgers' }
      ]
    },
    {
      id: 3,
      name: "Sushi Express",
      cuisine: 'Japanese',
      rating: 4.9,
      deliveryTime: '30-40 min',
      deliveryFee: 3.99,
      distance: '2.1 km',
      image: '🍣',
      popular: true,
      promo: 'Free Delivery',
      items: [
        { id: 7, name: 'Salmon Roll', price: 8.99, description: 'Fresh salmon, avocado, cucumber', category: 'asian' },
        { id: 8, name: 'Tuna Sashimi', price: 12.99, description: 'Fresh tuna slices', category: 'asian' },
        { id: 9, name: 'Miso Soup', price: 3.99, description: 'Traditional miso soup with tofu', category: 'asian' }
      ]
    }
  ];

  const addToCart = (itemId: number) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const getCartTotal = () => {
    let total = 0;
    let count = 0;
    restaurantsWithMenus.forEach(restaurant => {
      restaurant.items.forEach(item => {
        const quantity = cartItems[item.id] || 0;
        total += item.price * quantity;
        count += quantity;
      });
    });
    return { total, count };
  };

  const { total: cartTotal, count: cartCount } = getCartTotal();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#dd3333] to-[#c52e2e] rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Grubber! 🍽️</h1>
            <p className="text-red-100">Discover amazing food from your favorite restaurants</p>
          </div>
          {cartCount > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-sm font-medium">Cart</div>
              <div className="text-lg font-bold">{cartCount} items</div>
              <div className="text-sm">${cartTotal.toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search restaurants or dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onPageChange('orders')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#dd3333] rounded-lg flex items-center justify-center text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">My Orders</h3>
                <p className="text-gray-600">Track your current and past orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onPageChange('favorites')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">My Favorites</h3>
                <p className="text-gray-600">View your favorite restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Browse by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedCategory === category.id
                    ? 'border-[#dd3333] bg-red-50'
                    : 'hover:border-[#dd3333] hover:bg-red-50'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-medium text-sm text-center">{category.name}</h4>
                <p className="text-xs text-gray-500">{category.count} items</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restaurants & Food */}
      <div className="space-y-6">
        {restaurantsWithMenus.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-3xl">
                    {restaurant.image}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                      {restaurant.popular && (
                        <Badge className="bg-[#dd3333] text-white">Popular</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{restaurant.cuisine} cuisine</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance}</span>
                      </div>
                      <span>Delivery: ${restaurant.deliveryFee}</span>
                    </div>
                  </div>
                </div>
                {restaurant.promo && (
                  <Badge className="bg-green-100 text-green-800">
                    {restaurant.promo}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.items
                  .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                  .map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className="font-bold text-[#dd3333]">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      {cartItems[item.id] ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCartItems(prev => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                            }))}
                          >
                            -
                          </Button>
                          <span className="font-medium">{cartItems[item.id]}</span>
                          <Button
                            size="sm"
                            className="bg-[#dd3333] hover:bg-[#c52e2e]"
                            onClick={() => addToCart(item.id)}
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-1"
                          onClick={() => addToCart(item.id)}
                        >
                          <ShoppingBag className="h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
