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

const userService = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Get all users error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      throw new Error(errorMessage);
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'User not found');
      }
    } catch (error) {
      console.error('Get user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user';
      throw new Error(errorMessage);
    }
  },
  
  // Update user (Admin only)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      throw new Error(errorMessage);
    }
  },
  
  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      throw new Error(errorMessage);
    }
  }
};

export default userService;