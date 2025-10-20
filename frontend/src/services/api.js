import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Menu endpoints
export const menuAPI = {
  getMenuItems: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/menu?${queryParams}`);
  },
  getMenuItem: (id) => api.get(`/menu/${id}`),
  createMenuItem: (itemData) => api.post('/menu', itemData),
  updateMenuItem: (id, itemData) => api.put(`/menu/${id}`, itemData),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.post(`/menu/${id}/toggle-availability`),
  getCategories: () => api.get('/menu/categories'),
};

// Order endpoints
export const orderAPI = {
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/orders?${queryParams}`);
  },
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  processPayment: (id, paymentData) => api.post(`/orders/${id}/payment`, paymentData),
  addReview: (id, reviewData) => api.post(`/orders/${id}/review`, reviewData),
  getOrderStats: () => api.get('/orders/stats/summary'),
};

// User management endpoints (Admin only)
export const userAPI = {
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/users?${queryParams}`);
  },
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  activateUser: (id) => api.post(`/users/${id}/activate`),
  resetPassword: (id, passwordData) => api.post(`/users/${id}/reset-password`, passwordData),
  getUserStats: () => api.get('/users/stats/summary'),
};

// Analytics endpoints (Admin only)
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/analytics/revenue?${queryParams}`);
  },
  getMenuPerformance: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/analytics/menu-performance?${queryParams}`);
  },
  getCustomerInsights: () => api.get('/analytics/customer-insights'),
  exportData: (type, params = {}) => {
    const queryParams = new URLSearchParams({ type, ...params }).toString();
    return api.get(`/analytics/export?${queryParams}`, { responseType: 'blob' });
  },
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
