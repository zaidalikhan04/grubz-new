import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService, Restaurant } from '../../services/restaurant';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Truck,
  Bell,
  Shield,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const RestaurantSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  const [settings, setSettings] = useState({
    restaurantName: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    minimumOrder: '15.00',
    deliveryFee: '3.99',
    deliveryRadius: '5',
    estimatedDeliveryTime: '30-45',
    isOpen: true,
    acceptingOrders: true,
    notifications: {
      newOrders: true,
      orderUpdates: true,
      customerReviews: true,
      promotions: false
    }
  });

  const [operatingHours, setOperatingHours] = useState([
    { day: 'Monday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Tuesday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Wednesday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Thursday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Friday', open: '11:00', close: '23:00', isOpen: true },
    { day: 'Saturday', open: '10:00', close: '23:00', isOpen: true },
    { day: 'Sunday', open: '12:00', close: '21:00', isOpen: false }
  ]);

  // Load restaurant data
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const restaurantData = await RestaurantService.getRestaurantByOwnerId(currentUser.id);

        if (restaurantData) {
          setRestaurant(restaurantData);

          // Update settings with restaurant data
          setSettings({
            restaurantName: restaurantData.name || '',
            description: restaurantData.description || '',
            address: restaurantData.address || '',
            phone: restaurantData.phone || '',
            email: restaurantData.email || '',
            website: restaurantData.website || '',
            minimumOrder: '15.00', // These could be added to restaurant model later
            deliveryFee: '3.99',
            deliveryRadius: '5',
            estimatedDeliveryTime: '30-45',
            isOpen: restaurantData.isActive || false,
            acceptingOrders: restaurantData.isActive || false,
            notifications: {
              newOrders: true,
              orderUpdates: true,
              customerReviews: true,
              promotions: false
            }
          });

          // Convert restaurant hours to operating hours format
          if (restaurantData.hours) {
            const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const hoursArray = daysOrder.map(day => {
              const dayKey = day.toLowerCase();
              const dayHours = restaurantData.hours[dayKey];
              return {
                day,
                open: dayHours?.open || '09:00',
                close: dayHours?.close || '22:00',
                isOpen: !dayHours?.closed
              };
            });
            setOperatingHours(hoursArray);
          }
        } else {
          setMessage('❌ No restaurant found. Please set up your restaurant first.');
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        setMessage('❌ Failed to load restaurant data.');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [currentUser]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleHoursChange = (index: number, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setOperatingHours(prev => prev.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  const handleSave = async () => {
    if (!restaurant || !currentUser) {
      setMessage('❌ No restaurant data to save.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // Convert operating hours back to restaurant hours format
      const hoursData: { [key: string]: { open: string; close: string; closed: boolean } } = {};
      operatingHours.forEach(schedule => {
        const dayKey = schedule.day.toLowerCase();
        hoursData[dayKey] = {
          open: schedule.open,
          close: schedule.close,
          closed: !schedule.isOpen
        };
      });

      // Prepare update data
      const updateData: Partial<Restaurant> = {
        name: settings.restaurantName,
        description: settings.description,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        hours: hoursData,
        isActive: settings.isOpen
      };

      // Update restaurant in database
      await RestaurantService.updateRestaurant(restaurant.id, updateData);

      setMessage('✅ Settings saved successfully!');
      console.log('✅ Restaurant settings updated:', updateData);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error saving restaurant settings:', error);
      setMessage('❌ Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading restaurant settings...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Restaurant Found</h3>
          <p className="text-gray-600">You need to set up your restaurant first to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
          <p className="text-gray-600">Manage your restaurant information and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.includes('✅')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <Input
                value={settings.restaurantName}
                onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                placeholder="Enter restaurant name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#704ce5] focus:border-transparent"
                rows={3}
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              <Input
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Restaurant address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                <Input
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Contact email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Minimum Order ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.minimumOrder}
                  onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.deliveryFee}
                  onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (miles)</label>
                <Input
                  type="number"
                  value={settings.deliveryRadius}
                  onChange={(e) => handleInputChange('deliveryRadius', e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Est. Delivery Time (min)
                </label>
                <Input
                  value={settings.estimatedDeliveryTime}
                  onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
                  placeholder="30-45"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Restaurant Status</span>
                <Badge className={settings.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {settings.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Accepting Orders</span>
                <Badge className={settings.acceptingOrders ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {settings.acceptingOrders ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operatingHours.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 w-20">{schedule.day}</span>
                  <Badge className={schedule.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {schedule.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={schedule.isOpen}
                      onChange={(e) => handleHoursChange(index, 'isOpen', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Open</span>
                  </label>
                  {schedule.isOpen && (
                    <>
                      <Input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => handleHoursChange(index, 'open', e.target.value)}
                        className="w-24"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => handleHoursChange(index, 'close', e.target.value)}
                        className="w-24"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {key === 'newOrders' && 'Get notified when new orders are received'}
                    {key === 'orderUpdates' && 'Receive updates on order status changes'}
                    {key === 'customerReviews' && 'Get notified about new customer reviews'}
                    {key === 'promotions' && 'Receive promotional and marketing updates'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
