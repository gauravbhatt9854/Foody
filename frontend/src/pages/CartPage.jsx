import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Clock, 
  CreditCard,
  ArrowLeft,
  Bike,
  Star,
  ChevronRight,
  Gift,
  Tag,
  Utensils
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useOrders } from '../hooks/useOrders';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
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
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const deliveryFee = getTotalPrice() > 200 ? 0 : 20;
  const taxAmount = Math.round(getTotalPrice() * 0.05); // 5% tax
  const finalAmount = getTotalPrice() + deliveryFee + taxAmount - discount;

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

  const handleApplyPromo = () => {
    // Simple promo code logic
    if (promoCode.toLowerCase() === 'student10') {
      setDiscount(Math.round(getTotalPrice() * 0.1));
    } else if (promoCode.toLowerCase() === 'first20') {
      setDiscount(Math.round(getTotalPrice() * 0.2));
    } else {
      setErrors({ promo: 'Invalid promo code' });
    }
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
        totalAmount: finalAmount,
        deliveryAddress: orderDetails.deliveryAddress,
        specialInstructions: orderDetails.specialInstructions,
        paymentMethod: orderDetails.paymentMethod,
        promoCode: promoCode,
        discount: discount,
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
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. 
            Start by browsing our delicious menu!
          </p>
          <Button
            onClick={() => navigate('/menu')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
          >
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/menu')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600">{getTotalItems()} items in your cart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Utensils className="w-5 h-5 mr-2" />
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                  {/* Item Image */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.image || '/api/placeholder/100/100'}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm truncate">
                      {item.description || 'Delicious and fresh'}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.rating || '4.0'} • {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{item.price * item.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{item.price} each
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h2>
            
            <textarea
              placeholder="Enter your complete delivery address..."
              value={orderDetails.deliveryAddress}
              onChange={(e) => setOrderDetails({
                ...orderDetails,
                deliveryAddress: e.target.value
              })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            {errors.deliveryAddress && (
              <p className="mt-2 text-sm text-red-600">{errors.deliveryAddress}</p>
            )}
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Special Instructions
            </h2>
            
            <textarea
              placeholder="Any special requests? (e.g., extra spicy, no onions, etc.)"
              value={orderDetails.specialInstructions}
              onChange={(e) => setOrderDetails({
                ...orderDetails,
                specialInstructions: e.target.value
              })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Bill Details
            </h2>

            {/* Promo Code */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-500"
                />
                <button
                  onClick={handleApplyPromo}
                  className="text-primary-600 font-medium text-sm hover:text-primary-700"
                >
                  Apply
                </button>
              </div>
              {errors.promo && (
                <p className="mt-2 text-sm text-red-600">{errors.promo}</p>
              )}
            </div>

            {/* Bill Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span>₹{taxAmount}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-green-50 rounded-lg">
              <Bike className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800">
                  Estimated Delivery
                </div>
                <div className="text-sm text-green-600">25-30 minutes</div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={orderDetails.paymentMethod === 'card'}
                    onChange={(e) => setOrderDetails({
                      ...orderDetails,
                      paymentMethod: e.target.value
                    })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <CreditCard className="w-5 h-5 ml-3 text-gray-600" />
                  <span className="ml-3 text-gray-900">Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={orderDetails.paymentMethod === 'cash'}
                    onChange={(e) => setOrderDetails({
                      ...orderDetails,
                      paymentMethod: e.target.value
                    })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="w-5 h-5 ml-3 bg-green-100 rounded flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">₹</span>
                  </div>
                  <span className="ml-3 text-gray-900">Cash on Delivery</span>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6">
                <Alert type="error" message={errors.submit} />
              </div>
            )}

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg font-medium flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loading size="sm" />
                  <span className="ml-2">Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Free delivery message */}
            {getTotalPrice() < 200 && (
              <p className="text-sm text-gray-600 text-center mt-3">
                Add ₹{200 - getTotalPrice()} more for free delivery
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;