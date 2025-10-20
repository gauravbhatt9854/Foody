import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Heart,
  Clock,
  Flame,
  Award,
  ChevronDown,
  UtensilsCrossed
} from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import Loading from '../components/Loading.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import FoodCard from '../components/FoodCard.jsx';
import Recommendations, { TopPicks } from '../components/Recommendations.jsx';
import { formatCurrency, capitalize } from '../utils/helpers';

const MenuPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popular');
  const [favoriteItems, setFavoriteItems] = useState(new Set());
  
  const { isStudent } = useAuth();
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  
  const {
    menuItems,
    categories,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    changePage,
    resetFilters,
  } = useMenu();

  // Apply filters when search term or category changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({
        search: searchTerm,
        category: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy: sortBy,
      });
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const handleAddToCart = (menuItem) => {
    if (!isStudent()) return;
    addItem(menuItem, 1);
  };

  const handleQuantityChange = (menuItemId, newQuantity) => {
    if (!isStudent()) return;
    updateQuantity(menuItemId, newQuantity);
  };

  const toggleFavorite = (itemId) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavoriteItems(newFavorites);
  };

  if (isLoading && menuItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Loading delicious food..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Menu
        </h1>
        <p className="text-gray-600 text-lg">
          Discover delicious food from our college cafeteria
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        {/* Main Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes, cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === ''
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort and Additional Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {(searchTerm || selectedCategory || priceRange.min || priceRange.max) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange({ min: '', max: '' });
                resetFilters();
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Vegan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">4+ Stars</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">3+ Stars</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-8">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Show Top Picks when no search/filter is applied */}
      {!searchTerm && !selectedCategory && !priceRange.min && !priceRange.max && (
        <div className="mb-12">
          <TopPicks />
        </div>
      )}

      {/* Menu Items Grid */}
      {menuItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchTerm ? `Search results for "${searchTerm}"` : 
             selectedCategory ? `${selectedCategory}` : 
             'All Items'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {menuItems.map((item) => (
              <FoodCard
                key={item._id}
                item={item}
                quantity={isStudent() ? getItemQuantity(item._id) : 0}
                onAddToCart={handleAddToCart}
                onQuantityChange={handleQuantityChange}
                onToggleFavorite={toggleFavorite}
                isFavorite={favoriteItems.has(item._id)}
                showQuickAdd={isStudent()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator for additional items */}
      {isLoading && menuItems.length > 0 && (
        <div className="text-center py-8">
          <Loading text="Loading more items..." />
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

      {/* Empty state */}
      {!isLoading && menuItems.length === 0 && (
        <div className="text-center py-16">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPriceRange({ min: '', max: '' });
              resetFilters();
            }}
            variant="outline"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Recommendations */}
      {menuItems.length > 0 && (
        <div className="mt-16">
          <Recommendations 
            category={selectedCategory}
            title="Recommended for you"
          />
        </div>
      )}
    </div>
  );
};

export default MenuPage;