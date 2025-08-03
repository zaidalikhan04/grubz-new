import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { AdminApprovalService } from '../../services/adminApproval';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CheckCircle, Clock, XCircle, User, Store, Truck } from 'lucide-react';

export const FlowTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      step,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testCompleteFlow = async () => {
    if (!currentUser) {
      addResult('Auth Check', 'error', 'No user logged in');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check user document structure
      addResult('User Check', 'info', 'Checking user document structure...');
      const userDoc = await getDoc(doc(db, 'users', currentUser.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        addResult('User Check', 'success', `User found with role: ${userData.role}`, userData);
      } else {
        addResult('User Check', 'error', 'User document not found');
      }

      // Test 2: Check for restaurant application
      addResult('Restaurant App', 'info', 'Checking restaurant application...');
      const restaurantAppDoc = await getDoc(doc(db, 'restaurantApplications', currentUser.id));
      if (restaurantAppDoc.exists()) {
        const appData = restaurantAppDoc.data();
        addResult('Restaurant App', 'success', `Restaurant application found with status: ${appData.status}`, appData);
      } else {
        addResult('Restaurant App', 'info', 'No restaurant application found');
      }

      // Test 3: Check for delivery application
      addResult('Delivery App', 'info', 'Checking delivery application...');
      const deliveryAppDoc = await getDoc(doc(db, 'deliveryApplications', currentUser.id));
      if (deliveryAppDoc.exists()) {
        const appData = deliveryAppDoc.data();
        addResult('Delivery App', 'success', `Delivery application found with status: ${appData.status}`, appData);
      } else {
        addResult('Delivery App', 'info', 'No delivery application found');
      }

      // Test 4: Check for restaurant data (if approved)
      addResult('Restaurant Data', 'info', 'Checking restaurant data...');
      const restaurantDoc = await getDoc(doc(db, 'restaurants', currentUser.id));
      if (restaurantDoc.exists()) {
        const restaurantData = restaurantDoc.data();
        addResult('Restaurant Data', 'success', `Restaurant data found: ${restaurantData.restaurantName}`, restaurantData);
      } else {
        addResult('Restaurant Data', 'info', 'No restaurant data found');
      }

      // Test 5: Check for driver data (if approved)
      addResult('Driver Data', 'info', 'Checking driver data...');
      const driverDoc = await getDoc(doc(db, 'drivers', currentUser.id));
      if (driverDoc.exists()) {
        const driverData = driverDoc.data();
        addResult('Driver Data', 'success', `Driver data found: ${driverData.fullName}`, driverData);
      } else {
        addResult('Driver Data', 'info', 'No driver data found');
      }

      addResult('Flow Test', 'success', 'Complete flow test finished successfully!');

    } catch (error) {
      addResult('Flow Test', 'error', `Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Flow Test Dashboard
          </CardTitle>
          <p className="text-gray-600">
            Test the complete user signup → application → approval flow
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current User</h3>
                <p className="text-sm text-gray-600">
                  {currentUser ? `${currentUser.name} (${currentUser.email}) - Role: ${currentUser.role}` : 'Not logged in'}
                </p>
              </div>
              <Button
                onClick={testCompleteFlow}
                disabled={isRunning || !currentUser}
                className="bg-[#dd3333] hover:bg-[#c52e2e]"
              >
                {isRunning ? 'Running Tests...' : 'Run Flow Test'}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Test Results</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.step}</span>
                            <span className="text-xs opacity-75">{result.timestamp}</span>
                          </div>
                          <p className="text-sm mt-1">{result.message}</p>
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer hover:underline">
                                View Data
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-black/5 rounded overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-blue-900">1. User Signup</h3>
              <p className="text-sm text-blue-700">
                User signs up → auto-login → data saved to users/{'{uid}'}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Store className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">2. Application</h3>
              <p className="text-sm text-yellow-700">
                Apply for partner role → data saved to applications/{'{uid}'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-green-900">3. Approval</h3>
              <p className="text-sm text-green-700">
                Admin approves → role updated → data moved to partners/{'{uid}'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
