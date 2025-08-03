import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MenuItemImageUpload } from '../ui/ImageUpload';
import { RestaurantImageUpload } from './RestaurantImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ImageUploadService } from '../../services/imageUpload';
import { AlternativeImageUploadService } from '../../services/alternativeImageUpload';
import { RestaurantService } from '../../services/restaurant';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  Star,
  ChefHat,
  Utensils,
  Coffee,
  Loader2,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  calories?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export const MyRestaurant: React.FC = () => {
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnavailable, setShowUnavailable] = useState(true);

  // Form state for adding/editing menu items
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '', // Add imageUrl field
    preparationTime: '',
    ingredients: '',
    allergens: '',
    calories: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true
  });

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Default categories
  const defaultCategories: MenuCategory[] = [
    { id: 'appetizers', name: 'Appetizers', description: 'Start your meal right', displayOrder: 1, isActive: true },
    { id: 'mains', name: 'Main Courses', description: 'Our signature dishes', displayOrder: 2, isActive: true },
    { id: 'desserts', name: 'Desserts', description: 'Sweet endings', displayOrder: 3, isActive: true },
    { id: 'beverages', name: 'Beverages', description: 'Drinks and refreshments', displayOrder: 4, isActive: true },
    { id: 'sides', name: 'Sides', description: 'Perfect accompaniments', displayOrder: 5, isActive: true }
  ];

  useEffect(() => {
    if (!currentUser) return;

    console.log('🔄 Setting up restaurant and menu listeners for:', currentUser.id);
    setLoading(true);
    setCategories(defaultCategories);

    // Listen to restaurant data
    const restaurantRef = doc(db, 'restaurants', currentUser.id);
    const unsubscribeRestaurant = onSnapshot(
      restaurantRef,
      (doc) => {
        if (doc.exists()) {
          const restaurantData = { id: doc.id, ...doc.data() };
          console.log('🏪 Restaurant data loaded:', restaurantData);
          setRestaurant(restaurantData);
        } else {
          console.log('ℹ️ No restaurant data found');
          setRestaurant(null);
        }
      },
      (error) => {
        console.error('❌ Error loading restaurant data:', error);
      }
    );

    // Listen to menu items stored under restaurants/{uid}/menu subcollection
    const menuQuery = query(
      collection(db, 'restaurants', currentUser.id, 'menu')
    );

    const unsubscribeMenu = onSnapshot(
      menuQuery,
      (querySnapshot) => {
        console.log('📄 Menu items updated, count:', querySnapshot.size);
        const items: MenuItem[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Restaurant menu item document:', doc.id, data);

          const imageUrl = data.imageUrl || data.image || '';
          items.push({
            id: doc.id,
            name: data.name || data.title || '', // Handle both name and title fields
            description: data.description || '',
            price: data.price || 0,
            category: data.category || 'mains',
            image: imageUrl, // Set both fields to the same value
            imageUrl: imageUrl,
            isAvailable: data.isAvailable !== false && data.available !== false, // Handle both fields
            preparationTime: data.preparationTime || 15,
            ingredients: data.ingredients || [],
            allergens: data.allergens || [],
            isVegetarian: data.isVegetarian || false,
            isVegan: data.isVegan || false,
            isGlutenFree: data.isGlutenFree || false,
            calories: data.calories || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          });
        });

        console.log('🍽️ Loaded menu items:', items.length);
        setMenuItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error loading menu items:', error);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up restaurant and menu listeners');
      unsubscribeRestaurant();
      unsubscribeMenu();
    };
  }, [currentUser]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '', // Add imageUrl field
      preparationTime: '',
      ingredients: '',
      allergens: '',
      calories: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    });
    setIsAddingItem(false);
    setEditingItem(null);
  };

  // Handle image upload - Simple Base64 approach
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    setIsUploadingImage(true);
    try {
      // Convert image to base64 for immediate storage
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update form data immediately
      setFormData(prev => ({ ...prev, imageUrl: base64String }));

      console.log('✅ Menu item image converted to base64 successfully');
      return base64String;
    } catch (error) {
      console.error('❌ Error processing menu item image:', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image removal
  const handleImageRemove = async (): Promise<void> => {
    if (!formData.imageUrl) return;

    setIsUploadingImage(true);
    try {
      // For alternative upload service, we just remove the URL from form
      // (Base64 images are stored in Firestore, external services manage their own cleanup)

      // Update form data
      setFormData(prev => ({ ...prev, imageUrl: '' }));

      console.log('✅ Menu item image removed successfully');
    } catch (error) {
      console.error('❌ Error removing menu item image:', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle restaurant image update
  const handleRestaurantImageUpdate = (imageUrl: string | null) => {
    console.log('🏪 Restaurant image updated:', imageUrl);
    setRestaurant(prev => prev ? { ...prev, logoUrl: imageUrl } : null);
  };

  // Add new menu item
  const handleAddItem = async () => {
    console.log('🍽️ Adding menu item:', {
      currentUser: currentUser?.id,
      formData: formData,
      hasRequiredFields: !!(formData.name && formData.price && formData.category)
    });

    if (!currentUser || !formData.name || !formData.price || !formData.category) {
      console.error('❌ Missing required fields:', {
        currentUser: !!currentUser,
        name: formData.name,
        price: formData.price,
        category: formData.category
      });
      alert('Please fill in all required fields (name, price, category)');
      return;
    }

    try {
      const newItem = {
        name: formData.name, // Primary field name
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl || '',
        available: formData.isAvailable, // Add 'available' field for customer dashboard
        isAvailable: formData.isAvailable, // Keep 'isAvailable' for backward compatibility
        preparationTime: parseInt(formData.preparationTime) || 15,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(a => a),
        calories: parseInt(formData.calories) || 0,
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to restaurants/{uid}/menu subcollection
      console.log('💾 Saving menu item to:', `restaurants/${currentUser.id}/menu`);
      console.log('💾 Menu item data:', newItem);
      console.log('💾 Image URL in menu item:', newItem.imageUrl);

      const docRef = await addDoc(collection(db, 'restaurants', currentUser.id, 'menu'), newItem);
      console.log('✅ Menu item added successfully with ID:', docRef.id);

      // Verify the saved data
      const savedDoc = await getDoc(doc(db, 'restaurants', currentUser.id, 'menu', docRef.id));
      if (savedDoc.exists()) {
        console.log('✅ Verified saved menu item data:', savedDoc.data());
        console.log('✅ Verified imageUrl in saved data:', savedDoc.data()?.imageUrl);
      }

      resetForm();
    } catch (error) {
      console.error('❌ Error adding menu item:', error);
      console.error('❌ Error details:', error);
      alert(`Error adding menu item: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  // Edit menu item
  const handleEditItem = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '', // Add imageUrl field
      preparationTime: item.preparationTime.toString(),
      ingredients: item.ingredients?.join(', ') || '',
      allergens: item.allergens?.join(', ') || '',
      calories: item.calories?.toString() || '',
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isAvailable: item.isAvailable
    });
    setEditingItem(item);
    setIsAddingItem(true);
  };

  // Update menu item
  const handleUpdateItem = async () => {
    if (!editingItem || !formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedData = {
        name: formData.name, // Primary field name
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl || '',
        available: formData.isAvailable, // Add 'available' field for customer dashboard
        isAvailable: formData.isAvailable, // Keep 'isAvailable' for backward compatibility
        preparationTime: parseInt(formData.preparationTime) || 15,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(a => a),
        calories: parseInt(formData.calories) || 0,
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'restaurants', currentUser.id, 'menu', editingItem.id), updatedData);
      console.log('✅ Menu item updated successfully');
      resetForm();
    } catch (error) {
      console.error('❌ Error updating menu item:', error);
      alert('Error updating menu item. Please try again.');
    }
  };

  // Delete menu item
  const handleDeleteItem = async (itemId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await deleteDoc(doc(db, 'restaurants', currentUser.id, 'menu', itemId));
      console.log('✅ Menu item deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      alert('Error deleting menu item. Please try again.');
    }
  };

  // Toggle item availability
  const toggleAvailability = async (item: MenuItem) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'restaurants', currentUser.id, 'menu', item.id), {
        isAvailable: !item.isAvailable,
        updatedAt: new Date()
      });
      console.log('✅ Item availability updated');
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      alert('Error updating item availability.');
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesAvailability = showUnavailable || item.isAvailable;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#dd3333]" />
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-[#dd3333]" />
            Menu Management
          </h1>
          <p className="text-gray-600">Add, edit, and organize your restaurant's menu items</p>
        </div>
        <Button
          onClick={() => setIsAddingItem(true)}
          className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Restaurant Image Upload */}
      {restaurant && (
        <RestaurantImageUpload
          restaurantId={restaurant.id}
          currentImageUrl={restaurant.logoUrl}
          onImageUpdate={handleRestaurantImageUpdate}
        />
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {defaultCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowUnavailable(!showUnavailable)}
              className="flex items-center gap-2"
            >
              {showUnavailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showUnavailable ? 'Hide' : 'Show'} Unavailable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Utensils className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menuItems.filter(item => item.isAvailable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(menuItems.map(item => item.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Add/Edit Form Modal */}
      {isAddingItem && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {editingItem ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe this menu item"
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dish Photo
              </label>
              <div className="flex flex-col items-center space-y-4">
                <MenuItemImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageUpload={handleImageUpload}
                  onImageRemove={formData.imageUrl ? handleImageRemove : undefined}
                  disabled={isUploadingImage}
                />
                <p className="text-xs text-gray-500 text-center">
                  Upload a photo of your dish to make it more appealing to customers
                </p>
                {formData.imageUrl && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <span>✅</span>
                      <span>Image ready!</span>
                    </div>
                    <div className="w-20 h-20 border rounded overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {isUploadingImage && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <span>⏳</span>
                    <span>Processing image...</span>
                  </div>
                )}
              </div>

              {/* Alternative: Manual URL input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Or enter image URL manually
                </label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                    placeholder="15"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients (comma separated)
                </label>
                <Input
                  value={formData.ingredients}
                  onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  placeholder="tomato, cheese, basil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories (optional)
                </label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  placeholder="350"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens (comma separated)
              </label>
              <Input
                value={formData.allergens}
                onChange={(e) => handleInputChange('allergens', e.target.value)}
                placeholder="nuts, dairy, gluten"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => handleInputChange('isVegan', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Vegan</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isGlutenFree}
                  onChange={(e) => handleInputChange('isGlutenFree', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Gluten Free</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Available</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                disabled={isUploadingImage}
                className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isUploadingImage}
              >
                Cancel
              </Button>
            </div>

            {/* Debug info */}
            {formData.imageUrl && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <p><strong>Image URL:</strong> {formData.imageUrl.substring(0, 50)}...</p>
                <p><strong>Size:</strong> {Math.round(formData.imageUrl.length / 1024)}KB</p>
                <p><strong>Type:</strong> {formData.imageUrl.startsWith('data:') ? 'Base64' : 'URL'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Menu Items Display */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">
              {menuItems.length === 0
                ? "Start building your menu by adding your first item"
                : "Try adjusting your search or filters"
              }
            </p>
            <Button
              onClick={() => setIsAddingItem(true)}
              className="bg-[#dd3333] hover:bg-[#c52e2e]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {defaultCategories
            .filter(category => groupedItems[category.id]?.length > 0)
            .map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-[#dd3333]" />
                    {category.name}
                    <Badge variant="secondary" className="ml-2">
                      {groupedItems[category.id].length}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedItems[category.id].map(item => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 transition-all ${
                          item.isAvailable
                            ? 'border-gray-200 hover:border-[#dd3333] hover:shadow-md'
                            : 'border-gray-100 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 flex-1">{item.name}</h4>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAvailability(item)}
                              className="h-8 w-8 p-0"
                            >
                              {item.isAvailable ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        {/* Item Image */}
                        {item.imageUrl && (
                          <div className="mb-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-md"
                              onError={(e) => {
                                // Hide image if it fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-[#dd3333]">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime}min
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.isVegetarian && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Vegetarian
                            </Badge>
                          )}
                          {item.isVegan && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Vegan
                            </Badge>
                          )}
                          {item.isGlutenFree && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Gluten Free
                            </Badge>
                          )}
                        </div>

                        {item.ingredients && item.ingredients.length > 0 && (
                          <p className="text-xs text-gray-500 truncate">
                            Ingredients: {item.ingredients.join(', ')}
                          </p>
                        )}

                        {!item.isAvailable && (
                          <div className="mt-2 text-center">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Currently Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};
