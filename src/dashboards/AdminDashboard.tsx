import React, { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboardOverview } from '../components/admin/AdminDashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import { RestaurantManagement } from '../components/admin/RestaurantManagement';
import { DeliveryManagement } from '../components/admin/DeliveryManagement';
import { PlatformAnalytics } from '../components/admin/PlatformAnalytics';
import { DataManager } from '../components/admin/DataManager';
import { SystemSettings } from '../components/admin/SystemSettings';
import { PartnerRequestManagement } from '../components/admin/PartnerRequestManagement';

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardOverview onPageChange={setCurrentPage} />;
      case 'users':
        return <UserManagement />;
      case 'partner-requests':
        return <PartnerRequestManagement />;
      case 'restaurants':
        return <RestaurantManagement />;
      case 'deliveries':
        return <DeliveryManagement />;
      case 'analytics':
        return <PlatformAnalytics />;
      case 'data':
        return <DataManager />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminDashboardOverview onPageChange={setCurrentPage} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderCurrentPage()}
    </AdminLayout>
  );
};