import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Heart, 
  Star, 
  Clock, 
  MapPin,
  Search,
  Filter,
  ShoppingBag,
  Plus,
  X
} from 'lucide-react';

export const CustomerFavorites: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([
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
      totalOrders: 12,
      lastOrdered: '2 days ago',
      favoriteItems: ['Margherita Pizza', 'Caesar Salad', 'Tiramisu']
    },
    {
      id: 2,
      name: "Sushi Express",
      cuisine: 'Japanese',
      rating: 4.9,
      deliveryTime: '30-40 min',
      deliveryFee: 3.99,
      distance: '2.1 km',
      image: '🍣',
      popular: true,
      promo: 'Free Delivery',
      totalOrders: 8,
      lastOrdered: '1 week ago',
      favoriteItems: ['Salmon Roll', 'Tuna Sashimi', 'Miso Soup']
    },
    {
      id: 3,
      name: "Burger Palace",
      cuisine: 'American',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      distance: '0.8 km',
      image: '🍔',
      popular: false,
      promo: null,
      totalOrders: 6,
      lastOrdered: '3 days ago',
      favoriteItems: ['Classic Burger', 'Chicken Wings', 'Milkshake']
    },
    {
      id: 4,
      name: "Healthy Bites",
      cuisine: 'Healthy',
      rating: 4.7,
      deliveryTime: '15-25 min',
      deliveryFee: 2.49,
      distance: '0.5 km',
      image: '🥗',
      popular: false,
      promo: '15% OFF',
      totalOrders: 4,
      lastOrdered: '5 days ago',
      favoriteItems: ['Quinoa Bowl', 'Green Smoothie', 'Avocado Toast']
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Favorites', count: favorites.length },
    { id: 'italian', name: 'Italian', count: favorites.filter(f => f.cuisine === 'Italian').length },
    { id: 'japanese', name: 'Japanese', count: favorites.filter(f => f.cuisine === 'Japanese').length },
    { id: 'american', name: 'American', count: favorites.filter(f => f.cuisine === 'American').length },
    { id: 'healthy', name: 'Healthy', count: favorites.filter(f => f.cuisine === 'Healthy').length }
  ];

  const removeFavorite = (restaurantId: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
  };

  const filteredFavorites = favorites.filter(restaurant => {
    const matchesCategory = selectedCategory === 'all' || 
                           restaurant.cuisine.toLowerCase() === selectedCategory;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your favorite restaurants and go-to meals</p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#dd3333]" />
          <span className="text-sm text-gray-600">{favorites.length} favorites</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap ${
                selectedCategory === category.id ? 'bg-[#dd3333] hover:bg-[#c52e2e]' : ''
              }`}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFavorites.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-3xl">
                    {restaurant.image}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      {restaurant.popular && (
                        <Badge className="bg-[#dd3333] text-white text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{restaurant.cuisine} cuisine</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {restaurant.promo && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {restaurant.promo}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(restaurant.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-[#dd3333]">{restaurant.totalOrders}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">${restaurant.deliveryFee}</p>
                  <p className="text-xs text-gray-500">Delivery</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{restaurant.distance}</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
              </div>

              {/* Favorite Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Usual Orders</h4>
                <div className="space-y-1">
                  {restaurant.favoriteItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">• {item}</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Ordered */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Last ordered: {restaurant.lastOrdered}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{restaurant.distance}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Order Now
                </Button>
                <Button variant="outline" className="flex-1">
                  View Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFavorites.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No favorites found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {favorites.length === 0 
                ? 'Start ordering from restaurants to add them to your favorites!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            <Button className="bg-[#dd3333] hover:bg-[#c52e2e]">
              Discover Restaurants
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#dd3333]" />
              Your Favorites Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#dd3333]">{favorites.length}</p>
                <p className="text-sm text-gray-600">Favorite Restaurants</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {favorites.reduce((sum, fav) => sum + fav.totalOrders, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(favorites.reduce((sum, fav) => sum + fav.rating, 0) / favorites.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...favorites.map(fav => fav.totalOrders))}
                </p>
                <p className="text-sm text-gray-600">Most Ordered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
