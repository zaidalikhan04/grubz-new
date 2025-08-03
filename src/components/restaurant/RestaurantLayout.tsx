import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

import {
  LogOut,
  Menu,
  X,
  Store,
  ShoppingBag,
  User,
  Settings
} from 'lucide-react';

interface RestaurantLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const RestaurantLayout: React.FC<RestaurantLayoutProps> = ({ 
  children, 
  currentPage, 
  onPageChange 
}) => {
  const { user, logout } = useAuth();
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
              <p className="text-xs text-gray-500 font-medium">Restaurant Portal</p>
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

        <div className="flex-1 mt-6 px-3">
          <nav className="space-y-1">
            <button
              onClick={() => {
                onPageChange('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Store className="h-5 w-5" />
              Dashboard
            </button>



            <button
              onClick={() => {
                onPageChange('orders');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'orders'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Orders
            </button>



            <button
              onClick={() => {
                onPageChange('restaurant');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'restaurant'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Store className="h-5 w-5" />
              My Restaurant
            </button>

            <button
              onClick={() => {
                onPageChange('profile');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 'profile'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
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
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#704ce5] rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
              {user?.photoURL || user?.profilePictureUrl || user?.profilePhoto ? (
                <img
                  src={user.photoURL || user.profilePictureUrl || user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = user?.name?.charAt(0) || 'R';
                  }}
                />
              ) : (
                user?.name?.charAt(0) || 'R'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Restaurant Owner</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full flex items-center gap-2"
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
              <h2 className="text-lg font-semibold capitalize">{currentPage}</h2>
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
