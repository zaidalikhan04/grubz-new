import { SearchIcon, ShoppingCartIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { useAuth } from "../../../../contexts/AuthContext";

export const CommitmentToQualitySection = (): JSX.Element => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Navigation menu items data
  const menuItems = [
    {
      label: "Restaurants",
      action: () => {
        const element = document.getElementById('restaurants');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      label: "About Us",
      action: () => {
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      label: "Contact",
      action: () => {
        const element = document.getElementById('contact');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
  ];

  const handleLoginClick = () => {
    navigate('/auth?mode=login');
  };

  const handleSignUpClick = () => {
    navigate('/auth?mode=signup');
  };

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'customer':
        return '/dashboard';
      case 'restaurant_owner':
        return '/restaurant';
      case 'delivery_rider':
        return '/delivery';
      default:
        return '/dashboard';
    }
  };

  const handleDashboardClick = () => {
    if (currentUser) {
      navigate(getRedirectPath(currentUser.role));
    }
  };

  return (
    <header className="flex items-center justify-between px-10 py-3 border-b border-[#e5e8ea] w-full">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <div className="w-4 h-4">
          <img
            src="/vector---0.svg"
            alt="Grubz logo"
            className="w-full h-full"
          />
        </div>
        <h1 className="font-bold text-lg [font-family:'Plus_Jakarta_Sans',Helvetica]">
          <span className="text-[#190c0c]">Grub</span>
          <span className="text-[#dd3333]">z</span>
        </h1>
      </div>

      {/* Navigation and Action Buttons */}
      <div className="flex items-center justify-end gap-8 flex-1">
        {/* Navigation Menu */}
        <div className="flex gap-9">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={item.action}
              className="font-medium text-sm text-[#190c0c] [font-family:'Plus_Jakarta_Sans',Helvetica] hover:bg-gray-100 px-3 py-2"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-[#f2e8e8] rounded-[20px]"
          >
            <SearchIcon className="h-5 w-5 text-[#190c0c]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-[#f2e8e8] rounded-[20px]"
          >
            <ShoppingCartIcon className="h-5 w-5 text-[#190c0c]" />
          </Button>
          
          {/* Authentication Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
              <Button
                onClick={handleDashboardClick}
                className="bg-[#dd3333] hover:bg-[#c52e2e] text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Dashboard
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <Button
                onClick={handleLoginClick}
                variant="outline"
                className="px-4 py-2 rounded-lg text-sm font-medium"
              >
                Login
              </Button>
              <Button
                onClick={handleSignUpClick}
                className="bg-[#dd3333] hover:bg-[#c52e2e] text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};