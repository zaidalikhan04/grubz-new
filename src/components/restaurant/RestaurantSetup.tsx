import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService, MenuService } from '../../services/restaurant';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  Store, 
  MapPin, 
  Phone, 
  Mail,
  Loader2,
  ChefHat
} from 'lucide-react';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  preparationTime: string;
  ingredients: string;
  allergens: string;
  available: boolean;
}

export const RestaurantSetup: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Restaurant basic info
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    website: ''
  });

  // Operating hours
  const [hours, setHours] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '09:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  });

  // Initial menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      name: '',
      description: '',
      price: '',
      category: '',
      preparationTime: '',
      ingredients: '',
      allergens: '',
      available: true
    }
  ]);

  const handleRestaurantDataChange = (field: string, value: string) => {
    setRestaurantData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleMenuItemChange = (index: number, field: string, value: string | boolean) => {
    setMenuItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addMenuItem = () => {
    setMenuItems(prev => [...prev, {
      name: '',
      description: '',
      price: '',
      category: '',
      preparationTime: '',
      ingredients: '',
      allergens: '',
      available: true
    }]);
  };

  const removeMenuItem = (index: number) => {
    if (menuItems.length > 1) {
      setMenuItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(restaurantData.name && restaurantData.cuisine && restaurantData.address && restaurantData.phone);
      case 2:
        return true; // Hours are optional, defaults are provided
      case 3:
        return menuItems.some(item => item.name && item.description && item.price && item.category);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!currentUser || !validateStep(3)) {
      alert('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create restaurant
      const restaurant = await RestaurantService.createRestaurant({
        ownerId: currentUser.id,
        name: restaurantData.name,
        description: restaurantData.description,
        cuisine: restaurantData.cuisine,
        address: restaurantData.address,
        phone: restaurantData.phone,
        email: restaurantData.email,
        website: restaurantData.website,
        hours: hours
      });

      // 2. Create menu items
      const validMenuItems = menuItems.filter(item => 
        item.name && item.description && item.price && item.category
      );

      for (const item of validMenuItems) {
        await MenuService.createMenuItem({
          restaurantId: restaurant.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          category: item.category.toLowerCase(),
          preparationTime: item.preparationTime || '15-20 min',
          ingredients: item.ingredients.split(',').map(i => i.trim()).filter(i => i),
          allergens: item.allergens.split(',').map(a => a.trim()).filter(a => a),
          available: item.available,
          popular: false
        });
      }

      // 3. Update user profile
      await updateProfile({
        restaurantName: restaurantData.name,
        phone: restaurantData.phone,
        address: restaurantData.address
      });

      // 4. Update user document with restaurant info
      await updateDoc(doc(db, 'users', currentUser.id), {
        restaurantId: restaurant.id,
        restaurantName: restaurantData.name,
        hasRestaurant: true,
        updatedAt: new Date()
      });

      alert('Restaurant setup completed successfully!');
      // Refresh the page to show updated restaurant information
      window.location.reload();

    } catch (error) {
      console.error('Error setting up restaurant:', error);
      alert('Error setting up restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Restaurant Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              value={restaurantData.name}
              onChange={(e) => handleRestaurantDataChange('name', e.target.value)}
              placeholder="Enter restaurant name"
              required
            />
          </div>
          <div>
            <Label htmlFor="cuisine">Cuisine Type *</Label>
            <Input
              id="cuisine"
              value={restaurantData.cuisine}
              onChange={(e) => handleRestaurantDataChange('cuisine', e.target.value)}
              placeholder="e.g., Italian, Chinese, American"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={restaurantData.description}
            onChange={(e) => handleRestaurantDataChange('description', e.target.value)}
            placeholder="Brief description of your restaurant"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={restaurantData.address}
            onChange={(e) => handleRestaurantDataChange('address', e.target.value)}
            placeholder="Full restaurant address"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={restaurantData.phone}
              onChange={(e) => handleRestaurantDataChange('phone', e.target.value)}
              placeholder="Restaurant phone number"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={restaurantData.email}
              onChange={(e) => handleRestaurantDataChange('email', e.target.value)}
              placeholder="Restaurant email"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            value={restaurantData.website}
            onChange={(e) => handleRestaurantDataChange('website', e.target.value)}
            placeholder="https://your-restaurant.com"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(hours).map(([day, dayHours]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24">
                <Label className="capitalize">{day}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!dayHours.closed}
                  onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                />
                <span className="text-sm">Open</span>
              </div>
              
              {!dayHours.closed && (
                <>
                  <Input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <Input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="w-32"
                  />
                </>
              )}
              
              {dayHours.closed && (
                <span className="text-sm text-gray-500">Closed</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Restaurant</h1>
        <p className="text-gray-600">Complete the setup to start managing your restaurant</p>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-500">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Restaurant Info' :
              currentStep === 2 ? 'Operating Hours' : 'Menu Items'
            }
          </span>
        </div>
      </div>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Initial Menu Items
              </CardTitle>
              <p className="text-sm text-gray-600">Add some initial menu items to get started</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {menuItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Menu Item {index + 1}</h4>
                      {menuItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMenuItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Item Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                          placeholder="e.g., Margherita Pizza"
                        />
                      </div>
                      <div>
                        <Label>Price *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Input
                          value={item.category}
                          onChange={(e) => handleMenuItemChange(index, 'category', e.target.value)}
                          placeholder="e.g., pizza, salads, desserts"
                        />
                      </div>
                      <div>
                        <Label>Preparation Time</Label>
                        <Input
                          value={item.preparationTime}
                          onChange={(e) => handleMenuItemChange(index, 'preparationTime', e.target.value)}
                          placeholder="e.g., 15-20 min"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                        placeholder="Brief description of the item"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Ingredients (comma-separated)</Label>
                        <Input
                          value={item.ingredients}
                          onChange={(e) => handleMenuItemChange(index, 'ingredients', e.target.value)}
                          placeholder="e.g., tomatoes, mozzarella, basil"
                        />
                      </div>
                      <div>
                        <Label>Allergens (comma-separated)</Label>
                        <Input
                          value={item.allergens}
                          onChange={(e) => handleMenuItemChange(index, 'allergens', e.target.value)}
                          placeholder="e.g., gluten, dairy, nuts"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={(e) => handleMenuItemChange(index, 'available', e.target.checked)}
                      />
                      <Label>Available for ordering</Label>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMenuItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Menu Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !validateStep(3)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
