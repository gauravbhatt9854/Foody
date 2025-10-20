import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Clock, 
  Truck, 
  Star, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Search,
  ChevronRight,
  Pizza,
  Coffee,
  Cookie,
  Salad,
  Award,
  Heart,
  Timer
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const HomePage = () => {
  const { user, isStudent, isStaff, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { 
      name: 'Beverages', 
      icon: Coffee, 
      color: 'from-blue-400 to-blue-600',
      count: '15+ items',
      image: '/api/placeholder/200/150'
    },
    { 
      name: 'Snacks', 
      icon: Cookie, 
      color: 'from-yellow-400 to-orange-500',
      count: '25+ items',
      image: '/api/placeholder/200/150'
    },
    { 
      name: 'Meals', 
      icon: Pizza, 
      color: 'from-red-400 to-red-600',
      count: '30+ items',
      image: '/api/placeholder/200/150'
    },
    { 
      name: 'Desserts', 
      icon: Salad, 
      color: 'from-green-400 to-green-600',
      count: '12+ items',
      image: '/api/placeholder/200/150'
    },
  ];

  const featuredItems = [
    {
      id: 1,
      name: 'Special Chicken Biryani',
      price: 149,
      rating: 4.5,
      image: '/api/placeholder/300/200',
      tag: 'Popular',
      time: '25-30 mins',
      description: 'Aromatic basmati rice with tender chicken'
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      price: 199,
      rating: 4.3,
      image: '/api/placeholder/300/200',
      tag: 'Trending',
      time: '20-25 mins',
      description: 'Fresh tomatoes, mozzarella, and basil'
    },
    {
      id: 3,
      name: 'Masala Dosa',
      price: 89,
      rating: 4.6,
      image: '/api/placeholder/300/200',
      tag: 'Best Seller',
      time: '15-20 mins',
      description: 'Crispy dosa with spiced potato filling'
    },
  ];

  const stats = [
    { label: 'Happy Customers', value: '1000+', icon: Users },
    { label: 'Food Items', value: '80+', icon: UtensilsCrossed },
    { label: 'Avg Rating', value: '4.5', icon: Star },
    { label: 'Quick Delivery', value: '15min', icon: Clock },
  ];

  const quickActions = () => {
    if (isStudent()) {
      return [
        { label: 'Browse Menu', href: '/menu', icon: UtensilsCrossed, color: 'bg-primary-600' },
        { label: 'My Orders', href: '/orders', icon: ShoppingCart, color: 'bg-accent-600' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hungry? You're at the
              <span className="block text-yellow-300">right place</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto">
              Order from our college cafeteria and get fresh, delicious food delivered to your doorstep
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                />
                <Link
                  to={`/menu${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center">
              <p className="text-lg text-red-100">
                Welcome back, <span className="font-semibold text-yellow-300">{user?.name}</span>!
              </p>
              <p className="text-sm text-red-200 capitalize">
                {user?.role} account
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              What's on your mind?
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  to={`/menu?category=${category.name.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`h-32 bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <ChevronRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Items */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Today's Special
            </h2>
            <Link
              to="/menu"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Timer className="w-4 h-4 mr-1" />
                        {item.time}
                      </div>
                    </div>
                    
                    {isStudent() && (
                      <Button
                        size="sm"
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions().length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions().map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="block p-8 bg-white rounded-2xl shadow-card hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="ml-6">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {action.label}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors mt-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
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