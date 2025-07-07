import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  LayoutDashboard,
  Truck,
  DollarSign,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  MapPin,
  Clock
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
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deliveries', label: 'Active Deliveries', icon: Truck },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'history', label: 'Delivery History', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
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
                <span className="text-[#190c0c]">Grub</span>
                <span className="text-[#dd3333]">z</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Driver Portal</p>
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

        {/* Driver Status */}
        <div className="px-6 py-4 border-b bg-green-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Online & Available</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Ready for deliveries</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  currentPage === item.id 
                    ? 'bg-[#dd3333] text-white hover:bg-[#c52e2e]' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#dd3333] rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Driver ID: #{user?.id || '12345'}</p>
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
                {currentPage === 'dashboard' ? 'Driver Dashboard' : currentPage}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">$84.50</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">18m</span>
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
