import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Star,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag,
  Plus,
  Minus,
  ChefHat,
  ArrowRight,
  Heart
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FavoritesService } from '../../services/favorites';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cuisine: string;
  category?: string;
  description: string;
  rating: number;
  isActive: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  createdAt: Date;
  updatedAt: Date;
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

interface RestaurantGridProps {
  restaurants: Restaurant[];
  onAddToCart: (item: MenuItem, restaurantId: string) => void;
  cartItems: {[key: string]: number};
}

export const RestaurantGrid: React.FC<RestaurantGridProps> = ({
  restaurants,
  onAddToCart,
  cartItems
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favoriteStates, setFavoriteStates] = useState<{[key: string]: boolean}>({});

  // Load favorite states for all restaurants
  useEffect(() => {
    if (!currentUser) return;

    const loadFavoriteStates = async () => {
      const states: {[key: string]: boolean} = {};
      for (const restaurant of restaurants) {
        const isFav = await FavoritesService.isFavorite(currentUser.id, restaurant.id);
        states[restaurant.id] = isFav;
      }
      setFavoriteStates(states);
    };

    loadFavoriteStates();
  }, [currentUser, restaurants]);

  const toggleFavorite = async (e: React.MouseEvent, restaurant: Restaurant) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!currentUser) return;

    try {
      const newState = await FavoritesService.toggleFavorite(currentUser.id, {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantCuisine: restaurant.cuisine,
        restaurantRating: restaurant.rating,
        restaurantAddress: restaurant.address
      });

      setFavoriteStates(prev => ({
        ...prev,
        [restaurant.id]: newState
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(restaurants || []).map((restaurant) => (
        <Card
          key={restaurant.id}
          className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-2xl cursor-pointer group"
          onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        >
          {/* Restaurant Image */}
          <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
            {restaurant.bannerUrl || restaurant.logoUrl ? (
              <img
                src={restaurant.bannerUrl || restaurant.logoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <ChefHat className="h-16 w-16 text-white opacity-80" />
              </div>
            )}

            {/* Discount Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-bold">
                50% OFF
              </Badge>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 text-white px-2 py-1 text-sm font-bold flex items-center gap-1">
                <Star className="h-3 w-3 fill-white" />
                {restaurant.rating.toFixed(1)}
              </Badge>
            </div>

            {/* Favorite Heart Button */}
            <div className="absolute bottom-3 right-3">
              <Button
                size="sm"
                variant="ghost"
                className={`w-10 h-10 rounded-full ${
                  favoriteStates[restaurant.id]
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/80 hover:bg-white text-gray-600'
                } shadow-lg`}
                onClick={(e) => toggleFavorite(e, restaurant)}
              >
                <Heart className={`h-5 w-5 ${favoriteStates[restaurant.id] ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Restaurant Info */}
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 truncate">{restaurant.name}</h3>
              <p className="text-gray-600 text-sm">{restaurant.cuisine}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.estimatedDeliveryTime}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-semibold">₹{restaurant.minimumOrder || 400} for one</p>
                  <p className="text-gray-500 text-xs">{restaurant.estimatedDeliveryTime.split('-')[0]} min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
