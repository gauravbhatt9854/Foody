import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Shield,
  Edit3,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { formatCurrency, formatDate } from '../utils/helpers';
import { analyticsAPI, userAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    overview: {
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      averageOrderValue: 0,
    },
    ordersByStatus: [],
    revenueByPeriod: [],
    popularItems: [],
    usersByRole: [],
  });

  // Users data
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    if (selectedTab === 'analytics') {
      fetchAnalytics();
    } else if (selectedTab === 'users') {
      fetchUsers();
    }
  }, [selectedTab]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await userAPI.getUsers({ page, limit: 10 });
      setUsers(response.data.users);
      setUsersPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch users data');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await userAPI.updateUser(userId, { role: newRole });
      fetchUsers(usersPagination.currentPage);
    } catch (err) {
      setError('Failed to update user role');
      console.error('Error updating user role:', err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.deleteUser(userId);
      fetchUsers(usersPagination.currentPage);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          System overview and user management
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'analytics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div>
          {isLoading ? (
            <Loading size="lg" text="Loading analytics..." />
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.overview.totalOrders.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(analytics.overview.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.overview.totalUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(analytics.overview.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Orders by Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Orders by Status</h3>
                    <PieChart className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {analytics.ordersByStatus.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            item._id === 'pending' ? 'bg-yellow-500' :
                            item._id === 'confirmed' ? 'bg-blue-500' :
                            item._id === 'preparing' ? 'bg-orange-500' :
                            item._id === 'ready' ? 'bg-purple-500' :
                            item._id === 'delivered' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-sm text-gray-600 capitalize">
                            {item._id.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users by Role */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {analytics.usersByRole.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            item._id === 'admin' ? 'bg-purple-500' :
                            item._id === 'staff' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Menu Items</h3>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Item</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Orders</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Revenue</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.popularItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3">
                            <div className="flex items-center">
                              <img
                                src={item.image || '/placeholder-food.jpg'}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-md mr-3"
                                onError={(e) => {
                                  e.target.src = '/placeholder-food.jpg';
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-900">{item.orderCount}</td>
                          <td className="py-3 text-sm text-gray-900">
                            {formatCurrency(item.totalRevenue)}
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {item.averageRating ? item.averageRating.toFixed(1) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Users Management Tab */}
      {selectedTab === 'users' && (
        <div>
          {/* Users Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export Users
              </Button>
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add User
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Loading size="lg" text="Loading users..." />
          ) : (
            <>
              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userItem) => (
                        <tr key={userItem._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {userItem.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {userItem.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(userItem.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <select
                                value={userItem.role}
                                onChange={(e) => updateUserRole(userItem._id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                disabled={userItem._id === user?._id}
                              >
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Edit3 className="h-3 w-3" />}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteUser(userItem._id)}
                                disabled={userItem._id === user?._id}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                leftIcon={<Trash2 className="h-3 w-3" />}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {usersPagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((usersPagination.currentPage - 1) * 10) + 1} to{' '}
                    {Math.min(usersPagination.currentPage * 10, usersPagination.totalItems)} of{' '}
                    {usersPagination.totalItems} users
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fetchUsers(usersPagination.currentPage - 1)}
                      disabled={usersPagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, usersPagination.totalPages) }, (_, i) => {
                      const pageNum = usersPagination.currentPage - 2 + i;
                      if (pageNum < 1 || pageNum > usersPagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === usersPagination.currentPage ? 'primary' : 'outline'}
                          onClick={() => fetchUsers(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      onClick={() => fetchUsers(usersPagination.currentPage + 1)}
                      disabled={usersPagination.currentPage === usersPagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;