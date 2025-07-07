import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
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
              <p className="text-xs text-gray-500 font-medium">Grubber Hub</p>
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

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${currentPage === item.id 
                    ? 'bg-[#dd3333] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#dd3333] rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Grubber</p>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header - visible on all screen sizes */}
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
                {currentPage === 'home' ? 'Welcome to Grubz' : currentPage}
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange('profile')}
              className="flex items-center gap-2 hover:bg-[#dd3333] hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              My Profile
            </Button>
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
