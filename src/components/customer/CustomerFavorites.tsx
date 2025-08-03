import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { FavoritesService, FavoriteRestaurant } from '../../services/favorites';
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
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites on component mount
  useEffect(() => {
    if (!currentUser) return;

    const loadFavorites = async () => {
      try {
        setLoading(true);

        // Try to get from localStorage first (for immediate display)
        const localFavorites = localStorage.getItem(`favorites_${currentUser.id}`);
        const localFavoriteData = localStorage.getItem(`favoriteData_${currentUser.id}`);

        if (localFavorites && localFavoriteData) {
          const favoriteIds = JSON.parse(localFavorites);
          const favoriteData = JSON.parse(localFavoriteData);

          const favoritesArray = favoriteIds.map((id: string) => ({
            id: `local_${id}`,
            userId: currentUser.id,
            restaurantId: id,
            restaurantName: favoriteData[id]?.restaurantName || 'Unknown Restaurant',
            restaurantCuisine: favoriteData[id]?.restaurantCuisine || 'Unknown',
            restaurantRating: favoriteData[id]?.restaurantRating || 0,
            restaurantAddress: favoriteData[id]?.restaurantAddress || 'Unknown Address',
            addedAt: new Date()
          }));

          setFavorites(favoritesArray);
        }

        // Also try to load from Firestore
        const firestoreFavorites = await FavoritesService.getUserFavorites(currentUser.id);
        if (firestoreFavorites.length > 0) {
          setFavorites(firestoreFavorites);
        }
      } catch (error) {
        console.error('❌ Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [currentUser]);

  const categories = [
    { id: 'all', name: 'All Favorites', count: (favorites || []).length },
    { id: 'italian', name: 'Italian', count: (favorites || []).filter(f => f.restaurantCuisine === 'Italian').length },
    { id: 'japanese', name: 'Japanese', count: (favorites || []).filter(f => f.restaurantCuisine === 'Japanese').length },
    { id: 'american', name: 'American', count: (favorites || []).filter(f => f.restaurantCuisine === 'American').length },
    { id: 'healthy', name: 'Healthy', count: (favorites || []).filter(f => f.restaurantCuisine === 'Healthy').length }
  ];

  const removeFavorite = async (restaurantId: string) => {
    if (!currentUser) return;

    try {
      await FavoritesService.removeFromFavorites(currentUser.id, restaurantId);
      setFavorites(prev => prev.filter(fav => fav.restaurantId !== restaurantId));
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
    }
  };

  const addTestFavorite = async () => {
    if (!currentUser) return;

    try {
      await FavoritesService.addToFavorites(currentUser.id, {
        restaurantId: 'test-burger-heaven',
        restaurantName: 'Burger Heaven',
        restaurantCuisine: 'American',
        restaurantRating: 4.5,
        restaurantAddress: 'North Indian, Mughlai'
      });

      // Reload favorites
      const updatedFavorites = await FavoritesService.getUserFavorites(currentUser.id);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('❌ Error adding test favorite:', error);
    }
  };

  const filteredFavorites = (favorites || []).filter(restaurant => {
    const matchesCategory = selectedCategory === 'all' ||
                           (restaurant.restaurantCuisine || '').toLowerCase() === selectedCategory;
    const matchesSearch = (restaurant.restaurantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (restaurant.restaurantCuisine || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600">Loading your favorite restaurants...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your favorite restaurants and go-to meals</p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#dd3333]" />
          <span className="text-sm text-gray-600">{(favorites || []).length} favorites</span>
          <Button
            onClick={addTestFavorite}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white ml-2"
          >
            Add Test Favorite
          </Button>
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

      {/* Favorites List */}
      <div className="space-y-4">
        {filteredFavorites.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Restaurant Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {restaurant.restaurantName?.charAt(0) || '?'}
                </div>

                {/* Restaurant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{restaurant.restaurantName || 'Unknown Restaurant'}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(restaurant.restaurantId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{restaurant.restaurantCuisine || 'Unknown'} cuisine</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{restaurant.restaurantRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>30-45 min</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <p className="text-lg font-bold text-[#dd3333]">0</p>
                      <p className="text-xs text-gray-500">Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">$2.99</p>
                      <p className="text-xs text-gray-500">Delivery</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">1.2 mi</p>
                      <p className="text-xs text-gray-500">Distance</p>
                    </div>
                  </div>

                  {/* Your Usual Orders */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Your Usual Orders</h4>
                    <div className="text-sm text-gray-600">
                      • No previous orders
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Last ordered: Never</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2"
                      onClick={() => window.location.href = `/restaurant/${restaurant.restaurantId}`}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Order Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/restaurant/${restaurant.restaurantId}`}
                    >
                      View Menu
                    </Button>
                  </div>
                </div>
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
              {(favorites || []).length === 0 ? 'No favorites yet' : 'No favorites found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {(favorites || []).length === 0
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

      {/* Your Favorites Summary */}
      {(favorites || []).length > 0 && (
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
                <p className="text-2xl font-bold text-[#dd3333]">0</p>
                <p className="text-sm text-gray-600">Favorite Restaurants</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.5</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Most Ordered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
