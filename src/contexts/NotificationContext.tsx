import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'new_order' | 'order_update' | 'earnings' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  playNotificationSound: boolean;
  setPlayNotificationSound: (play: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'new_order',
      title: 'New Order Available',
      message: 'Pizza Palace - Order #1237 ready for pickup',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      priority: 'high',
      actionUrl: '/delivery/deliveries',
      actionLabel: 'View Order'
    },
    {
      id: '2',
      type: 'order_update',
      title: 'Order Status Update',
      message: 'Order #1234 has been delivered successfully',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'earnings',
      title: 'Daily Earnings Update',
      message: 'You\'ve earned $84.50 today with 12 deliveries',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Weekend Bonus Available',
      message: 'Earn extra $25 for completing 15+ deliveries this weekend',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'medium',
      actionUrl: '/delivery/earnings',
      actionLabel: 'Learn More'
    }
  ]);
  
  const [playNotificationSound, setPlayNotificationSound] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound if enabled
    if (playNotificationSound && notificationData.priority === 'high') {
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
    // Create a simple notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Simulate new notifications for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications for demo
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const orderTypes = ['Pizza Palace', 'Burger House', 'Sushi Express', 'Taco Fiesta'];
        const randomRestaurant = orderTypes[Math.floor(Math.random() * orderTypes.length)];
        const orderNumber = Math.floor(Math.random() * 9000) + 1000;
        
        addNotification({
          type: 'new_order',
          title: 'New Order Available',
          message: `${randomRestaurant} - Order #${orderNumber} ready for pickup`,
          priority: 'high',
          actionUrl: '/delivery/deliveries',
          actionLabel: 'View Order'
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
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
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
