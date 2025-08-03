import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService, Restaurant } from '../../services/restaurant';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  User,
  Camera,
  Edit,
  Save,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Award,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';

export const RestaurantProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [profileData, setProfileData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    cuisine: '',
    website: ''
  });

  // Load restaurant data with real-time sync
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔄 Setting up restaurant profile listeners for user:', currentUser.id);
    setLoading(true);

    let loadedCount = 0;
    const totalListeners = 2;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalListeners) {
        setLoading(false);
      }
    };

    // Listen to user data for basic profile info
    const unsubscribeUser = onSnapshot(
      doc(db, 'users', currentUser.id),
      (doc) => {
        console.log('📄 User document updated:', doc.exists());
        if (doc.exists()) {
          const userData = doc.data();
          console.log('👤 User data:', userData);

          // Update profile data with user info
          setProfileData(prev => ({
            ...prev,
            ownerName: userData.name || currentUser.name || '',
            email: userData.email || currentUser.email || '',
            phone: userData.phone || ''
          }));
        }
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in user snapshot:', error);
        checkComplete();
      }
    );

    // Listen to restaurant data from restaurants/{uid} - only approved restaurants
    const unsubscribeRestaurant = onSnapshot(
      doc(db, 'restaurants', currentUser.id),
      (doc) => {
        console.log('📄 Restaurant document updated:', doc.exists());
        if (doc.exists()) {
          const restaurantData = doc.data();
          console.log('🏪 Restaurant data:', restaurantData);

          // Only show if status is approved
          if (restaurantData.status === 'approved') {
            // Create restaurant object
            const restaurant: Restaurant = {
              id: doc.id,
              name: restaurantData.restaurantName || restaurantData.name || '',
              description: restaurantData.description || '',
              cuisine: restaurantData.cuisine || '',
              address: restaurantData.address || '',
              phone: restaurantData.phone || '',
              email: restaurantData.email || currentUser.email || '',
              website: restaurantData.website || '',
              hours: restaurantData.hours || {},
              rating: restaurantData.rating || 4.5,
              totalOrders: restaurantData.totalOrders || 0,
              isActive: restaurantData.isActive || false,
              createdAt: restaurantData.createdAt?.toDate() || new Date(),
              ownerId: currentUser.id
            };

            setRestaurant(restaurant);
            setProfileData({
              restaurantName: restaurant.name,
              ownerName: currentUser.name || '',
              email: restaurant.email,
              phone: restaurant.phone,
              address: restaurant.address,
              description: restaurant.description,
              cuisine: restaurant.cuisine,
              website: restaurant.website
            });
          } else {
            console.log('ℹ️ Restaurant not approved yet, checking for application...');
            setRestaurant(null);
            checkForApplicationData();
          }
        } else {
          console.log('ℹ️ No restaurant data found, checking for application...');
          // If no restaurant data, check for application data
          checkForApplicationData();
        }
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in restaurant snapshot:', error);
        checkComplete();
      }
    );

    // Function to check for application data if no restaurant exists
    const checkForApplicationData = async () => {
      try {
        const applicationDoc = await getDoc(doc(db, 'restaurantApplications', currentUser.id));
        if (applicationDoc.exists()) {
          const appData = applicationDoc.data();
          console.log('📋 Found restaurant application data:', appData);

          // Pre-populate form with application data
          setProfileData(prev => ({
            ...prev,
            restaurantName: appData.restaurantName || '',
            email: appData.userEmail || currentUser.email || '',
            phone: appData.phone || '',
            address: appData.address || '',
            description: appData.description || '',
            cuisine: appData.cuisine || '',
            website: appData.website || ''
          }));
        }
      } catch (error) {
        console.error('❌ Error checking application data:', error);
      }
    };

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up restaurant profile listeners');
      unsubscribeUser();
      unsubscribeRestaurant();
    };
  }, [currentUser]);

  const stats = [
    { label: 'Total Orders', value: restaurant?.totalOrders?.toString() || '0', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Customer Rating', value: restaurant?.rating?.toFixed(1) || '0.0', icon: Star, color: 'text-yellow-600' },
    { label: 'Status', value: restaurant?.isActive ? 'Active' : 'Inactive', icon: Users, color: restaurant?.isActive ? 'text-green-600' : 'text-red-600' },
    { label: 'Since', value: restaurant ? new Date(restaurant.createdAt).getFullYear().toString() : 'N/A', icon: Award, color: 'text-purple-600' }
  ];

  const achievements = [
    { title: 'Top Rated Restaurant', description: 'Maintained 4.5+ rating for 6 months', icon: Star },
    { title: 'Fast Delivery', description: 'Average delivery time under 30 minutes', icon: Clock },
    { title: 'Customer Favorite', description: 'Over 1000 repeat customers', icon: Users },
    { title: 'Quality Excellence', description: 'Zero food safety violations', icon: Award }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!restaurant) return;

    try {
      setSaving(true);
      await RestaurantService.updateRestaurant(restaurant.id, {
        name: profileData.restaurantName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        description: profileData.description,
        cuisine: profileData.cuisine,
        website: profileData.website
      });

      setIsEditing(false);
      alert('Restaurant profile updated successfully!');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Error updating restaurant profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading restaurant profile...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Profile Setup</h2>
            <p className="text-gray-600 mb-6">
              Complete your restaurant profile to start receiving orders and managing your business.
            </p>

            {/* Show current user data */}
            <Card className="text-left mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Owner Name</Label>
                  <p className="text-gray-900">{profileData.ownerName || currentUser?.name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-900">{profileData.email || currentUser?.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                </div>
                {profileData.restaurantName && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Restaurant Name (from application)</Label>
                    <p className="text-gray-900">{profileData.restaurantName}</p>
                  </div>
                )}
                {profileData.cuisine && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cuisine Type (from application)</Label>
                    <p className="text-gray-900">{profileData.cuisine}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Your restaurant profile will be created once your application is approved by our admin team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.location.href = '/apply/restaurant-form'}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Update Application
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-[#dd3333] hover:bg-[#c52e2e]"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
          <p className="text-gray-600">Manage your restaurant information and public profile</p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#704ce5] to-[#5a3bc4] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.restaurantName.charAt(0)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:text-gray-800"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.restaurantName}</h3>
                  <p className="text-gray-600">{profileData.cuisine} Restaurant</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800">Open</Badge>
                    <Badge className="bg-blue-100 text-blue-800">{profileData.priceRange}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <Input
                    value={profileData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <Input
                    value={profileData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Address
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#704ce5] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  rows={3}
                  value={profileData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                  <Input
                    value={profileData.cuisine}
                    onChange={(e) => handleInputChange('cuisine', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <Input
                    value={profileData.priceRange}
                    onChange={(e) => handleInputChange('priceRange', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                  <Input
                    value={profileData.established}
                    onChange={(e) => handleInputChange('established', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Achievements */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <achievement.icon className="h-3 w-3 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
