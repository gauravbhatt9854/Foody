import React from 'react';
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react';

const OrderTracking = ({ order }) => {
  const getStatusSteps = () => [
    {
      id: 'placed',
      label: 'Order Placed',
      description: 'Your order has been confirmed',
      icon: CheckCircle,
      time: order?.createdAt,
    },
    {
      id: 'preparing',
      label: 'Preparing',
      description: 'Your food is being prepared',
      icon: Package,
      time: order?.preparingAt,
    },
    {
      id: 'ready',
      label: 'Ready for Pickup',
      description: 'Your order is ready',
      icon: Clock,
      time: order?.readyAt,
    },
    {
      id: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'Your order is on the way',
      icon: Truck,
      time: order?.outForDeliveryAt,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Order has been delivered',
      icon: MapPin,
      time: order?.deliveredAt,
    },
  ];

  const getStepIndex = (status) => {
    const statusMap = {
      'pending': 0,
      'confirmed': 0,
      'preparing': 1,
      'ready': 2,
      'out_for_delivery': 3,
      'delivered': 4,
      'cancelled': -1,
    };
    return statusMap[status] ?? 0;
  };

  const currentStepIndex = getStepIndex(order?.status);
  const steps = getStatusSteps();

  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedTime = () => {
    if (order?.status === 'delivered') return null;
    
    const baseTime = new Date(order?.createdAt || Date.now());
    const estimatedDelivery = new Date(baseTime.getTime() + 30 * 60 * 1000); // 30 minutes
    
    return estimatedDelivery.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (order?.status === 'cancelled') {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Cancelled</h3>
          <p className="text-gray-600">
            Your order has been cancelled. If you have any questions, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
          {getEstimatedTime() && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Estimated Delivery</div>
              <div className="text-lg font-semibold text-primary-600">
                {getEstimatedTime()}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          Order #{order?._id?.slice(-8)} • {formatTime(order?.createdAt)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200">
          <div 
            className="bg-primary-600 w-full transition-all duration-1000 ease-out"
            style={{
              height: `${(currentStepIndex / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.id} className="relative flex items-start">
                {/* Step Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-primary-600 border-primary-600' 
                    : isCurrent 
                    ? 'bg-white border-primary-600 ring-4 ring-primary-100' 
                    : 'bg-white border-gray-300'
                  }
                `}>
                  <Icon className={`
                    w-6 h-6 transition-colors duration-300
                    ${isCompleted 
                      ? 'text-white' 
                      : isCurrent 
                      ? 'text-primary-600' 
                      : 'text-gray-400'
                    }
                  `} />
                </div>

                {/* Step Content */}
                <div className="ml-6 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      text-lg font-medium transition-colors duration-300
                      ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                    `}>
                      {step.label}
                    </h3>
                    {step.time && (
                      <span className="text-sm text-gray-500 ml-4">
                        {formatTime(step.time)}
                      </span>
                    )}
                  </div>
                  
                  <p className={`
                    text-sm mt-1 transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}
                  `}>
                    {step.description}
                  </p>

                  {isCurrent && (
                    <div className="mt-2 flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                      <span className="ml-2 text-sm text-primary-600 font-medium">
                        In Progress
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      {order?.status === 'out_for_delivery' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Truck className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-blue-900">
                Your order is on the way!
              </div>
              <div className="text-sm text-blue-700">
                The delivery person will contact you soon.
              </div>
            </div>
          </div>
        </div>
      )}

      {order?.status === 'ready' && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-green-900">
                Your order is ready for pickup!
              </div>
              <div className="text-sm text-green-700">
                Please collect your order from the cafeteria.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;