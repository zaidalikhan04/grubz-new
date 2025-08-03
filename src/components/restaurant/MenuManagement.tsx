import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { MenuService, MenuItem, RestaurantService } from '../../services/restaurant';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Grid,
  List,
  Save,
  X,
  Loader2
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparationTime: '',
    ingredients: '',
    allergens: '',
    available: true
  });

  // Load restaurant and menu items
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Get restaurant by owner ID
        const restaurant = await RestaurantService.getRestaurantByOwnerId(currentUser.id);
        if (restaurant) {
          setRestaurantId(restaurant.id);

          // Set up real-time listener for menu items
          const unsubscribe = MenuService.subscribeToMenuItems(restaurant.id, (items) => {
            setMenuItems(items);
            setLoading(false);
          });

          return () => unsubscribe();
        } else {
          console.log('No restaurant found for user');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [currentUser]);

  // Get unique categories from menu items
  const categories = React.useMemo(() => {
    const categoryMap = new Map();
    categoryMap.set('all', { id: 'all', name: 'All Items', count: menuItems.length });

    menuItems.forEach(item => {
      const existing = categoryMap.get(item.category);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(item.category, {
          id: item.category,
          name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          count: 1
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [menuItems]);

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      preparationTime: '',
      ingredients: '',
      allergens: '',
      available: true
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleAddItem = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime,
      ingredients: item.ingredients.join(', '),
      allergens: item.allergens.join(', '),
      available: item.available
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    try {
      const menuItemData = {
        restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category.toLowerCase(),
        preparationTime: formData.preparationTime,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(a => a),
        available: formData.available,
        popular: false
      };

      if (editingItem) {
        await MenuService.updateMenuItem(editingItem.id, menuItemData);
      } else {
        await MenuService.createMenuItem(menuItemData);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item. Please try again.');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await MenuService.updateMenuItem(item.id, { available: !item.available });
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Error updating item availability.');
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await MenuService.deleteMenuItem(item.id);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No restaurant found. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant's menu items and categories</p>
        </div>
        <Button
          onClick={handleAddItem}
          className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., pizza, salads, desserts"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preparationTime">Preparation Time</Label>
                  <Input
                    id="preparationTime"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: e.target.value }))}
                    placeholder="e.g., 15-20 min"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                <Input
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="e.g., tomatoes, mozzarella, basil"
                />
              </div>

              <div>
                <Label htmlFor="allergens">Allergens (comma-separated)</Label>
                <Input
                  id="allergens"
                  value={formData.allergens}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergens: e.target.value }))}
                  placeholder="e.g., gluten, dairy, nuts"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                />
                <Label htmlFor="available">Available for ordering</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap ${
                selectedCategory === category.id ? 'bg-[#704ce5] hover:bg-[#5a3bc4]' : ''
              }`}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-r-none ${viewMode === 'grid' ? 'bg-[#704ce5] hover:bg-[#5a3bc4]' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-l-none ${viewMode === 'list' ? 'bg-[#704ce5] hover:bg-[#5a3bc4]' : ''}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-6xl">
                    {item.image}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.popular && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Popular
                      </Badge>
                    )}
                    <Badge className={item.available ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="text-lg font-bold text-[#704ce5]">${item.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>⏱️ {item.preparationTime}</span>
                    <span>📂 {categories.find(c => c.id === item.category)?.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditItem(item)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(item)}
                      className="flex-1"
                    >
                      {item.available ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                      {item.available ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`${!item.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-lg font-bold text-[#704ce5]">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>⏱️ {item.preparationTime}</span>
                      <span>📂 {categories.find(c => c.id === item.category)?.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.popular && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Popular
                      </Badge>
                    )}
                    <Badge className={item.available ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAvailability(item)}
                      >
                        {item.available ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {menuItems.length === 0 ? 'No menu items yet' : 'No items match your search'}
            </h3>
            <p className="text-gray-500 mb-4">
              {menuItems.length === 0
                ? 'Start building your menu by adding your first item.'
                : 'Try adjusting your search or category filter.'
              }
            </p>
            {menuItems.length === 0 && (
              <Button onClick={handleAddItem} className="bg-[#704ce5] hover:bg-[#5a3bc4]">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
