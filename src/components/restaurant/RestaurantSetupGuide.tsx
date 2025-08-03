import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, ArrowRight, Store, FileText, Clock, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createQuickTestRestaurant } from '../../utils/quickRestaurantSetup';

interface RestaurantSetupGuideProps {
  onNavigateToSetup?: () => void;
}

export const RestaurantSetupGuide: React.FC<RestaurantSetupGuideProps> = ({
  onNavigateToSetup
}) => {
  const { currentUser } = useAuth();
  const [isCreatingQuickSetup, setIsCreatingQuickSetup] = useState(false);
  const [quickSetupMessage, setQuickSetupMessage] = useState<string>('');

  const handleQuickSetup = async () => {
    if (!currentUser) return;

    setIsCreatingQuickSetup(true);
    setQuickSetupMessage('');

    try {
      await createQuickTestRestaurant(currentUser.id, currentUser.name || 'Test User');
      setQuickSetupMessage('✅ Quick test restaurant created! Refreshing page...');

      // Refresh the page to show the new restaurant
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error creating quick setup:', error);
      setQuickSetupMessage('❌ Failed to create test restaurant. Please try the manual setup.');
    } finally {
      setIsCreatingQuickSetup(false);
    }
  };
  const setupSteps = [
    {
      id: 1,
      title: 'Apply for Restaurant Owner Status',
      description: 'Submit your restaurant application through the partner signup form',
      icon: FileText,
      status: 'pending',
      action: 'Go to Partner Application',
      link: '/partner-signup'
    },
    {
      id: 2,
      title: 'Wait for Admin Approval',
      description: 'Admin will review your application and approve your restaurant',
      icon: Clock,
      status: 'waiting',
      action: 'Contact Admin',
      link: '/contact'
    },
    {
      id: 3,
      title: 'Set Up Your Restaurant',
      description: 'Complete your restaurant profile and add menu items',
      icon: Store,
      status: 'ready',
      action: 'Set Up Restaurant',
      link: '/restaurant/setup'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'waiting':
        return 'text-blue-600 bg-blue-100';
      case 'ready':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
      case 'waiting':
      case 'ready':
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Setup Required</h2>
        <p className="text-gray-600 mb-8">
          To view and manage orders, you need to set up your restaurant first. Follow these steps:
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {setupSteps.map((step, index) => {
            const StatusIcon = getStatusIcon(step.status);
            const isLast = index === setupSteps.length - 1;

            return (
              <div key={step.id} className="relative">
                <Card className="border-2 hover:border-gray-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${getStatusColor(step.status)}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              Step {step.id}: {step.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(step.status)}`}>
                            {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                          </div>
                          
                          <Button
                            onClick={() => {
                              if (step.link === '/restaurant/setup' && onNavigateToSetup) {
                                onNavigateToSetup();
                              } else {
                                window.location.href = step.link;
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {step.action}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Setup for Testing */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-1">Quick Setup for Testing</h4>
            <p className="text-yellow-800 text-sm mb-3">
              Skip the application process and create a test restaurant instantly for development and testing purposes.
            </p>
            <Button
              onClick={handleQuickSetup}
              disabled={isCreatingQuickSetup}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              size="sm"
            >
              {isCreatingQuickSetup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Test Restaurant...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Test Restaurant Now
                </>
              )}
            </Button>
            {quickSetupMessage && (
              <div className={`mt-2 text-sm ${
                quickSetupMessage.includes('✅') ? 'text-green-700' : 'text-red-700'
              }`}>
                {quickSetupMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Need Help?</h4>
            <p className="text-blue-800 text-sm">
              If you're having trouble with the setup process, please contact our support team or
              check the documentation for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
