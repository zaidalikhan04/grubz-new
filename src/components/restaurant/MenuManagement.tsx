import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Filter,
  Grid,
  List
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Items', count: 28 },
    { id: 'pizza', name: 'Pizza', count: 12 },
    { id: 'salads', name: 'Salads', count: 6 },
    { id: 'sides', name: 'Sides', count: 8 },
    { id: 'desserts', name: 'Desserts', count: 4 },
  ];

  const menuItems = [
    {
      id: 1,
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, basil, olive oil',
      price: 12.99,
      category: 'pizza',
      image: '🍕',
      available: true,
      popular: true,
      preparationTime: '15-20 min',
      ingredients: ['Tomatoes', 'Mozzarella', 'Basil', 'Olive Oil'],
      allergens: ['Gluten', 'Dairy']
    },
    {
      id: 2,
      name: 'Caesar Salad',
      description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
      price: 8.99,
      category: 'salads',
      image: '🥗',
      available: true,
      popular: false,
      preparationTime: '5-10 min',
      ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
      allergens: ['Gluten', 'Dairy', 'Eggs']
    },
    {
      id: 3,
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      price: 5.99,
      category: 'sides',
      image: '🍞',
      available: false,
      popular: true,
      preparationTime: '8-12 min',
      ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs'],
      allergens: ['Gluten', 'Dairy']
    },
    {
      id: 4,
      name: 'Pepperoni Pizza',
      description: 'Pepperoni, mozzarella, tomato sauce',
      price: 14.99,
      category: 'pizza',
      image: '🍕',
      available: true,
      popular: true,
      preparationTime: '15-20 min',
      ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce'],
      allergens: ['Gluten', 'Dairy']
    },
    {
      id: 5,
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with chocolate frosting',
      price: 6.99,
      category: 'desserts',
      image: '🍰',
      available: true,
      popular: false,
      preparationTime: '5 min',
      ingredients: ['Chocolate', 'Flour', 'Sugar', 'Eggs'],
      allergens: ['Gluten', 'Dairy', 'Eggs']
    },
    {
      id: 6,
      name: 'Greek Salad',
      description: 'Mixed greens, feta, olives, tomatoes, cucumber',
      price: 9.99,
      category: 'salads',
      image: '🥗',
      available: true,
      popular: false,
      preparationTime: '5-10 min',
      ingredients: ['Mixed Greens', 'Feta', 'Olives', 'Tomatoes', 'Cucumber'],
      allergens: ['Dairy']
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = (itemId: number) => {
    // In a real app, this would update the item in the backend
    console.log(`Toggling availability for item ${itemId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant's menu items and categories</p>
        </div>
        <Button className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

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
                    <span className="text-lg font-bold text-[#704ce5]">${item.price}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>⏱️ {item.preparationTime}</span>
                    <span>📂 {categories.find(c => c.id === item.category)?.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleAvailability(item.id)}
                      className="flex-1"
                    >
                      {item.available ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                      {item.available ? 'Hide' : 'Show'}
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
                      <span className="text-lg font-bold text-[#704ce5]">${item.price}</span>
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
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleAvailability(item.id)}
                      >
                        {item.available ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
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
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No menu items found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
