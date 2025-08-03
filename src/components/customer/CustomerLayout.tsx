import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
  LogOut,
  Menu,
  X,
  Search,
  CheckCircle,
  Store,
  Truck,
  Home,
  ShoppingBag,
  Heart,
  UserPlus,
  User,
  Bell,
  Settings,
  MapPin,
  Clock
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  currentPage,
  onPageChange
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoleUpgradeNotification, setShowRoleUpgradeNotification] = useState(false);

  // Check if user has been upgraded to a partner role
  useEffect(() => {
    if (user && (user.role === 'restaurant_owner' || user.role === 'delivery_rider')) {
      setShowRoleUpgradeNotification(true);
    }
  }, [user]);

  const handleAccessPartnerDashboard = () => {
    if (user?.role === 'restaurant_owner') {
      navigate('/restaurant');
    } else if (user?.role === 'delivery_rider') {
      navigate('/delivery');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Modern Header */}
      <header className="bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img src="/vector---0.svg" alt="Grubz logo" className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="text-[#190c0c]">Grub</span>
                    <span className="text-[#dd3333]">z</span>
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Food That Moves</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                <button
                  onClick={() => onPageChange('home')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'home'
                      ? 'bg-[#dd3333] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                  }`}
                >
                  <Home className="h-4 w-4 inline mr-2" />
                  Home
                </button>
                <button
                  onClick={() => onPageChange('orders')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'orders'
                      ? 'bg-[#dd3333] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4 inline mr-2" />
                  Orders
                </button>
                <button
                  onClick={() => onPageChange('favorites')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'favorites'
                      ? 'bg-[#dd3333] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                  }`}
                >
                  <Heart className="h-4 w-4 inline mr-2" />
                  Favorites
                </button>

              </nav>
            </div>

            {/* Right side - Notifications, Profile */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-[#dd3333] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Profile Dropdown */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Grubber'}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>

                {/* Clickable Profile Avatar */}
                <button
                  onClick={() => onPageChange('profile')}
                  className="w-10 h-10 bg-gradient-to-br from-[#dd3333] to-[#c52e2e] rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
                  title="View Profile"
                >
                  {user?.photoURL || user?.profilePictureUrl || user?.profilePhoto ? (
                    <img
                      src={user.photoURL || user.profilePictureUrl || user.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = user?.name?.charAt(0) || 'G';
                      }}
                    />
                  ) : (
                    user?.name?.charAt(0) || 'G'
                  )}
                </button>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="hidden md:flex items-center gap-2 hover:bg-red-50 hover:text-[#dd3333] hover:border-[#dd3333] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="w-80 bg-white shadow-2xl fixed inset-y-0 left-0 z-50 lg:hidden transition-all duration-300 ease-in-out flex flex-col">
          <div className="flex items-center justify-between h-16 px-6 border-b bg-gradient-to-r from-[#dd3333] to-[#c52e2e]">
            <div className="flex items-center gap-3">
              <img src="/vector---0.svg" alt="Grubz logo" className="w-8 h-8 filter brightness-0 invert" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Grub<span className="text-red-200">z</span>
                </h1>
                <p className="text-xs text-red-100 font-medium">Food That Moves</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0) || 'G'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user?.name || 'Grubber'}</p>
                <p className="text-sm text-gray-500">Customer Account</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Tallahassee, FL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 py-6">
            <nav className="px-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
                Main Menu
              </div>

              <button
                onClick={() => {
                  onPageChange('home');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentPage === 'home'
                    ? 'bg-gradient-to-r from-[#dd3333] to-[#c52e2e] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  onPageChange('orders');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentPage === 'orders'
                    ? 'bg-gradient-to-r from-[#dd3333] to-[#c52e2e] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>My Orders</span>
                <span className="ml-auto bg-[#dd3333] text-white text-xs px-2 py-1 rounded-full">2</span>
              </button>

              <button
                onClick={() => {
                  onPageChange('favorites');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentPage === 'favorites'
                    ? 'bg-gradient-to-r from-[#dd3333] to-[#c52e2e] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                }`}
              >
                <Heart className="h-5 w-5" />
                <span>Favorites</span>
              </button>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3 pt-6">
                Account
              </div>



              <button
                onClick={() => {
                  onPageChange('settings');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentPage === 'settings'
                    ? 'bg-gradient-to-r from-[#dd3333] to-[#c52e2e] text-white shadow-lg'
                    : 'text-gray-700 hover:bg-red-50 hover:text-[#dd3333]'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-3">
              {/* User Info - Clickable to open profile */}
              <button
                onClick={() => {
                  onPageChange('profile');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#dd3333] to-[#c52e2e] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                  {user?.photoURL || user?.profilePictureUrl || user?.profilePhoto ? (
                    <img
                      src={user.photoURL || user.profilePictureUrl || user.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = user?.name?.charAt(0) || 'G';
                      }}
                    />
                  ) : (
                    user?.name?.charAt(0) || 'G'
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 truncate">{user?.name || 'Grubber'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <p className="text-xs text-[#dd3333] font-medium">Tap to view profile</p>
                </div>
              </button>

              {/* Logout Button */}
              <Button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="w-full bg-[#dd3333] hover:bg-[#c52e2e] text-white flex items-center justify-center gap-2 font-semibold py-3"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Role Upgrade Notification */}
        {showRoleUpgradeNotification && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      🎉 Congratulations! Application Approved!
                    </h3>
                    <p className="text-green-700 mb-4">
                      Your {user?.role === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver'} application has been approved.
                      You now have access to your partner dashboard with all the tools you need to get started.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleAccessPartnerDashboard}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg"
                      >
                        {user?.role === 'restaurant_owner' ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                        Access {user?.role === 'restaurant_owner' ? 'Restaurant' : 'Driver'} Dashboard
                      </Button>
                      <Button
                        onClick={() => setShowRoleUpgradeNotification(false)}
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1">
            {children}
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src="/vector---0.svg" alt="Grubz logo" className="w-8 h-8 filter brightness-0 invert" />
                    <div>
                      <h3 className="text-xl font-bold">
                        Grub<span className="text-[#dd3333]">z</span>
                      </h3>
                      <p className="text-sm text-gray-300">Food That Moves</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The leading food delivery platform trusted by customers to discover new tastes,
                    delivered right to their doorstep.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>Tallahassee, FL</span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Quick Links</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => onPageChange('home')}
                      className="block text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => onPageChange('orders')}
                      className="block text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => onPageChange('favorites')}
                      className="block text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Favorites
                    </button>
                    <button
                      onClick={() => onPageChange('profile')}
                      className="block text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Profile
                    </button>
                  </div>
                </div>

                {/* Customer Care */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Customer Care</h4>
                  <div className="space-y-2">
                    <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                      Help Center
                    </a>
                    <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                      Contact Support
                    </a>
                    <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                      Order Tracking
                    </a>
                    <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                      Refunds & Returns
                    </a>
                  </div>
                </div>

                {/* Partner With Us */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Partner With Us</h4>
                  <div className="space-y-2">
                    <a
                      href="/apply/restaurant-form"
                      className="block text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Restaurant Partner
                    </a>
                    <a
                      href="/apply/delivery-form"
                      className="block text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Delivery Driver
                    </a>
                    <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                      Business Solutions
                    </a>
                    <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                      Advertise With Us
                    </a>
                  </div>
                </div>
              </div>

              {/* User Info & Logout Section */}
              <div className="border-t border-gray-700 pt-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#dd3333] to-[#c52e2e] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {user?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user?.name || 'Grubber'}</p>
                      <p className="text-sm text-gray-400">Customer Account • {user?.email}</p>
                    </div>
                  </div>

                  <Button
                    onClick={logout}
                    className="bg-[#dd3333] hover:bg-[#c52e2e] text-white flex items-center gap-2 px-6 py-2 font-semibold shadow-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-400">
                    © 2024 <span className="font-semibold text-white">Grub<span className="text-[#dd3333]">z</span></span>.
                    All rights reserved.
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
