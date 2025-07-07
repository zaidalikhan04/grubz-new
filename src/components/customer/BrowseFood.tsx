import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin,
  Plus,
  Heart,
  ShoppingCart
} from 'lucide-react';

export const BrowseFood: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});

  const categories = [
    { id: 'all', name: 'All Food', count: 45 },
    { id: 'pizza', name: 'Pizza', count: 12 },
    { id: 'burgers', name: 'Burgers', count: 8 },
    { id: 'asian', name: 'Asian', count: 10 },
    { id: 'desserts', name: 'Desserts', count: 6 },
    { id: 'healthy', name: 'Healthy', count: 9 }
  ];

  const restaurants = [
    {
      id: 1,
      name: "Mario's Italian Kitchen",
      cuisine: 'Italian',
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 2.99,
      distance: '1.2 km',
      image: '🍕',
      popular: true,
      items: [
        { id: 1, name: 'Margherita Pizza', price: 12.99, description: 'Fresh tomatoes, mozzarella, basil' },
        { id: 2, name: 'Pepperoni Pizza', price: 14.99, description: 'Pepperoni, mozzarella, tomato sauce' },
        { id: 3, name: 'Caesar Salad', price: 8.99, description: 'Romaine lettuce, parmesan, croutons' }
      ]
    },
    {
      id: 2,
      name: "Burger Palace",
      cuisine: 'American',
      rating: 4.6,
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      distance: '0.8 km',
      image: '🍔',
      popular: false,
      items: [
        { id: 4, name: 'Classic Burger', price: 9.99, description: 'Beef patty, lettuce, tomato, onion' },
        { id: 5, name: 'Cheese Burger', price: 11.99, description: 'Beef patty, cheese, lettuce, tomato' },
        { id: 6, name: 'Chicken Wings', price: 7.99, description: 'Crispy wings with buffalo sauce' }
      ]
    },
    {
      id: 3,
      name: "Sushi Express",
      cuisine: 'Japanese',
      rating: 4.9,
      deliveryTime: '30-40 min',
      deliveryFee: 3.99,
      distance: '2.1 km',
      image: '🍣',
      popular: true,
      items: [
        { id: 7, name: 'Salmon Roll', price: 8.99, description: 'Fresh salmon, avocado, cucumber' },
        { id: 8, name: 'Tuna Sashimi', price: 12.99, description: 'Fresh tuna slices' },
        { id: 9, name: 'Miso Soup', price: 3.99, description: 'Traditional miso soup with tofu' }
      ]
    }
  ];

  const addToCart = (itemId: number) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const getCartTotal = () => {
    let total = 0;
    let count = 0;
    restaurants.forEach(restaurant => {
      restaurant.items.forEach(item => {
        const quantity = cartItems[item.id] || 0;
        total += item.price * quantity;
        count += quantity;
      });
    });
    return { total, count };
  };

  const { total: cartTotal, count: cartCount } = getCartTotal();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Food</h1>
          <p className="text-gray-600">Discover delicious meals from local restaurants</p>
        </div>
        {cartCount > 0 && (
          <Button className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart ({cartCount}) - ${cartTotal.toFixed(2)}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search restaurants or dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={`whitespace-nowrap ${
              selectedCategory === category.id ? 'bg-[#dd3333] hover:bg-[#c52e2e]' : ''
            }`}
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Restaurants */}
      <div className="space-y-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-3xl">
                    {restaurant.image}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                      {restaurant.popular && (
                        <Badge className="bg-[#dd3333] text-white">Popular</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{restaurant.cuisine} cuisine</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance}</span>
                      </div>
                      <span>Delivery: ${restaurant.deliveryFee}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className="font-bold text-[#dd3333]">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      {cartItems[item.id] ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCartItems(prev => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                            }))}
                          >
                            -
                          </Button>
                          <span className="font-medium">{cartItems[item.id]}</span>
                          <Button
                            size="sm"
                            className="bg-[#dd3333] hover:bg-[#c52e2e]"
                            onClick={() => addToCart(item.id)}
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-1"
                          onClick={() => addToCart(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
