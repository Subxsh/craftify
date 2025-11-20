import axios from 'axios';

// Use relative `/api` by default so CRA dev-server proxy works when no env is set
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

const orderService = {
  // Get all orders for admin
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders/admin');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Get all orders error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      throw new Error(errorMessage);
    }
  },
  
  // Get user orders
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Get user orders error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      throw new Error(errorMessage);
    }
  },
  
  // Get single order
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Get order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
      throw new Error(errorMessage);
    }
  },
  
  // Update order status (for admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order';
      throw new Error(errorMessage);
    }
  }
};

export default orderService;