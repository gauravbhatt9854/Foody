import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  UtensilsCrossed, 
  ShoppingCart, 
  ClipboardList, 
  User, 
  Settings,
  Users,
  BarChart3,
  LogOut,
  Bell,
  Search,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isStudent, isStaff, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
    ];

    if (isStudent()) {
      items.push(
        { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: totalItems > 0 ? totalItems : null },
        { name: 'My Orders', href: '/orders', icon: ClipboardList }
      );
    } else {
      items.push(
        { name: 'Orders', href: '/orders', icon: ClipboardList }
      );
    }

    if (isStaff()) {
      items.push(
        { name: 'Staff Dashboard', href: '/staff', icon: Settings },
        { name: 'Manage Menu', href: '/staff/menu', icon: UtensilsCrossed },
        { name: 'Manage Orders', href: '/staff/orders', icon: ClipboardList }
      );
    }

    if (isAdmin()) {
      items.push(
        { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
        { name: 'Manage Users', href: '/admin/users', icon: Users },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 }
      );
    }

    return items;
  };

  const navigation = getNavigationItems();

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - Zomato Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <Link to="/" className="flex items-center ml-2 lg:ml-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed className="h-6 w-6 text-white" />
                  </div>
                  <span className="ml-3 text-2xl font-bold text-gray-900">Foody</span>
                </div>
              </Link>
            </div>

            {/* Search Bar - Only on larger screens */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for food items..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Right side - User info and cart */}
            <div className="flex items-center space-x-4">
              {/* Location */}
              <div className="hidden lg:flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Campus</span>
              </div>

              {/* Cart - Only for students */}
              {isStudent() && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                <Bell className="h-6 w-6" />
              </button>

              {/* User Menu */}
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="ml-3 p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Foody</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isCurrentPath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-3 mb-1 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="py-6">
        {children}
      </main>

      {/* Mobile bottom navigation for students */}
      {isStudent() && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="grid grid-cols-4 h-16">
            {navigation.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentPath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex flex-col items-center justify-center space-y-1 relative
                    ${isActive ? 'text-primary-600' : 'text-gray-400'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 right-3 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;