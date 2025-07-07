import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings,
  Store,
  Truck,
  AlertTriangle,
  Shield,
  DollarSign,
  Users,
  ExternalLink,
  Clock
} from 'lucide-react';

interface AdminNotificationDropdownProps {
  onPageChange?: (page: string) => void;
}

export const AdminNotificationDropdown: React.FC<AdminNotificationDropdownProps> = ({ onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useAdminNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'restaurant_approval':
        return <Store className="h-4 w-4 text-blue-600" />;
      case 'driver_approval':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'security_alert':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'revenue_milestone':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'user_report':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-600 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl && onPageChange) {
      const page = notification.actionUrl.split('/').pop();
      if (page) {
        onPageChange(page);
        setIsOpen(false);
      }
    }
  };

  const recentNotifications = notifications.slice(0, 6);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.read);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium text-white ${
            criticalNotifications.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Admin Notifications
                {unreadCount > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${
                    criticalNotifications.length > 0 ? 'bg-red-500' : 'bg-gray-600'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm">All systems running smoothly!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      getPriorityColor(notification.priority)
                    } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-600'
                              }`}>
                                {notification.title}
                              </h4>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityBadgeColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              {notification.actionLabel && (
                                <span className="text-xs text-gray-900 font-medium flex items-center gap-1">
                                  {notification.actionLabel}
                                  <ExternalLink className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {notifications.length > 6 && (
                  <div className="p-3 border-t bg-gray-50">
                    <p className="text-xs text-gray-600 text-center">
                      Showing {recentNotifications.length} of {notifications.length} notifications
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onPageChange) {
                    onPageChange('settings');
                    setIsOpen(false);
                  }
                }}
                className="text-xs flex items-center gap-1"
              >
                <Settings className="h-3 w-3" />
                Notification Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
