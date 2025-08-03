import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RestaurantLogoUpload } from '../ui/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService, Restaurant } from '../../services/restaurant';
import { ImageUploadService } from '../../services/imageUpload';
import { Store, MapPin, Phone, Mail, Globe, Clock, Star } from 'lucide-react';

export const RestaurantInfoSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchRestaurant = async () => {
      try {
        const restaurantData = await RestaurantService.getRestaurantByOwnerId(currentUser.id);
        setRestaurant(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [currentUser]);

  const handleLogoUpload = async (file: File): Promise<string> => {
    if (!restaurant) throw new Error('Restaurant not found');

    setIsUpdatingLogo(true);
    try {
      // Upload image to Firebase Storage
      const downloadURL = await ImageUploadService.uploadRestaurantLogo(
        restaurant.id,
        file
      );

      // Update restaurant logo in Firestore
      await RestaurantService.updateRestaurantLogo(restaurant.id, downloadURL);

      // Update local state
      setRestaurant(prev => prev ? { ...prev, logoUrl: downloadURL } : null);

      console.log('✅ Restaurant logo updated successfully');
      return downloadURL;
    } catch (error) {
      console.error('❌ Error updating restaurant logo:', error);
      throw error;
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  const handleLogoRemove = async (): Promise<void> => {
    if (!restaurant?.logoUrl) return;

    setIsUpdatingLogo(true);
    try {
      // Delete image from Firebase Storage
      const storagePath = ImageUploadService.getStoragePathFromUrl(restaurant.logoUrl);
      if (storagePath) {
        await ImageUploadService.deleteImage(storagePath);
      }

      // Remove URL from restaurant in Firestore
      await RestaurantService.updateRestaurantLogo(restaurant.id, '');

      // Update local state
      setRestaurant(prev => prev ? { ...prev, logoUrl: '' } : null);

      console.log('✅ Restaurant logo removed successfully');
    } catch (error) {
      console.error('❌ Error removing restaurant logo:', error);
      throw error;
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  const formatHours = (hours: { [key: string]: { open: string; close: string; closed: boolean } }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    
    if (!todayHours || todayHours.closed) {
      return 'Closed today';
    }
    
    return `Open ${todayHours.open} - ${todayHours.close}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No restaurant found. Please set up your restaurant first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Restaurant Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload Section */}
        <div className="flex flex-col items-center space-y-4">
          <RestaurantLogoUpload
            currentImageUrl={restaurant.logoUrl}
            onImageUpload={handleLogoUpload}
            onImageRemove={restaurant.logoUrl ? handleLogoRemove : undefined}
            disabled={isUpdatingLogo}
          />
          <div className="text-center">
            <h3 className="text-xl font-bold">{restaurant.name}</h3>
            <p className="text-gray-600">{restaurant.cuisine} Cuisine</p>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-sm text-gray-900">{restaurant.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm text-gray-900">{restaurant.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{restaurant.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {restaurant.website && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Website</p>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {restaurant.website}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Hours Today</p>
                <p className="text-sm text-gray-900">{formatHours(restaurant.hours)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Star className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Rating</p>
                <p className="text-sm text-gray-900">
                  {restaurant.rating.toFixed(1)} stars ({restaurant.totalOrders} orders)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">About</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{restaurant.description}</p>
          </div>
        )}

        {/* Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                Restaurant {restaurant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Updated {restaurant.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
