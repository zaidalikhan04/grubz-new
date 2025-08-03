import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Store,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  AlertTriangle,
  MoreVertical,
  Shield,
  ShieldOff
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  restaurantName?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  email: string;
  phone: string;
  address?: string;
  location?: string;
  cuisine: string;
  description?: string;
  status: 'active' | 'restricted' | 'suspended';
  isActive: boolean;
  rating?: number;
  totalOrders?: number;
  totalReviews?: number;
  createdAt: any;
  updatedAt?: any;
  lastActive?: any;
}

interface RestaurantOwner {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt: any;
  lastLoginAt?: any;
  restaurantId?: string;
}

export const ApprovedRestaurantManagement: React.FC = () => {
  const { addNotification } = useAdminNotifications();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantOwners, setRestaurantOwners] = useState<RestaurantOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debug function to check all restaurants
  const debugAllRestaurants = async () => {
    try {
      console.log('🔍 Admin Debug: Checking all restaurants in database...');

      // Check all restaurants
      const allRestaurantsQuery = query(collection(db, 'restaurants'));
      const snapshot = await getDocs(allRestaurantsQuery);

      console.log('🔍 Admin: Total restaurants in database:', snapshot.size);
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('🔍 Admin: Restaurant:', doc.id, {
          name: data.restaurantName || data.name,
          status: data.status,
          isActive: data.isActive,
          ownerId: data.ownerId,
          data: data
        });
      });

      // Check approved restaurants specifically
      const approvedQuery = query(collection(db, 'restaurants'), where('status', '==', 'approved'));
      const approvedSnapshot = await getDocs(approvedQuery);
      console.log('🔍 Admin: Approved restaurants:', approvedSnapshot.size);

    } catch (error) {
      console.error('🔍 Admin Debug error:', error);
    }
  };

  // Fetch approved restaurants and restaurant owners
  useEffect(() => {
    console.log('🔄 Setting up approved restaurants listeners');

    // Run debug function
    debugAllRestaurants();
    
    // Listen to approved restaurants (same query as customer dashboard)
    const restaurantsQuery = query(
      collection(db, 'restaurants'),
      where('status', '==', 'approved')
    );

    const unsubscribeRestaurants = onSnapshot(
      restaurantsQuery,
      (querySnapshot) => {
        console.log('📄 Admin: Approved restaurants updated, count:', querySnapshot.size);
        const restaurantsList: Restaurant[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🏪 Admin: Restaurant document:', doc.id, {
            name: data.name || data.restaurantName,
            status: data.status,
            isActive: data.isActive,
            ownerId: data.ownerId,
            data: data
          });

          restaurantsList.push({
            id: doc.id,
            name: data.name || data.restaurantName || '',
            restaurantName: data.restaurantName || data.name,
            ownerId: data.ownerId || doc.id,
            ownerName: data.ownerName || '',
            ownerEmail: data.ownerEmail || data.email,
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || data.location || '',
            location: data.location || data.address,
            cuisine: data.cuisine || '',
            description: data.description || '',
            status: data.status === 'restricted' ? 'restricted' : 'active',
            isActive: data.isActive !== false,
            rating: data.rating || 0,
            totalOrders: data.totalOrders || 0,
            totalReviews: data.totalReviews || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            lastActive: data.lastActive
          });
        });

        setRestaurants(restaurantsList);
        console.log('✅ Loaded approved restaurants:', restaurantsList.length);
      },
      (error) => {
        console.error('❌ Error fetching approved restaurants:', error);
        addNotification('Error loading restaurants', 'error');
      }
    );

    // Listen to restaurant owners
    const ownersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'restaurant_owner')
    );

    const unsubscribeOwners = onSnapshot(
      ownersQuery,
      (querySnapshot) => {
        console.log('📄 Restaurant owners updated, count:', querySnapshot.size);
        const ownersList: RestaurantOwner[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ownersList.push({
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            role: data.role,
            createdAt: data.createdAt,
            lastLoginAt: data.lastLoginAt,
            restaurantId: data.restaurantId
          });
        });

        setRestaurantOwners(ownersList);
        console.log('✅ Loaded restaurant owners:', ownersList.length);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error fetching restaurant owners:', error);
        addNotification('Error loading restaurant owners', 'error');
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up approved restaurants listeners');
      unsubscribeRestaurants();
      unsubscribeOwners();
    };
  }, [addNotification]);

  // Filter restaurants based on search and status
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || restaurant.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get owner info for a restaurant
  const getOwnerInfo = (ownerId: string) => {
    return restaurantOwners.find(owner => owner.id === ownerId);
  };

  // Toggle restaurant status (active/restricted)
  const handleToggleStatus = async (restaurant: Restaurant) => {
    try {
      const newStatus = restaurant.status === 'active' ? 'restricted' : 'active';
      const newIsActive = newStatus === 'active';

      await updateDoc(doc(db, 'restaurants', restaurant.id), {
        status: newStatus,
        isActive: newIsActive,
        updatedAt: new Date()
      });

      addNotification(
        `Restaurant ${newStatus === 'active' ? 'activated' : 'restricted'} successfully`,
        'success'
      );

      console.log(`✅ Restaurant ${restaurant.name} status changed to: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating restaurant status:', error);
      addNotification('Error updating restaurant status', 'error');
    }
  };

  // Update Burger Heaven category to main-courses
  const updateBurgerHeavenCategory = async () => {
    try {
      console.log('🔍 Searching for Burger Heaven restaurant...');

      // Find Burger Heaven in the current restaurants list
      const burgerHeaven = restaurants.find(restaurant =>
        (restaurant.name || restaurant.restaurantName || '').toLowerCase().includes('burger heaven')
      );

      if (!burgerHeaven) {
        addNotification('Burger Heaven restaurant not found', 'error');
        return;
      }

      console.log(`✅ Found Burger Heaven with ID: ${burgerHeaven.id}`);

      // Update the category to main-courses
      console.log('🔄 Updating Burger Heaven category to "main-courses"...');

      await updateDoc(doc(db, 'restaurants', burgerHeaven.id), {
        category: 'main-courses',
        updatedAt: new Date()
      });

      addNotification('Burger Heaven category updated to Main Courses successfully', 'success');
      console.log('✅ Successfully updated Burger Heaven category to "main-courses"');

    } catch (error) {
      console.error('❌ Error updating restaurant category:', error);
      addNotification('Error updating restaurant category', 'error');
    }
  };

  // Delete restaurant (with confirmation)
  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    if (!confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'restaurants', restaurant.id));
      addNotification('Restaurant deleted successfully', 'success');
      console.log(`✅ Restaurant ${restaurant.name} deleted`);
    } catch (error) {
      console.error('❌ Error deleting restaurant:', error);
      addNotification('Error deleting restaurant', 'error');
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'restricted' || !isActive) {
      return <Badge className="bg-red-100 text-red-800">Restricted</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading restaurants...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600">Manage approved restaurant owners and their restaurants</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {restaurants.length} Total Restaurants
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            {restaurants.filter(r => r.status === 'active').length} Active
          </Badge>
          <Badge className="bg-red-100 text-red-800">
            {restaurants.filter(r => r.status === 'restricted').length} Restricted
          </Badge>
          <Button
            onClick={updateBurgerHeavenCategory}
            className="bg-orange-600 hover:bg-orange-700 text-sm"
            size="sm"
          >
            Update Burger Heaven
          </Button>
          <Button
            onClick={debugAllRestaurants}
            className="bg-purple-600 hover:bg-purple-700 text-sm"
            size="sm"
          >
            Debug Database
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search restaurants, owners, or cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Approved Restaurants ({filteredRestaurants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'No approved restaurants available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Restaurant</th>
                    <th className="text-left p-3 font-medium">Owner</th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Rating</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.map((restaurant) => {
                    const owner = getOwnerInfo(restaurant.ownerId);
                    return (
                      <tr key={restaurant.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">{restaurant.name}</div>
                            <div className="text-sm text-gray-500">{restaurant.cuisine} cuisine</div>
                            {restaurant.address && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {restaurant.address}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {owner?.displayName || owner?.firstName + ' ' + owner?.lastName || restaurant.ownerName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {restaurant.ownerEmail || owner?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {restaurant.phone && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Phone className="h-3 w-3" />
                                {restaurant.phone}
                              </div>
                            )}
                            {restaurant.email && restaurant.email !== restaurant.ownerEmail && (
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <Mail className="h-3 w-3" />
                                {restaurant.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(restaurant.status, restaurant.isActive)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-sm text-gray-500">
                              ({restaurant.totalReviews || 0})
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-gray-600">
                            {formatDate(restaurant.createdAt)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {/* Toggle Status Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(restaurant)}
                              className={`${
                                restaurant.status === 'active'
                                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title={restaurant.status === 'active' ? 'Restrict Restaurant' : 'Activate Restaurant'}
                            >
                              {restaurant.status === 'active' ? (
                                <ShieldOff className="h-3 w-3" />
                              ) : (
                                <Shield className="h-3 w-3" />
                              )}
                            </Button>

                            {/* Edit Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRestaurant(restaurant);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit Restaurant Info"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRestaurant(restaurant)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Restaurant"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
