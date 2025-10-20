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
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import Button from '../components/Button';
import Alert from '../components/Alert';
import FoodCard from '../components/FoodCard';
import Recommendations, { TopPicks } from '../components/Recommendations';
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

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {capitalize(category._id)} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters
          </Button>

          {/* Reset Filters */}
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPriceRange({ min: '', max: '' });
              resetFilters();
            }}
          >
            Reset
          </Button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.01"
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    updateFilters({ sortBy, sortOrder });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low to High</option>
                  <option value="price-desc">Price High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Menu Items Grid */}
      {menuItems.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No menu items found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item) => {
            const quantity = getItemQuantity(item._id);
            const dietaryBadges = getDietaryBadges(item);

            return (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
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

                {/* Content */}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Rating and Prep Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {item.rating || 0} ({item.reviewCount || 0})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.preparationTime}min
                    </span>
                  </div>

                  {/* Dietary Badges */}
                  {dietaryBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {dietaryBadges.map((badge) => (
                        <span
                          key={badge}
                          className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Availability and Actions */}
                  {!item.isAvailable ? (
                    <div className="text-center py-2">
                      <span className="text-red-600 font-medium">
                        Currently Unavailable
                      </span>
                    </div>
                  ) : isStudent() ? (
                    <div className="flex items-center justify-between">
                      {quantity === 0 ? (
                        <Button
                          onClick={() => handleAddToCart(item)}
                          fullWidth
                          leftIcon={<ShoppingCart className="h-4 w-4" />}
                        >
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item._id, quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-4 font-medium">
                            {quantity} in cart
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item._id, quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-green-600 font-medium">
                        Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => changePage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
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

      {/* Loading overlay for pagination */}
      {isLoading && menuItems.length > 0 && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loading size="lg" />
        </div>
      )}
    </div>
  );
};

export default MenuPage;