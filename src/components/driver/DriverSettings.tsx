import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Settings,
  Bell,
  Clock,
  MapPin,
  Volume2,
  Smartphone,
  Shield,
  Save,
  Moon,
  Sun,
  Globe,
  DollarSign
} from 'lucide-react';

export const DriverSettings: React.FC = () => {
  const { playNotificationSound, setPlayNotificationSound } = useNotifications();
  const [settings, setSettings] = useState({
    notifications: {
      newOrders: true,
      orderUpdates: true,
      earnings: true,
      promotions: false,
      soundEnabled: true,
      vibrationEnabled: true
    },
    availability: {
      autoAcceptOrders: false,
      maxDistance: 10,
      workingHours: {
        start: '09:00',
        end: '21:00'
      },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      distanceUnit: 'miles',
      navigationApp: 'google'
    },
    privacy: {
      shareLocation: true,
      shareEarnings: false,
      allowRating: true,
      dataCollection: true
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (category: string, subcategory: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [subcategory]: {
          ...(prev[category as keyof typeof prev] as any)[subcategory],
          [setting]: value
        }
      }
    }));
  };

  const handleWorkingDayToggle = (day: string) => {
    const currentDays = settings.availability.workingDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleSettingChange('availability', 'workingDays', newDays);
  };

  const saveSettings = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const weekDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Driver Settings</h1>
        <Button onClick={saveSettings} className="flex items-center gap-2 bg-[#dd3333] hover:bg-[#c52e2e]">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Order Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when new orders are available</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.newOrders}
                  onChange={(e) => handleSettingChange('notifications', 'newOrders', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-gray-600">Updates about your active deliveries</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.orderUpdates}
                  onChange={(e) => handleSettingChange('notifications', 'orderUpdates', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Earnings Reports</p>
                  <p className="text-sm text-gray-600">Daily and weekly earnings summaries</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.earnings}
                  onChange={(e) => handleSettingChange('notifications', 'earnings', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions</p>
                  <p className="text-sm text-gray-600">Special offers and bonus opportunities</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.promotions}
                  onChange={(e) => handleSettingChange('notifications', 'promotions', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Alert Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <span>Sound Alerts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={playNotificationSound}
                    onChange={(e) => {
                      setPlayNotificationSound(e.target.checked);
                      handleSettingChange('notifications', 'soundEnabled', e.target.checked);
                    }}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Vibration</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.vibrationEnabled}
                    onChange={(e) => handleSettingChange('notifications', 'vibrationEnabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Accept Orders</p>
                <p className="text-sm text-gray-600">Automatically accept orders within your preferences</p>
              </div>
              <input
                type="checkbox"
                checked={settings.availability.autoAcceptOrders}
                onChange={(e) => handleSettingChange('availability', 'autoAcceptOrders', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Maximum Delivery Distance</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={settings.availability.maxDistance}
                  onChange={(e) => handleSettingChange('availability', 'maxDistance', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{settings.availability.maxDistance} mi</span>
              </div>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Working Hours</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-600">Start Time</label>
                  <input
                    type="time"
                    value={settings.availability.workingHours.start}
                    onChange={(e) => handleNestedSettingChange('availability', 'workingHours', 'start', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">End Time</label>
                  <input
                    type="time"
                    value={settings.availability.workingHours.end}
                    onChange={(e) => handleNestedSettingChange('availability', 'workingHours', 'end', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Working Days</label>
              <div className="grid grid-cols-2 gap-2">
                {weekDays.map((day) => (
                  <div key={day.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.availability.workingDays.includes(day.id)}
                      onChange={() => handleWorkingDayToggle(day.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Language</label>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Distance Unit</label>
              <select
                value={settings.preferences.distanceUnit}
                onChange={(e) => handleSettingChange('preferences', 'distanceUnit', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="miles">Miles</option>
                <option value="kilometers">Kilometers</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Navigation App</label>
              <select
                value={settings.preferences.navigationApp}
                onChange={(e) => handleSettingChange('preferences', 'navigationApp', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="google">Google Maps</option>
                <option value="apple">Apple Maps</option>
                <option value="waze">Waze</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Location</p>
                <p className="text-sm text-gray-600">Allow customers to track your location</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.shareLocation}
                onChange={(e) => handleSettingChange('privacy', 'shareLocation', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Earnings Data</p>
                <p className="text-sm text-gray-600">Help improve platform analytics</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.shareEarnings}
                onChange={(e) => handleSettingChange('privacy', 'shareEarnings', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Customer Ratings</p>
                <p className="text-sm text-gray-600">Let customers rate your service</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.allowRating}
                onChange={(e) => handleSettingChange('privacy', 'allowRating', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Collection</p>
                <p className="text-sm text-gray-600">Allow anonymous usage data collection</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.dataCollection}
                onChange={(e) => handleSettingChange('privacy', 'dataCollection', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
