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

const authService = {
  // Register new user - NO OFFLINE MODE
  register: async (userData) => {
    try {
      console.log('🔐 Attempting registration with backend:', userData.email);
      const response = await api.post('/auth/register', userData);
      
      console.log('📡 Backend response:', response.status, response.data);
      
      if (response.data && response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Registration successful');
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw new Error('Registration failed');
      }
    }
  },

  // Login user - NO OFFLINE MODE
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login with backend:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      console.log('📡 Backend response:', response.status, response.data);
      
      if (response.data && response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Login successful');
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      if (error.response) {
        // Backend responded with error
        throw new Error(error.response.data?.message || 'Invalid email or password');
      } else if (error.request) {
        // Network error
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw new Error('Login failed');
      }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/auth/me');
      
      if (response.data && response.data.success) {
        return response.data.user;
      } else {
        throw new Error(response.data?.message || 'Failed to get user data');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
