import React, { useState } from 'react';
import { Star, Heart, Clock, Plus, Minus, Award, Flame } from 'lucide-react';
import Button from './Button';

const FoodCard = ({ 
  item, 
  onAddToCart, 
  onQuantityChange, 
  quantity = 0, 
  showQuickAdd = true,
  onToggleFavorite,
  isFavorite = false 
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const getDietaryBadges = () => {
    const badges = [];
    if (item.isVegetarian) badges.push({ label: 'Veg', color: 'bg-green-100 text-green-800', icon: '🌱' });
    if (item.isVegan) badges.push({ label: 'Vegan', color: 'bg-green-100 text-green-800', icon: '🌿' });
    if (item.isGlutenFree) badges.push({ label: 'Gluten-Free', color: 'bg-blue-100 text-blue-800', icon: '🌾' });
    if (item.isSpicy) badges.push({ label: 'Spicy', color: 'bg-red-100 text-red-800', icon: '🌶️' });
    return badges;
  };

  const getPopularityBadge = () => {
    if (item.orderCount > 100) return { label: 'Bestseller', color: 'bg-yellow-100 text-yellow-800', icon: Award };
    if (item.orderCount > 50) return { label: 'Popular', color: 'bg-orange-100 text-orange-800', icon: Flame };
    return null;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const badges = getDietaryBadges();
  const popularityBadge = getPopularityBadge();

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        <img
          src={item.image || '/api/placeholder/400/300'}
          alt={item.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
            setIsImageLoaded(true);
          }}
        />
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {popularityBadge && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${popularityBadge.color}`}>
              <popularityBadge.icon className="w-3 h-3 mr-1" />
              {popularityBadge.label}
            </div>
          )}
          
          {item.discount && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {item.discount}% OFF
            </div>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(item._id);
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Quick add button */}
        {showQuickAdd && quantity === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(item);
            }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}

        {/* Availability overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Rating and Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(item.rating || 4.0)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {(item.rating || 4.0).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({item.reviewCount || 0})
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{item.prepTime || '15-20'} mins</span>
          </div>
        </div>

        {/* Item name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {item.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.description || 'Delicious and freshly prepared with finest ingredients'}
        </p>

        {/* Dietary badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
              >
                <span className="mr-1">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Price and controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{item.price}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{item.originalPrice}
              </span>
            )}
          </div>

          {/* Quantity controls or Add button */}
          <div className="flex items-center">
            {quantity > 0 ? (
              <div className="flex items-center space-x-3 bg-primary-600 rounded-lg px-3 py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange?.(item._id, quantity - 1);
                  }}
                  className="text-white hover:text-primary-200 transition-colors"
                  disabled={!item.isAvailable}
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="text-white font-medium min-w-[20px] text-center">
                  {quantity}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange?.(item._id, quantity + 1);
                  }}
                  className="text-white hover:text-primary-200 transition-colors"
                  disabled={!item.isAvailable}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(item);
                }}
                disabled={!item.isAvailable}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {item.isAvailable ? 'Add' : 'Unavailable'}
              </Button>
            )}
          </div>
        </div>

        {/* Custom options indicator */}
        {item.hasCustomizations && (
          <div className="mt-3 text-xs text-primary-600 font-medium">
            Customizable options available
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCard;