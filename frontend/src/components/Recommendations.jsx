import React, { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodCard from './FoodCard.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const Recommendations = ({ currentItemId, category, title = "You may also like" }) => {
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, getItemQuantity, updateQuantity } = useCart();

  // Mock recommended items - in real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const fetchRecommendations = async () => {
      setIsLoading(true);
      
      // Mock data
      const mockRecommendations = [
        {
          _id: 'rec1',
          name: 'Chicken Tikka Masala',
          price: 189,
          originalPrice: 220,
          rating: 4.5,
          reviewCount: 67,
          image: '/api/placeholder/300/200',
          description: 'Tender chicken in creamy tomato sauce',
          prepTime: '20-25',
          isVegetarian: false,
          isSpicy: true,
          orderCount: 85,
          isAvailable: true,
          category: 'Meals'
        },
        {
          _id: 'rec2',
          name: 'Paneer Butter Masala',
          price: 159,
          rating: 4.3,
          reviewCount: 43,
          image: '/api/placeholder/300/200',
          description: 'Rich and creamy paneer curry',
          prepTime: '15-20',
          isVegetarian: true,
          orderCount: 92,
          isAvailable: true,
          category: 'Meals'
        },
        {
          _id: 'rec3',
          name: 'Masala Chai',
          price: 25,
          rating: 4.2,
          reviewCount: 156,
          image: '/api/placeholder/300/200',
          description: 'Traditional spiced Indian tea',
          prepTime: '5-10',
          isVegetarian: true,
          orderCount: 203,
          isAvailable: true,
          category: 'Beverages'
        },
        {
          _id: 'rec4',
          name: 'Veg Burger',
          price: 89,
          rating: 4.1,
          reviewCount: 78,
          image: '/api/placeholder/300/200',
          description: 'Grilled veggie patty with fresh toppings',
          prepTime: '12-15',
          isVegetarian: true,
          orderCount: 67,
          isAvailable: true,
          category: 'Snacks'
        }
      ];

      // Filter out current item and simulate category-based recommendations
      const filtered = mockRecommendations
        .filter(item => item._id !== currentItemId)
        .slice(0, 4);

      setTimeout(() => {
        setRecommendedItems(filtered);
        setIsLoading(false);
      }, 1000);
    };

    fetchRecommendations();
  }, [currentItemId, category]);

  const handleAddToCart = (item) => {
    addItem(item, 1);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedItems.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
          {title}
        </h2>
        <Link
          to="/menu"
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
        >
          View all <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedItems.map((item) => (
          <FoodCard
            key={item._id}
            item={item}
            quantity={getItemQuantity(item._id)}
            onAddToCart={handleAddToCart}
            onQuantityChange={handleQuantityChange}
            showQuickAdd={true}
          />
        ))}
      </div>
    </div>
  );
};

// Top Picks Component
export const TopPicks = () => {
  const [topItems, setTopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, getItemQuantity, updateQuantity } = useCart();

  useEffect(() => {
    // Mock top picks based on order count
    const fetchTopPicks = async () => {
      const mockTopPicks = [
        {
          _id: 'top1',
          name: 'Special Biryani',
          price: 149,
          rating: 4.6,
          reviewCount: 128,
          image: '/api/placeholder/300/200',
          description: 'Aromatic basmati rice with tender meat',
          prepTime: '25-30',
          orderCount: 256,
          isAvailable: true,
          isSpicy: true,
          category: 'Meals'
        },
        {
          _id: 'top2',
          name: 'Cheese Sandwich',
          price: 79,
          rating: 4.4,
          reviewCount: 89,
          image: '/api/placeholder/300/200',
          description: 'Grilled sandwich with melted cheese',
          prepTime: '10-12',
          orderCount: 187,
          isAvailable: true,
          isVegetarian: true,
          category: 'Snacks'
        },
        {
          _id: 'top3',
          name: 'Filter Coffee',
          price: 35,
          rating: 4.5,
          reviewCount: 234,
          image: '/api/placeholder/300/200',
          description: 'Traditional South Indian filter coffee',
          prepTime: '5-8',
          orderCount: 345,
          isAvailable: true,
          isVegetarian: true,
          category: 'Beverages'
        }
      ];

      setTimeout(() => {
        setTopItems(mockTopPicks);
        setIsLoading(false);
      }, 800);
    };

    fetchTopPicks();
  }, []);

  const handleAddToCart = (item) => {
    addItem(item, 1);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Top Picks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-500 fill-current" />
          Today's Top Picks
        </h2>
        <Link
          to="/menu?sort=popular"
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
        >
          View all <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topItems.map((item, index) => (
          <div key={item._id} className="relative">
            {/* Rank badge */}
            <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            
            <FoodCard
              item={item}
              quantity={getItemQuantity(item._id)}
              onAddToCart={handleAddToCart}
              onQuantityChange={handleQuantityChange}
              showQuickAdd={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;