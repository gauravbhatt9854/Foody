import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
  Truck,
  Star,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useSocket } from '../contexts/SocketContext.jsx';
import Button from '../components/Button.jsx';
import Loading from '../components/Loading.jsx';
import Alert from '../components/Alert.jsx';
import OrderTracking from '../components/OrderTracking.jsx';
import { formatCurrency, formatDate } from '../utils/helpers';

const OrdersPage = () => {
  const location = useLocation();
  const { socket } = useSocket();
  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    pagination,
    changePage,
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();

    // Listen for real-time order updates
    if (socket) {
      socket.on('orderStatusUpdated', (updatedOrder) => {
        console.log('Order status updated:', updatedOrder);
      });

      return () => {
        socket.off('orderStatusUpdated');
      };
    }
  }, [socket, fetchOrders]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'preparing':
        return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case 'ready':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Being Prepared';
      case 'ready':
        return 'Ready for Pickup';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getEstimatedTime = (order) => {
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'cancelled') return 'Cancelled';

    const orderTime = new Date(order.createdAt);
    const estimatedDelivery = new Date(orderTime.getTime() + 35 * 60000);
    const now = new Date();

    if (estimatedDelivery <= now) {
      return 'Should arrive soon';
    }

    const diffMinutes = Math.ceil((estimatedDelivery - now) / 60000);
    return `${diffMinutes} minutes`;
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
    }
    return order.status === filterStatus;
  });

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'active', label: 'Active' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (selectedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Details
            </h2>

            {/* Order Info */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">#{selectedOrder._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium text-lg">₹{selectedOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={item.menuItem?.image || '/api/placeholder/60/60'}
                      alt={item.menuItem?.name}
                      className="w-15 h-15 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.menuItem?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">₹{item.quantity * item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
              <p className="text-gray-600">{selectedOrder.deliveryAddress}</p>
            </div>

            {/* Special Instructions */}
            {selectedOrder.specialInstructions && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Special Instructions</h3>
                <p className="text-gray-600">{selectedOrder.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Order Tracking */}
          <OrderTracking order={selectedOrder} />
        </div>
      </div>
    );
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Orders
        </h1>
        <p className="text-gray-600">
          Track your orders and view order history
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6">
          <Alert type="success" message={successMessage} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filterStatus === option.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
          </h2>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'all' 
              ? "Start by placing your first order from our delicious menu!"
              : `You don't have any ${filterStatus} orders at the moment.`
            }
          </p>
          {filterStatus === 'all' && (
            <Button
              onClick={() => window.location.href = '/menu'}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Browse Menu
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${getStatusColor(order.status)}
                        `}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Order #{order._id.slice(-8)}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Order Date</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Items</div>
                      <div className="font-medium text-gray-900">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className="font-medium text-gray-900">
                        ₹{order.totalAmount}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Estimated Time</div>
                      <div className="font-medium text-gray-900">
                        {getEstimatedTime(order)}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 min-w-fit">
                        <img
                          src={item.menuItem?.image || '/api/placeholder/40/40'}
                          alt={item.menuItem?.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {item.menuItem?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500 min-w-fit">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Active Order Progress */}
                  {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-primary-900">
                            {order.status === 'preparing' ? 'Being prepared in kitchen' :
                             order.status === 'ready' ? 'Ready for pickup' :
                             order.status === 'out_for_delivery' ? 'On the way to you' :
                             'Order confirmed'}
                          </span>
                        </div>
                        <div className="text-sm text-primary-700">
                          Track order
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator for additional items */}
          {isLoading && orders.length > 0 && (
            <div className="text-center py-8">
              <Loading text="Loading more orders..." />
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;