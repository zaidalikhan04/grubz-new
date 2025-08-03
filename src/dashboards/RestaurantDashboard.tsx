import React, { useState, useEffect } from 'react';
import { RestaurantLayout } from '../components/restaurant/RestaurantLayout';
import { DashboardOverview } from '../components/restaurant/DashboardOverview';
import { RestaurantOrders } from '../components/restaurant/RestaurantOrders';


import { RestaurantSettings } from '../components/restaurant/RestaurantSettings';
import { RestaurantProfile } from '../components/restaurant/RestaurantProfile';
import { RestaurantSetup } from '../components/restaurant/RestaurantSetup';
import { MyRestaurant } from '../components/restaurant/MyRestaurant';
import { ProfileSection } from '../components/profile/ProfileSection';
import { RestaurantInfoSection } from '../components/restaurant/RestaurantInfoSection';
import { useAuth } from '../contexts/AuthContext';
import { RestaurantService } from '../services/restaurant';
import { Loader2 } from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [hasRestaurant, setHasRestaurant] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if restaurant is set up
  useEffect(() => {
    const checkRestaurantSetup = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const restaurant = await RestaurantService.getRestaurantByOwnerId(currentUser.id);
        setHasRestaurant(!!restaurant);
      } catch (error) {
        console.error('Error checking restaurant setup:', error);
        setHasRestaurant(false);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurantSetup();
  }, [currentUser]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  // Note: We no longer automatically show setup form
  // Users can access it through the "My Restaurant" section

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'orders':
        return <RestaurantOrders />;


      case 'restaurant':
        return <MyRestaurant />;
      case 'restaurant-info':
        return <RestaurantInfoSection />;
      case 'settings':
        return <RestaurantSettings />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <RestaurantLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderCurrentPage()}
    </RestaurantLayout>
  );
};