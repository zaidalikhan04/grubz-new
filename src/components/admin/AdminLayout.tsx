import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { AdminNotificationDropdown } from './AdminNotificationDropdown';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  Search,
  UserCheck
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentPage, 
  onPageChange 
}) => {
  const { user, logout } = useAuth();
  const { addNotification } = useAdminNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const previousCountRef = useRef(0);

  // Listen for pending partner requests
  useEffect(() => {
    const q = query(
      collection(db, 'partnerRequests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentCount = snapshot.size;
      setPendingRequestsCount(currentCount);

      // Check if there are new requests (count increased and not initial load)
      if (previousCountRef.current >= 0 && currentCount > previousCountRef.current && previousCountRef.current !== 0) {
        const newRequestsCount = currentCount - previousCountRef.current;

        // Get the latest request details for the notification
        const latestRequests = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate())
          .slice(0, newRequestsCount);

        // Add notification for each new request
        latestRequests.forEach((request: any) => {
          const requestType = request.type === 'restaurant_owner' ? 'Restaurant' : 'Driver';
          const applicantName = request.type === 'restaurant_owner'
            ? request.ownerName || request.restaurantName
            : request.fullName;

          addNotification({
            type: request.type === 'restaurant_owner' ? 'restaurant_approval' : 'driver_approval',
            title: `New ${requestType} Application`,
            message: `${applicantName || 'New applicant'} has submitted a ${requestType.toLowerCase()} partnership application and is awaiting approval.`,
            priority: 'high',
            actionUrl: '/admin/partner-requests',
            actionLabel: 'Review Application',
            data: { requestId: request.id, requestType: request.type }
          });
        });
      }

      // Update the previous count reference
      previousCountRef.current = currentCount;
    });

    return () => unsubscribe();
  }, [addNotification]);

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'partner-requests', label: 'Partner Requests', icon: UserCheck, badge: pendingRequestsCount },
    { id: 'restaurants', label: 'Restaurants', icon: Store },
    { id: 'deliveries', label: 'Delivery Management', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'data', label: 'Data Manager', icon: Shield },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <img src="/vector---0.svg" alt="Grubz logo" className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">
                <span className="text-gray-900">Grub</span>
                <span className="text-gray-700">z</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Admin Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Admin Status */}
        <div className="px-6 py-4 border-b bg-gray-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Administrator</span>
          </div>
          <p className="text-xs text-gray-300 mt-1">Full system access</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-between gap-3 ${
                  currentPage === item.id
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 rounded-full h-3 w-3"></span>
                )}
              </Button>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Admin ID: #{user?.id || 'admin'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold capitalize">
                {currentPage === 'dashboard' ? 'Admin Dashboard' : currentPage.replace('_', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                  />
                </div>
              </div>

              {/* Notifications */}
              <AdminNotificationDropdown onPageChange={onPageChange} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
