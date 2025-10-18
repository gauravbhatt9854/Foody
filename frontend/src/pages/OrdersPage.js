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
  CreditCard
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
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

  useEffect(() => {
    fetchOrders();

    // Listen for real-time order updates
    if (socket) {
      socket.on('orderStatusUpdated', (updatedOrder) => {
        // This will be handled by the useOrders hook
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
        return <Package className="h-5 w-5 text-indigo-500" />;
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
    const estimatedDelivery = new Date(orderTime.getTime() + 35 * 60000); // 35 minutes
    const now = new Date();

    if (estimatedDelivery <= now) {
      return 'Should arrive soon';
    }

    const diffMinutes = Math.ceil((estimatedDelivery - now) / 60000);
    return `${diffMinutes} minutes`;
  };

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

      {/* Empty State */}
      {orders.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start by placing your first order from our delicious menu!
          </p>
          <Button onClick={() => window.location.href = '/menu'}>
            Browse Menu
          </Button>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Order #{order._id.slice(-8)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
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
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        ETA: {getEstimatedTime(order)}
                      </span>
                    </div>
                    {order.status === 'preparing' && (
                      <div className="flex items-center text-orange-600">
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Being prepared...
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {selectedOrder === order._id && (
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Order Items
                        </h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.menuItem?.image || '/placeholder-food.jpg'}
                                  alt={item.menuItem?.name}
                                  className="w-12 h-12 object-cover rounded-md"
                                  onError={(e) => {
                                    e.target.src = '/placeholder-food.jpg';
                                  }}
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {item.menuItem?.name || 'Item'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Order Information
                        </h3>
                        <div className="space-y-4">
                          {/* Delivery Address */}
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Delivery Address
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.deliveryAddress}
                              </p>
                            </div>
                          </div>

                          {/* Order Date */}
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order Date
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(order.createdAt, true)}
                              </p>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="flex items-start space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Payment Method
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.paymentMethod === 'card' ? 'Credit/Debit Card' :
                                 order.paymentMethod === 'cash' ? 'Cash on Delivery' :
                                 order.paymentMethod === 'student_account' ? 'Student Account' :
                                 order.paymentMethod}
                              </p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.paymentStatus === 'paid' ? 'Paid' :
                                 order.paymentStatus === 'pending' ? 'Payment Pending' :
                                 'Payment Failed'}
                              </span>
                            </div>
                          </div>

                          {/* Special Instructions */}
                          {order.specialInstructions && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                Special Instructions
                              </p>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-200">
                                {order.specialInstructions}
                              </p>
                            </div>
                          )}

                          {/* Order Summary */}
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.totalAmount - (order.deliveryFee || 0) - (order.tax || 0))}</span>
                              </div>
                              {order.deliveryFee > 0 && (
                                <div className="flex justify-between">
                                  <span>Delivery Fee</span>
                                  <span>{formatCurrency(order.deliveryFee)}</span>
                                </div>
                              )}
                              {order.tax > 0 && (
                                <div className="flex justify-between">
                                  <span>Tax</span>
                                  <span>{formatCurrency(order.tax)}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} orders
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.currentPage ? 'primary' : 'outline'}
                      onClick={() => changePage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading overlay for pagination */}
      {isLoading && orders.length > 0 && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loading size="lg" />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;