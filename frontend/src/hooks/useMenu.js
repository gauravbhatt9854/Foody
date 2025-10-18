import { useState, useEffect } from 'react';
import { menuAPI } from '../services/api';

/**
 * Custom hook for fetching menu items with filtering and pagination
 */
export const useMenu = (initialFilters = {}) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: '',
    available: true,
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch menu items
  const fetchMenuItems = async (newFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = { ...filters, ...newFilters };
      const response = await menuAPI.getMenuItems(params);
      
      setMenuItems(response.data.menuItems);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
      console.error('Fetch menu items error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filters change
    setFilters(updatedFilters);
    fetchMenuItems(updatedFilters);
  };

  // Change page
  const changePage = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchMenuItems(updatedFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 20,
      category: '',
      available: true,
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(defaultFilters);
    fetchMenuItems(defaultFilters);
  };

  // Refresh menu items
  const refresh = () => {
    fetchMenuItems(filters);
  };

  // Initial load
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []); // Only run on mount

  return {
    menuItems,
    categories,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    changePage,
    resetFilters,
    refresh,
  };
};