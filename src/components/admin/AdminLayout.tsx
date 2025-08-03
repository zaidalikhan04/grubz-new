import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { AdminNotificationDropdown } from './AdminNotificationDropdown';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

import {
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  Store
} from 'lucide-react';



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
  const { currentUser, logout, loading } = useAuth();
  const { addNotification } = useAdminNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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



  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🔄 Admin logout initiated...');

      // Add a timeout to prevent hanging
      const logoutPromise = logout();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Logout timeout')), 10000)
      );

      await Promise.race([logoutPromise, timeoutPromise]);
      console.log('✅ Admin logout completed');
    } catch (error) {
      console.error('❌ Admin logout error:', error);
      setIsLoggingOut(false);

      // Force reload if logout fails
      if (error.message === 'Logout timeout') {
        console.log('🔄 Logout timeout, forcing page reload...');
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex transition-all duration-300 ease-in-out">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-white shadow-lg fixed inset-y-0 left-0 z-50 lg:relative transition-all duration-300 ease-in-out flex flex-col">
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
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
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
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            <button
              onClick={() => {
                onPageChange('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>

            <button
              onClick={() => {
                onPageChange('users');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'users'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              User Management
            </button>

            <button
              onClick={() => {
                onPageChange('partner-requests');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'partner-requests'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="h-5 w-5" />
              <span className="flex-1 text-left">Partner Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onPageChange('approved-restaurants');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'approved-restaurants'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Store className="h-5 w-5" />
              Restaurants
            </button>

            <button
              onClick={() => {
                onPageChange('settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
          </nav>
        </div>

        {/* User info and logout */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
              {currentUser?.photoURL || currentUser?.profilePictureUrl || currentUser?.profilePhoto ? (
                <img
                  src={currentUser.photoURL || currentUser.profilePictureUrl || currentUser.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to shield icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V18H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/></svg>';
                  }}
                />
              ) : (
                <Shield className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">Admin ID: #{currentUser?.id || 'admin'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut || loading}
            className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            {isLoggingOut || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </Button>
        </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header - visible on all screen sizes */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  title="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
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
        <main className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <div className="p-6 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
