import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboardOverview } from '../components/admin/AdminDashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import { RestaurantManagement } from '../components/admin/RestaurantManagement';
import { ApprovedRestaurantManagement } from '../components/admin/ApprovedRestaurantManagement';
import { DeliveryManagement } from '../components/admin/DeliveryManagement';
import { PlatformAnalytics } from '../components/admin/PlatformAnalytics';
import { DataManager } from '../components/admin/DataManager';
import { SystemSettings } from '../components/admin/SystemSettings';
import { PartnerRequestManagement } from '../components/admin/PartnerRequestManagement';

import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isLoading } = useAuth();

  // Initialize dashboard after user is loaded
  useEffect(() => {
    if (!isLoading && user) {
      console.log('🎯 Admin dashboard initializing for user:', user.email);
      setIsInitialized(true);
    }
  }, [isLoading, user]);

  // Show loading state while initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dd3333]"></div>
          </div>
          <p className="text-gray-600 text-sm">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    try {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboardOverview onPageChange={setCurrentPage} />;
        case 'users':
          return <UserManagement />;
        case 'partner-requests':
          return <PartnerRequestManagement />;
        case 'restaurants':
          return <RestaurantManagement />;
        case 'approved-restaurants':
          return <ApprovedRestaurantManagement />;
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
    } catch (error) {
      console.error('❌ Error rendering admin page:', error);
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Page</h2>
          <p className="text-gray-600 mb-4">There was an error loading this page.</p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      );
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