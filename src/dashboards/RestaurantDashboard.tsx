import React, { useState } from 'react';
import { RestaurantLayout } from '../components/restaurant/RestaurantLayout';
import { DashboardOverview } from '../components/restaurant/DashboardOverview';
import { OrdersManagement } from '../components/restaurant/OrdersManagement';
import { MenuManagement } from '../components/restaurant/MenuManagement';
import { RestaurantAnalytics } from '../components/restaurant/RestaurantAnalytics';
import { RestaurantSettings } from '../components/restaurant/RestaurantSettings';
import { RestaurantProfile } from '../components/restaurant/RestaurantProfile';

export const RestaurantDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'orders':
        return <OrdersManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'analytics':
        return <RestaurantAnalytics />;
      case 'settings':
        return <RestaurantSettings />;
      case 'profile':
        return <RestaurantProfile />;
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