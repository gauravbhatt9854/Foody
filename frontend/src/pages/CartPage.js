import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Clock, 
  CreditCard,
  ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { formatCurrency } from '../utils/helpers';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const {
    items,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    deliveryAddress: user?.address || '',
    specialInstructions: '',
    paymentMethod: 'card',
  });
  const [errors, setErrors] = useState({});

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const validateOrder = () => {
    const newErrors = {};

    if (!orderDetails.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }

    if (!orderDetails.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateOrder()) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        items: items.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getTotalPrice(),
        deliveryAddress: orderDetails.deliveryAddress,
        specialInstructions: orderDetails.specialInstructions,
        paymentMethod: orderDetails.paymentMethod,
      };

      await createOrder(orderData);
      clearCart();
      navigate('/orders', { 
        state: { message: 'Order placed successfully!' } 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to place order. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some delicious items from our menu to get started!
          </p>
          <Button onClick={() => navigate('/menu')}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  const deliveryFee = getTotalPrice() >= 20 ? 0 : 2.99;
  const tax = getTotalPrice() * 0.08; // 8% tax
  const finalTotal = getTotalPrice() + deliveryFee + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/menu')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Continue Shopping
        </Button>
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/placeholder-food.jpg';
                      }}
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {item.description}
                      </p>
                      <p className="text-lg font-semibold text-primary-600 mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary and Checkout */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery Fee
                    {getTotalPrice() >= 20 && (
                      <span className="text-green-600 text-sm ml-1">(Free over $20)</span>
                    )}
                  </span>
                  <span className="font-medium">
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery Time */}
              <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Estimated delivery: 25-35 minutes
                </span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Details
              </h3>

              <div className="space-y-4">
                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Delivery Address
                  </label>
                  <textarea
                    value={orderDetails.deliveryAddress}
                    onChange={(e) => setOrderDetails(prev => ({
                      ...prev,
                      deliveryAddress: e.target.value
                    }))}
                    placeholder="Enter your delivery address..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                      errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.deliveryAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={orderDetails.specialInstructions}
                    onChange={(e) => setOrderDetails(prev => ({
                      ...prev,
                      specialInstructions: e.target.value
                    }))}
                    placeholder="Any special requests for your order..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Payment Method
                  </label>
                  <select
                    value={orderDetails.paymentMethod}
                    onChange={(e) => setOrderDetails(prev => ({
                      ...prev,
                      paymentMethod: e.target.value
                    }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                      errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="student_account">Student Account</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <Alert type="error" message={errors.submit} />
            )}

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              fullWidth
              size="lg"
              leftIcon={isSubmitting ? <Loading size="sm" /> : <ShoppingCart className="h-5 w-5" />}
            >
              {isSubmitting ? 'Placing Order...' : `Place Order - ${formatCurrency(finalTotal)}`}
            </Button>

            {/* Security Note */}
            <p className="text-xs text-gray-500 text-center">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;