import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminNotification {
  id: string;
  type: 'restaurant_approval' | 'driver_approval' | 'system_alert' | 'user_report' | 'revenue_milestone' | 'security_alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  data?: any;
}

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  playNotificationSound: boolean;
  setPlayNotificationSound: (play: boolean) => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};

interface AdminNotificationProviderProps {
  children: ReactNode;
}

export const AdminNotificationProvider: React.FC<AdminNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: '1',
      type: 'restaurant_approval',
      title: 'New Restaurant Application',
      message: 'Burger Express has submitted an application for approval',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      read: false,
      priority: 'high',
      actionUrl: '/admin/restaurants',
      actionLabel: 'Review Application',
      data: { restaurantId: 'rest_123', restaurantName: 'Burger Express' }
    },
    {
      id: '2',
      type: 'driver_approval',
      title: 'Driver Application Pending',
      message: 'John Smith has applied to become a delivery driver',
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      read: false,
      priority: 'medium',
      actionUrl: '/admin/deliveries',
      actionLabel: 'Review Driver',
      data: { driverId: 'driver_456', driverName: 'John Smith' }
    },
    {
      id: '3',
      type: 'system_alert',
      title: 'High Server Load Detected',
      message: 'Server CPU usage has exceeded 85% for the past 15 minutes',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: false,
      priority: 'critical',
      actionUrl: '/admin/settings',
      actionLabel: 'View System Status'
    },
    {
      id: '4',
      type: 'revenue_milestone',
      title: 'Revenue Milestone Reached',
      message: 'Platform has reached $100K in monthly revenue!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      priority: 'medium',
      actionUrl: '/admin/analytics',
      actionLabel: 'View Analytics'
    },
    {
      id: '5',
      type: 'user_report',
      title: 'User Report Submitted',
      message: 'Customer reported an issue with order #1234',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: false,
      priority: 'medium',
      actionUrl: '/admin/users',
      actionLabel: 'View Report',
      data: { orderId: '1234', userId: 'user_789' }
    },
    {
      id: '6',
      type: 'security_alert',
      title: 'Multiple Failed Login Attempts',
      message: 'Detected 5 failed login attempts from IP 192.168.1.100',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'high',
      actionUrl: '/admin/settings',
      actionLabel: 'Security Settings'
    }
  ]);
  
  const [playNotificationSound, setPlayNotificationSound] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AdminNotification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound if enabled and high priority
    if (playNotificationSound && (notificationData.priority === 'high' || notificationData.priority === 'critical')) {
      playSound();
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.message,
        icon: '/vector---0.svg',
        tag: newNotification.id
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const playSound = () => {
    // Create a notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sound for admin notifications (lower pitch)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Request notification permission on mount - DISABLED to prevent unwanted popups
  // useEffect(() => {
  //   if ('Notification' in window && Notification.permission === 'default') {
  //     Notification.requestPermission();
  //   }
  // }, []);

  // Simulate admin notifications for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications for demo
      if (Math.random() < 0.08) { // 8% chance every 45 seconds
        const notificationTypes = [
          {
            type: 'restaurant_approval' as const,
            title: 'New Restaurant Application',
            message: `${['Pizza Corner', 'Sushi World', 'Taco Bell', 'Burger King'][Math.floor(Math.random() * 4)]} has submitted an application`,
            priority: 'high' as const,
            actionUrl: '/admin/restaurants',
            actionLabel: 'Review Application'
          },
          {
            type: 'system_alert' as const,
            title: 'System Performance Alert',
            message: 'Database response time has increased by 20%',
            priority: 'medium' as const,
            actionUrl: '/admin/settings',
            actionLabel: 'Check System'
          },
          {
            type: 'user_report' as const,
            title: 'Customer Complaint',
            message: `Order #${Math.floor(Math.random() * 9000) + 1000} has received a complaint`,
            priority: 'medium' as const,
            actionUrl: '/admin/users',
            actionLabel: 'View Details'
          }
        ];
        
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        addNotification(randomNotification);
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const value: AdminNotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    playNotificationSound,
    setPlayNotificationSound
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};
