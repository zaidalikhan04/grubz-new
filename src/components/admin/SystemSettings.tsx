import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  DollarSign,
  Clock,
  Bell,
  Mail,
  Globe,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { playNotificationSound, setPlayNotificationSound, addNotification } = useAdminNotifications();
  const [settings, setSettings] = useState({
    platform: {
      platformName: 'Grubz',
      platformDescription: 'Premium Food Delivery Platform',
      supportEmail: 'support@grubz.com',
      supportPhone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en'
    },
    commission: {
      restaurantCommission: 15,
      deliveryFee: 2.99,
      serviceFee: 1.99,
      minimumOrderValue: 10.00,
      freeDeliveryThreshold: 25.00
    },
    delivery: {
      maxDeliveryRadius: 10,
      averageDeliveryTime: 30,
      peakHourMultiplier: 1.5,
      enableRealTimeTracking: true,
      autoAssignOrders: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      orderUpdates: true,
      promotionalEmails: false,
      soundNotifications: playNotificationSound,
      restaurantApprovals: true,
      driverApprovals: true,
      systemAlerts: true,
      securityAlerts: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireSpecialChars: true,
      maxLoginAttempts: 5
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'System is under maintenance. Please check back later.',
      backupFrequency: 'daily',
      logRetentionDays: 30
    }
  });

  const [saving, setSaving] = useState(false);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      console.log('Resetting settings...');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure platform settings and operational parameters</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.platform.platformName}
                onChange={(e) => handleSettingChange('platform', 'platformName', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={settings.platform.platformDescription}
                onChange={(e) => handleSettingChange('platform', 'platformDescription', e.target.value)}
                className="w-full p-2 border rounded-md h-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <input
                type="email"
                value={settings.platform.supportEmail}
                onChange={(e) => handleSettingChange('platform', 'supportEmail', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Support Phone</label>
              <input
                type="tel"
                value={settings.platform.supportPhone}
                onChange={(e) => handleSettingChange('platform', 'supportPhone', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select
                  value={settings.platform.timezone}
                  onChange={(e) => handleSettingChange('platform', 'timezone', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={settings.platform.currency}
                  onChange={(e) => handleSettingChange('platform', 'currency', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Commission & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Restaurant Commission (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={settings.commission.restaurantCommission}
                onChange={(e) => handleSettingChange('commission', 'restaurantCommission', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.commission.deliveryFee}
                onChange={(e) => handleSettingChange('commission', 'deliveryFee', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Service Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.commission.serviceFee}
                onChange={(e) => handleSettingChange('commission', 'serviceFee', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Order Value ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.commission.minimumOrderValue}
                onChange={(e) => handleSettingChange('commission', 'minimumOrderValue', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Free Delivery Threshold ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.commission.freeDeliveryThreshold}
                onChange={(e) => handleSettingChange('commission', 'freeDeliveryThreshold', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Delivery Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Delivery Radius (miles)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.delivery.maxDeliveryRadius}
                onChange={(e) => handleSettingChange('delivery', 'maxDeliveryRadius', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Average Delivery Time (minutes)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={settings.delivery.averageDeliveryTime}
                onChange={(e) => handleSettingChange('delivery', 'averageDeliveryTime', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peak Hour Multiplier</label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={settings.delivery.peakHourMultiplier}
                onChange={(e) => handleSettingChange('delivery', 'peakHourMultiplier', parseFloat(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Real-time Tracking</label>
                <input
                  type="checkbox"
                  checked={settings.delivery.enableRealTimeTracking}
                  onChange={(e) => handleSettingChange('delivery', 'enableRealTimeTracking', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-assign Orders</label>
                <input
                  type="checkbox"
                  checked={settings.delivery.autoAssignOrders}
                  onChange={(e) => handleSettingChange('delivery', 'autoAssignOrders', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password Minimum Length</label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Two-Factor Authentication</label>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Require Special Characters</label>
                <input
                  type="checkbox"
                  checked={settings.security.requireSpecialChars}
                  onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sound Notifications</label>
                <input
                  type="checkbox"
                  checked={playNotificationSound}
                  onChange={(e) => {
                    setPlayNotificationSound(e.target.checked);
                    handleSettingChange('notifications', 'soundNotifications', e.target.checked);
                  }}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Restaurant Approval Alerts</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.restaurantApprovals}
                  onChange={(e) => handleSettingChange('notifications', 'restaurantApprovals', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Driver Approval Alerts</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.driverApprovals}
                  onChange={(e) => handleSettingChange('notifications', 'driverApprovals', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">System Alerts</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Security Alerts</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.securityAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'securityAlerts', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Email Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => {
                  addNotification({
                    type: 'system_alert',
                    title: 'Test Notification',
                    message: 'This is a test notification to verify the system is working correctly.',
                    priority: 'medium',
                    actionUrl: '/admin/settings',
                    actionLabel: 'View Settings'
                  });
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Test Notification System
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status & Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Database</h3>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Payment Gateway</h3>
                <p className="text-sm text-green-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-medium">Email Service</h3>
                <p className="text-sm text-yellow-600">Limited</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Maintenance Mode</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Enable maintenance mode to perform system updates</p>
                <input
                  type="text"
                  placeholder="Maintenance message..."
                  value={settings.maintenance.maintenanceMessage}
                  onChange={(e) => handleSettingChange('maintenance', 'maintenanceMessage', e.target.value)}
                  className="mt-2 w-full p-2 border rounded-md text-sm"
                />
              </div>
              <Button
                variant={settings.maintenance.maintenanceMode ? "destructive" : "outline"}
                onClick={() => handleSettingChange('maintenance', 'maintenanceMode', !settings.maintenance.maintenanceMode)}
                className="ml-4"
              >
                {settings.maintenance.maintenanceMode ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
