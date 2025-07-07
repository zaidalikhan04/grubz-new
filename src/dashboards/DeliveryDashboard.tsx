import React, { useState } from 'react';
import { DriverLayout } from '../components/driver/DriverLayout';
import { DriverDashboardOverview } from '../components/driver/DriverDashboardOverview';
import { DriverActiveDeliveries } from '../components/driver/DriverActiveDeliveries';
import { DriverEarnings } from '../components/driver/DriverEarnings';
import { DriverHistory } from '../components/driver/DriverHistory';
import { DriverProfile } from '../components/driver/DriverProfile';
import { DriverSettings } from '../components/driver/DriverSettings';

export const DeliveryDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DriverDashboardOverview />;
      case 'deliveries':
        return <DriverActiveDeliveries />;
      case 'earnings':
        return <DriverEarnings />;
      case 'history':
        return <DriverHistory />;
      case 'profile':
        return <DriverProfile />;
      case 'settings':
        return <DriverSettings />;
      default:
        return <DriverDashboardOverview />;
    }
  };

  return (
    <DriverLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderCurrentPage()}
    </DriverLayout>
  );
};