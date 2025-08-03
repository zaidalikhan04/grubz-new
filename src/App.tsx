import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdminNotificationProvider } from './contexts/AdminNotificationContext';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { RestaurantDashboard } from './dashboards/RestaurantDashboard';
import { DeliveryDashboard } from './dashboards/DeliveryDashboard';
import { StitchDesign } from './screens/StitchDesign';
import { FirebaseTest } from './components/FirebaseTest';
import { CrudExample } from './components/CrudExample';
import { RestaurantOwnerApplication } from './components/applications/RestaurantOwnerApplication';
import { DeliveryDriverApplication } from './components/applications/DeliveryDriverApplication';
import { UserProfile } from './components/user/UserProfile';
import { FlowTest } from './components/test/FlowTest';
import { RestaurantApplicationForm } from './components/forms/RestaurantApplicationForm';
import { DeliveryApplicationForm } from './components/forms/DeliveryApplicationForm';
import { DatabaseTest } from './components/debug/DatabaseTest';
import { RestaurantDetails } from './components/customer/RestaurantDetails';
import { StorageTest } from './components/test/StorageTest';
import { RestaurantDashboardTest } from './components/test/RestaurantDashboardTest';
import { FirebaseDebugger } from './utils/firebaseDebug';


const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  console.log('🎯 AppContent render:', {
    loading,
    currentUser: currentUser?.email,
    role: currentUser?.role,
    hasUser: !!currentUser
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center transition-all duration-300">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <img src="/vector---0.svg" alt="Grubz logo" className="w-full h-full" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dd3333] mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to={getDefaultRoute(currentUser.role)} replace /> : <StitchDesign />} />
      <Route path="/auth" element={currentUser ? <Navigate to={getDefaultRoute(currentUser.role)} replace /> : <AuthPage />} />
      <Route path="/partner-signup" element={<Navigate to="/auth" replace />} />
      <Route path="/driver-signup" element={<Navigate to="/auth" replace />} />
      <Route path="/apply/restaurant" element={<RestaurantOwnerApplication />} />
      <Route path="/apply/delivery" element={<DeliveryDriverApplication />} />
      <Route path="/apply/restaurant-form" element={<RestaurantApplicationForm />} />
      <Route path="/apply/delivery-form" element={<DeliveryApplicationForm />} />
      <Route path="/firebase-test" element={<FirebaseTest />} />
      <Route path="/crud-example" element={<CrudExample />} />
      <Route path="/flow-test" element={<FlowTest />} />
      <Route path="/debug/database" element={<DatabaseTest />} />
      <Route path="/debug/storage" element={<StorageTest />} />
      <Route path="/debug/restaurant-dashboard" element={<RestaurantDashboardTest />} />
      <Route path="/debug" element={
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Current User:</strong> {currentUser ? currentUser.email : 'None'}</p>
            <p><strong>User Role:</strong> {currentUser?.role || 'None'}</p>
            <p><strong>User ID:</strong> {currentUser?.id || 'None'}</p>
            <p><strong>Current URL:</strong> {window.location.pathname}</p>
          </div>
          <div className="space-y-2">
            <a href="/auth" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Login Page
            </a>
            <a href="/firebase-test" className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Create Admin User (Firebase Test)
            </a>
            {currentUser && currentUser.role === 'admin' && (
              <a href="/admin" className="block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Go to Admin Dashboard
              </a>
            )}
            {currentUser && (
              <a href="/debug/image-upload" className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                🧪 Test Image Upload (Debug)
              </a>
            )}
            {currentUser && (
              <a href="/debug/database" className="block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                🗄️ Test Database Connection
              </a>
            )}
            {currentUser && (
              <a href="/debug/storage" className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                📁 Test Firebase Storage
              </a>
            )}
            {currentUser && currentUser.role === 'restaurant_owner' && (
              <a href="/debug/restaurant-dashboard" className="block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                🏪 Test Restaurant Dashboard
              </a>
            )}
          </div>
        </div>
      } />
      
      {/* User Profile Route - Protected by auth */}
      {currentUser && <Route path="/profile" element={<UserProfile />} />}



      {/* Role-specific routes */}
      {currentUser && currentUser.role === 'admin' && (
        <Route path="/admin/*" element={
          <AdminNotificationProvider>
            <AdminDashboard />
          </AdminNotificationProvider>
        } />
      )}
      {currentUser && currentUser.role === 'customer' && (
        <>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/restaurant/:restaurantId" element={<RestaurantDetails />} />
        </>
      )}
      {currentUser && currentUser.role === 'restaurant_owner' && (
        <Route path="/restaurant/*" element={<RestaurantDashboard />} />
      )}
      {currentUser && currentUser.role === 'delivery_rider' && (
        <Route path="/delivery/*" element={
          <NotificationProvider>
            <DeliveryDashboard />
          </NotificationProvider>
        } />
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const getDefaultRoute = (role: string): string => {
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