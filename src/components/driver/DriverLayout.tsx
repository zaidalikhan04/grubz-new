import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

import {
  LogOut,
  Menu,
  X,
  Bell,
  MapPin,
  Clock,
  Truck,
  ShoppingBag,
  DollarSign,
  User,
  Settings
} from 'lucide-react';

interface DriverLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const DriverLayout: React.FC<DriverLayoutProps> = ({ 
  children, 
  currentPage, 
  onPageChange 
}) => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);



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
      {sidebarOpen && (
        <div className="w-64 bg-white shadow-lg fixed inset-y-0 left-0 z-50 lg:relative transition-all duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <img src="/vector---0.svg" alt="Grubz logo" className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">
                <span className="text-[#190c0c]">Grub</span>
                <span className="text-[#dd3333]">z</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Driver Portal</p>
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

        {/* Driver Status */}
        <div className="px-6 py-4 border-b bg-green-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Online & Available</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Ready for deliveries</p>
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
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Truck className="h-5 w-5" />
              Dashboard
            </button>

            <button
              onClick={() => {
                onPageChange('deliveries');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'deliveries'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Active Deliveries
            </button>

            <button
              onClick={() => {
                onPageChange('earnings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'earnings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Earnings
            </button>

            <button
              onClick={() => {
                onPageChange('profile');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <User className="h-5 w-5" />
              Profile
            </button>



            <button
              onClick={() => {
                onPageChange('settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
              {currentUser?.photoURL || currentUser?.profilePictureUrl || currentUser?.profilePhoto ? (
                <img
                  src={currentUser.photoURL || currentUser.profilePictureUrl || currentUser.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                  }}
                />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">Driver ID: #{currentUser?.id || '12345'}</p>
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
                {currentPage === 'dashboard' ? 'Driver Dashboard' : currentPage}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Stats - Real-time data shown in dashboard */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Live</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">Real-time</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Data</span>
                </div>
              </div>

              {/* Notifications */}
              <NotificationDropdown onPageChange={onPageChange} />
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
