import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MenuItemImageUpload } from '../ui/ImageUpload';
import { RestaurantService, MenuItem } from '../../services/restaurant';
import { ImageUploadService } from '../../services/imageUpload';
import { AlternativeImageUploadService } from '../../services/alternativeImageUpload';
import { Plus, Edit3, Save, X } from 'lucide-react';

interface MenuItemFormProps {
  restaurantId: string;
  item?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  restaurantId,
  item,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    category: item?.category || '',
    preparationTime: item?.preparationTime || '',
    ingredients: item?.ingredients?.join(', ') || '',
    allergens: item?.allergens?.join(', ') || '',
    available: item?.available ?? true,
    popular: item?.popular ?? false
  });
  
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
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

      setImageUrl(base64String);
      console.log('✅ Menu item image converted to base64 successfully');
      return base64String;
    } catch (error) {
      console.error('❌ Error processing menu item image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async (): Promise<void> => {
    if (!imageUrl) return;

    setIsUploading(true);
    try {
      // For alternative upload service, we just remove the URL
      // (Base64 images are stored in Firestore, external services manage their own cleanup)

      setImageUrl('');
      console.log('✅ Menu item image removed successfully');
    } catch (error) {
      console.error('❌ Error removing menu item image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const menuItemData = {
        ...formData,
        price: Number(formData.price),
        ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        allergens: formData.allergens.split(',').map(s => s.trim()).filter(Boolean),
        imageUrl,
        restaurantId
      };

      let savedItem: MenuItem;

      if (item?.id) {
        // Update existing item (imageUrl is already included in menuItemData)
        savedItem = await RestaurantService.updateMenuItem(restaurantId, item.id, menuItemData);
      } else {
        // Create new item (imageUrl is already included in menuItemData)
        savedItem = await RestaurantService.addMenuItem(restaurantId, menuItemData);
      }

      onSave({ ...savedItem, imageUrl });
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {item ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {item ? 'Edit Menu Item' : 'Add New Menu Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <MenuItemImageUpload
              currentImageUrl={imageUrl}
              onImageUpload={handleImageUpload}
              onImageRemove={imageUrl ? handleImageRemove : undefined}
              disabled={isUploading || isSaving}
            />
            <p className="text-xs text-gray-500 text-center">
              Upload a photo of your dish to make it more appealing to customers
            </p>
            {imageUrl && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span>✅</span>
                  <span>Image ready!</span>
                </div>
                <div className="w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Margherita Pizza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="appetizers">Appetizers</option>
                <option value="mains">Main Courses</option>
                <option value="desserts">Desserts</option>
                <option value="beverages">Beverages</option>
                <option value="sides">Sides</option>
                <option value="salads">Salads</option>
                <option value="soups">Soups</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Time
              </label>
              <input
                type="text"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 15-20 minutes"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your dish..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients (comma-separated)
              </label>
              <input
                type="text"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., tomato, mozzarella, basil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergens (comma-separated)
              </label>
              <input
                type="text"
                name="allergens"
                value={formData.allergens}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., dairy, gluten"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Available</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="popular"
                checked={formData.popular}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Popular Item</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {item ? 'Update Item' : 'Add Item'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving || isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
