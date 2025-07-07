import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdminNotificationProvider } from './contexts/AdminNotificationContext';
import { AuthPage } from './pages/AuthPage';
import { PartnerSignupPage } from './pages/PartnerSignupPage';
import { DriverSignupPage } from './pages/DriverSignupPage';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { RestaurantDashboard } from './dashboards/RestaurantDashboard';
import { DeliveryDashboard } from './dashboards/DeliveryDashboard';
import { StitchDesign } from './screens/StitchDesign';
import { FirebaseTest } from './components/FirebaseTest';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Debug logging
  console.log('🔍 App state:', { user: user ? { email: user.email, role: user.role } : null, isLoading });

  if (isLoading) {
    console.log('🔄 App is in loading state...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <img src="/vector---0.svg" alt="Grubz logo" className="w-full h-full" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dd3333] mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <StitchDesign />} />
      <Route path="/auth" element={user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <AuthPage />} />
      <Route path="/partner-signup" element={<PartnerSignupPage />} />
      <Route path="/driver-signup" element={<DriverSignupPage />} />
      <Route path="/firebase-test" element={<FirebaseTest />} />

      {/* Role-specific routes */}
      {user && user.role === 'admin' && (
        <Route path="/admin/*" element={
          <AdminNotificationProvider>
            <AdminDashboard />
          </AdminNotificationProvider>
        } />
      )}
      {user && user.role === 'customer' && (
        <Route path="/dashboard" element={<CustomerDashboard />} />
      )}
      {user && user.role === 'restaurant_owner' && (
        <Route path="/restaurant/*" element={<RestaurantDashboard />} />
      )}
      {user && user.role === 'delivery_rider' && (
        <Route path="/delivery/*" element={
          <NotificationProvider>
            <DeliveryDashboard />
          </NotificationProvider>
        } />
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  function getDefaultRoute(role: string): string {
    const route = (() => {
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
    })();
    console.log(`🎯 getDefaultRoute(${role}) = ${route}`);
    return route;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};



export default App;