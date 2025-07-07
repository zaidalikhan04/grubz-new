import React, { useState } from 'react';
import { CustomerLayout } from '../components/customer/CustomerLayout';
import { CustomerHome } from '../components/customer/CustomerHome';
import { CustomerOrders } from '../components/customer/CustomerOrders';
import { CustomerFavorites } from '../components/customer/CustomerFavorites';
import { CustomerSettings } from '../components/customer/CustomerSettings';
import { CustomerProfile } from '../components/customer/CustomerProfile';

export const CustomerDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <CustomerHome onPageChange={setCurrentPage} />;
      case 'orders':
        return <CustomerOrders />;
      case 'favorites':
        return <CustomerFavorites />;
      case 'profile':
        return <CustomerProfile />;
      case 'settings':
        return <CustomerSettings />;
      default:
        return <CustomerHome onPageChange={setCurrentPage} />;
    }
  };

  return (
    <CustomerLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderCurrentPage()}
    </CustomerLayout>
  );
};