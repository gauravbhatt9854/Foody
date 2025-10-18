import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Clock, Truck, Star, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const HomePage = () => {
  const { user, isStudent, isStaff, isAdmin } = useAuth();

  const features = [
    {
      icon: UtensilsCrossed,
      title: 'Fresh Food Daily',
      description: 'Enjoy freshly prepared meals from our college cafeteria.',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your order status from preparation to delivery.',
    },
    {
      icon: Truck,
      title: 'Quick Delivery',
      description: 'Fast pickup and delivery options available.',
    },
    {
      icon: Star,
      title: 'Quality Guaranteed',
      description: 'High-quality ingredients and preparation standards.',
    },
  ];

  const quickActions = () => {
    if (isStudent()) {
      return [
        { label: 'Browse Menu', href: '/menu', icon: UtensilsCrossed, color: 'bg-blue-600' },
        { label: 'My Orders', href: '/orders', icon: ShoppingCart, color: 'bg-green-600' },
        { label: 'Cart', href: '/cart', icon: ShoppingCart, color: 'bg-purple-600' },
      ];
    } else if (isStaff()) {
      return [
        { label: 'Staff Dashboard', href: '/staff', icon: TrendingUp, color: 'bg-blue-600' },
        { label: 'Manage Menu', href: '/staff/menu', icon: UtensilsCrossed, color: 'bg-green-600' },
        { label: 'Manage Orders', href: '/staff/orders', icon: ShoppingCart, color: 'bg-purple-600' },
      ];
    } else if (isAdmin()) {
      return [
        { label: 'Admin Dashboard', href: '/admin', icon: TrendingUp, color: 'bg-blue-600' },
        { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'bg-green-600' },
        { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp, color: 'bg-purple-600' },
      ];
    }
    return [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to{' '}
          <span className="text-primary-600">Foody</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Your favorite college cafeteria food, delivered fresh and fast. 
          Order online and enjoy delicious meals without the wait!
        </p>
        
        <div className="mt-8">
          <p className="text-lg text-gray-700">
            Hello, <span className="font-semibold text-primary-600">{user?.name}</span>!
          </p>
          <p className="text-sm text-gray-500 capitalize">
            Logged in as {user?.role}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions().map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {action.label}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Why Choose Foody?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      {isStudent() && (
        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Order?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse our delicious menu and place your order in just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as={Link} to="/menu" size="lg">
              <UtensilsCrossed className="w-5 h-5 mr-2" />
              Browse Menu
            </Button>
            <Button as={Link} to="/orders" variant="outline" size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Orders
            </Button>
          </div>
        </div>
      )}

      {/* Stats or Recent Activity (for staff/admin) */}
      {(isStaff() || isAdmin()) && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isAdmin() ? 'Admin Portal' : 'Staff Portal'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isAdmin() 
              ? 'Manage the entire system, view analytics, and oversee operations.'
              : 'Manage menu items, process orders, and serve customers efficiently.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              as={Link} 
              to={isAdmin() ? '/admin' : '/staff'} 
              size="lg"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              as={Link} 
              to={isAdmin() ? '/admin/analytics' : '/staff/orders'} 
              variant="outline" 
              size="lg"
            >
              {isAdmin() ? (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Analytics
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Manage Orders
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;