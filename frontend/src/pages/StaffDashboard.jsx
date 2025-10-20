import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useMenu } from '../hooks/useMenu';
import { useSocket } from '../contexts/SocketContext.jsx';
import Button from '../components/Button.jsx';
import Loading from '../components/Loading.jsx';
import Alert from '../components/Alert.jsx';
import { formatCurrency, formatDate } from '../utils/helpers';

const StaffDashboard = () => {
  const { socket } = useSocket();
  const {
    orders: allOrders,
    isLoading: ordersLoading,
    error: ordersError,
    fetchOrders: fetchAllOrders,
    updateOrderStatus,
  } = useOrders();

  const {
    menuItems,
    isLoading: menuLoading,
    error: menuError,
    fetchMenuItems,
    toggleMenuItemAvailability,
  } = useMenu();

  const [selectedTab, setSelectedTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchAllOrders();
    fetchMenuItems();

    // Listen for real-time order updates
    if (socket) {
      socket.on('newOrder', (newOrder) => {
        fetchAllOrders(); // Refresh orders when new order comes in
      });

      socket.on('orderStatusUpdated', (updatedOrder) => {
        fetchAllOrders(); // Refresh orders when status is updated
      });

      return () => {
        socket.off('newOrder');
        socket.off('orderStatusUpdated');
      };
    }
  }, [socket, fetchAllOrders, fetchMenuItems]);

  const filteredOrders = allOrders.filter(order => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  });

  const orderCounts = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
    preparing: allOrders.filter(o => o.status === 'preparing').length,
    ready: allOrders.filter(o => o.status === 'ready').length,
    out_for_delivery: allOrders.filter(o => o.status === 'out_for_delivery').length,
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered',
    };
    return statusFlow[currentStatus];
  };

  const canUpdateStatus = (status) => {
    return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Staff Dashboard
        </h1>
        <p className="text-gray-600">
          Manage orders and menu items
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('orders')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders Management
            {orderCounts.pending > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {orderCounts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('menu')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'menu'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Menu Management
          </button>
        </nav>
      </div>

      {/* Orders Management Tab */}
      {selectedTab === 'orders' && (
        <div>
          {/* Order Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(orderCounts).map(([status, count]) => (
              <div
                key={status}
                onClick={() => setOrderFilter(status)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  orderFilter === status
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>

          {/* Order Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchAllOrders()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>

          {/* Error State */}
          {ordersError && (
            <div className="mb-6">
              <Alert type="error" message={ordersError} />
            </div>
          )}

          {/* Orders List */}
          {ordersLoading ? (
            <Loading size="lg" text="Loading orders..." />
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                No orders match the current filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.customer?.name} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}
                      >
                        {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                        leftIcon={<Eye className="h-4 w-4" />}
                      >
                        {selectedOrder === order._id ? 'Hide' : 'Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Order Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>{order.items.length} items</span>
                      <span>Payment: {order.paymentMethod}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    {canUpdateStatus(order.status) && (
                      <Button
                        onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                        disabled={isUpdatingStatus}
                        size="sm"
                        leftIcon={isUpdatingStatus ? <Loading size="sm" /> : <CheckCircle className="h-4 w-4" />}
                      >
                        {isUpdatingStatus ? 'Updating...' : `Mark as ${getNextStatus(order.status)?.replace('_', ' ')}`}
                      </Button>
                    )}
                  </div>

                  {/* Expanded Order Details */}
                  {selectedOrder === order._id && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                              >
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={item.menuItem?.image || '/placeholder-food.jpg'}
                                    alt={item.menuItem?.name}
                                    className="w-10 h-10 object-cover rounded-md"
                                    onError={(e) => {
                                      e.target.src = '/placeholder-food.jpg';
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.menuItem?.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer & Delivery Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Customer</p>
                              <p className="text-sm text-gray-600">
                                {order.customer?.name} ({order.customer?.email})
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                            </div>
                            {order.specialInstructions && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                                <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded-md">
                                  {order.specialInstructions}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status Update Actions */}
                          {canUpdateStatus(order.status) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
                              <div className="flex flex-wrap gap-2">
                                {['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status) => (
                                  <Button
                                    key={status}
                                    variant={order.status === status ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order._id, status)}
                                    disabled={isUpdatingStatus || order.status === status}
                                  >
                                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Button>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                  disabled={isUpdatingStatus}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Management Tab */}
      {selectedTab === 'menu' && (
        <div>
          {/* Menu Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Add New Item
            </Button>
          </div>

          {/* Error State */}
          {menuError && (
            <div className="mb-6">
              <Alert type="error" message={menuError} />
            </div>
          )}

          {/* Menu Items */}
          {menuLoading ? (
            <Loading size="lg" text="Loading menu items..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Item Image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={item.image || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-food.jpg';
                      }}
                    />
                  </div>

                  {/* Item Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        Category: {item.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit3 className="h-4 w-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                      <Button
                        variant={item.isAvailable ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => toggleMenuItemAvailability(item._id)}
                      >
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;