import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for fetching orders with filtering and pagination
 */
export const useOrders = (initialFilters = {}) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    orderType: '',
    startDate: '',
    endDate: '',
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isStaff } = useAuth();

  // Fetch orders
  const fetchOrders = async (newFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = { ...filters, ...newFilters };
      const response = await orderAPI.getOrders(params);
      
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Fetch orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch order statistics (for staff/admin)
  const fetchStats = async () => {
    if (!isStaff()) return;

    try {
      const response = await orderAPI.getOrderStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Fetch order stats error:', err);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchOrders(updatedFilters);
  };

  // Change page
  const changePage = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchOrders(updatedFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 20,
      status: '',
      orderType: '',
      startDate: '',
      endDate: '',
    };
    setFilters(defaultFilters);
    fetchOrders(defaultFilters);
  };

  // Refresh orders
  const refresh = () => {
    fetchOrders(filters);
    if (isStaff()) {
      fetchStats();
    }
  };

  // Update order status (for staff)
  const updateOrderStatus = async (orderId, statusData) => {
    try {
      await orderAPI.updateOrderStatus(orderId, statusData);
      refresh(); // Refresh the orders list
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      return { success: false, error: errorMessage };
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
    if (isStaff()) {
      fetchStats();
    }
  }, []); // Only run on mount

  return {
    orders,
    stats,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    changePage,
    resetFilters,
    refresh,
    updateOrderStatus,
  };
};