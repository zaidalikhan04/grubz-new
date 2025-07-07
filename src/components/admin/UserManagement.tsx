import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
// import { Label } from '../ui/label';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  Car,
  Store,
  User,
  UserPlus,
  Filter
} from 'lucide-react';
import { UserService } from '../../services/database';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  joinDate?: string;
  lastActive?: string;
}

// Components
const UserTableRow: React.FC<{
  user: UserData;
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  isDeleting: boolean;
}> = ({ user, onEdit, onDelete, onSuspend, onActivate, isDeleting }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'restaurant_owner': return <Store className="h-4 w-4" />;
      case 'driver': return <Car className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'restaurant_owner': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {getRoleIcon(user.role)}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
            {user.phone && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role.replace('_', ' ')}
        </span>
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status || 'active'}
        </span>
      </td>
      <td className="p-3">
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
        </div>
      </td>
      <td className="p-3">
        <div className="text-sm text-gray-600">{user.lastActive || 'N/A'}</div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-3 w-3" />
          </Button>
          {user.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuspend(user.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Ban className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActivate(user.id)}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            {isDeleting ? (
              <span className="text-xs">Deleting...</span>
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
};

// Simple Edit Modal (placeholder - can be enhanced later)
const UserEditDialog: React.FC<{
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserData) => void;
}> = () => {
  // For now, just return null - edit functionality can be added later
  // This keeps the component structure clean and avoids unused parameter warnings
  return null;
};

// Main Component
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { addNotification } = useAdminNotifications();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // API Functions
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getAllUsers();
      setUsers(usersData as UserData[]);
    } catch (error) {
      console.error('Error loading users:', error);
      addNotification({
        type: 'system_alert',
        title: 'Error Loading Users',
        message: 'Failed to load users from database',
        priority: 'medium'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(userId);
      await UserService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      addNotification({
        type: 'user_report',
        title: 'User Deleted',
        message: 'User has been successfully deleted from the system',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Delete Failed',
        message: 'Failed to delete user from database',
        priority: 'medium'
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await UserService.updateUser(userId, { status: 'suspended' });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: 'suspended' } : user
      ));
      addNotification({
        type: 'user_report',
        title: 'User Suspended',
        message: 'User account has been suspended',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Suspend Failed',
        message: 'Failed to suspend user account',
        priority: 'medium'
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await UserService.updateUser(userId, { status: 'active' });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: 'active' } : user
      ));
      addNotification({
        type: 'user_report',
        title: 'User Activated',
        message: 'User account has been activated',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error activating user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Activation Failed',
        message: 'Failed to activate user account',
        priority: 'medium'
      });
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (updatedUser: UserData) => {
    try {
      await UserService.updateUser(updatedUser.id, updatedUser);
      setUsers(prev => prev.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      ));
      setIsEditDialogOpen(false);
      setEditingUser(null);
      addNotification({
        type: 'user_report',
        title: 'User Updated',
        message: 'User information has been successfully updated',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Update Failed',
        message: 'Failed to update user information',
        priority: 'medium'
      });
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>

          {/* Search and Filters */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Join Date</th>
                  <th className="text-left p-3 font-medium">Last Active</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onSuspend={handleSuspendUser}
                      onActivate={handleActivateUser}
                      isDeleting={deleting === user.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <UserEditDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManagement;
