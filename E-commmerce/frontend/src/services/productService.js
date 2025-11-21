import axios from 'axios';

// Use relative `/api` by default so CRA dev-server proxy works when no env is set
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const productService = {
  // Get products pending approval (admin only)
  getPendingProducts: async () => {
    try {
      console.log('=== CALLING productService.getPendingProducts() ===');
      
      const response = await api.get('/products/admin/pending');
      console.log('Pending products API response:', response);
      
      if (response.data.success) {
        const products = response.data.data.products || [];
        console.log('Pending products extracted from response:', products);
        console.log('Pending products count:', products.length);
        return products;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch pending products');
      }
    } catch (error) {
      console.error('Get pending products error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending products';
      throw new Error(errorMessage);
    }
  },

  // Approve product (admin only)
  approveProduct: async (productId) => {
    try {
      console.log('=== CALLING productService.approveProduct() ===');
      console.log('Product ID:', productId);
      
      const response = await api.post(`/products/${productId}/approve`);
      console.log('Approve product API response:', response);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to approve product');
      }
    } catch (error) {
      console.error('Approve product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve product';
      throw new Error(errorMessage);
    }
  },

  // Reject product (admin only)
  rejectProduct: async (productId, reason) => {
    try {
      console.log('=== CALLING productService.rejectProduct() ===');
      console.log('Product ID:', productId);
      console.log('Rejection reason:', reason);
      
      const response = await api.post(`/products/${productId}/reject`, {
        reason: reason
      });
      console.log('Reject product API response:', response);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to reject product');
      }
    } catch (error) {
      console.error('Reject product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reject product';
      throw new Error(errorMessage);
    }
  },

  // Get my products with approval status (seller)
  getMyProducts: async () => {
    try {
      console.log('=== CALLING productService.getMyProducts() ===');
      
      const response = await api.get('/products/my-products');
      console.log('My products API response:', response);
      
      if (response.data.success) {
        const products = response.data.data.products || [];
        console.log('My products extracted from response:', products);
        console.log('My products count:', products.length);
        return products;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch your products');
      }
    } catch (error) {
      console.error('Get my products error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch your products';
      throw new Error(errorMessage);
    }
  },

  // Get all products for admin
  getAllProducts: async () => {
    try {
      console.log('=== CALLING productService.getAllProducts() ===');
      
      // Debug token
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      console.log('Token length:', token ? token.length : 0);
      
      const response = await api.get('/products/admin');
      console.log('Products API response:', response);
      
      if (response.data.success) {
        const products = response.data.data.products || [];
        console.log('Products extracted from response:', products);
        console.log('Products count:', products.length);
        return products;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Get all products error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
      throw new Error(errorMessage);
    }
  },

  // Get single product by ID
  getProductById: async (productId) => {
    try {
      console.log('=== CALLING productService.getProductById() ===');
      console.log('Product ID:', productId);
      
      const response = await api.get(`/products/${productId}`);
      console.log('Product API response:', response);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch product');
      }
    } catch (error) {
      console.error('Get product by ID error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch product';
      throw new Error(errorMessage);
    }
  },

  // Get public products (for products page)
  getPublicProducts: async (filters = {}) => {
    try {
      console.log('=== CALLING productService.getPublicProducts() ===');
      console.log('Filters:', filters);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching from URL:', url);
      
      const response = await api.get(url);
      console.log('Public products API response:', response);
      
      if (response.data.success) {
        // Support both response shapes: { products } and { data: { products } }
        const products = response.data.products || response.data.data?.products || response.data.data || [];
        console.log('Public products extracted from response:', products);
        console.log('Public products count:', products.length);
        return products;
      } else {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Get public products error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
      throw new Error(errorMessage);
    }
  },

  // Get products by seller (for seller dashboard)
  getSellerProducts: async (sellerId) => {
    try {
      const response = await api.get(`/products/seller/${sellerId}`);
      
      if (response.data.success) {
        // Support both response shapes: { products } and { data: { products } }
        return response.data.products || response.data.data?.products || response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch seller products');
      }
    } catch (error) {
      console.error('Get seller products error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch seller products';
      throw new Error(errorMessage);
    }
  },

  // Create new product (for sellers)
  createProduct: async (productData) => {
    try {
      console.log('Creating product:', productData);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      formData.append('quantity', productData.quantity);
      formData.append('materials', productData.materials || '');
      formData.append('techniques', productData.techniques || '');
      formData.append('customizationOptions', productData.customizationOptions || '');
      
      // Add images if provided
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('Product created successfully:', response.data);
        return response.data.product;
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Create product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      throw new Error(errorMessage);
    }
  },

  // Update product (for sellers)
  updateProduct: async (productId, productData) => {
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      formData.append('quantity', productData.quantity);
      formData.append('materials', productData.materials || '');
      formData.append('techniques', productData.techniques || '');
      formData.append('customizationOptions', productData.customizationOptions || '');
      
      // Add new images if provided
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }
      
      const response = await api.put(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data.product;
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Update product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
      throw new Error(errorMessage);
    }
  },

  // Delete product (for sellers)
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
      throw new Error(errorMessage);
    }
  },

  // Get product categories
  getCategories: () => {
    return [
      'Home Decor',
      'Accessories',
      'Jewelry',
      'Clothing',
      'Art',
      'Furniture',
      'Kitchen & Dining',
      'Bath & Beauty',
      'Toys & Games',
      'Electronics',
      'Books',
      'Other'
    ];
  }
};

export default productService;
