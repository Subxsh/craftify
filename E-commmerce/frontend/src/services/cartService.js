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

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      
      if (response.data?.success) {
        // Normalize different backend response shapes into a consistent cart object
        // Supported shapes:
        // - { success:true, cart: { items: [], totalItems, totalAmount } }
        // - { success:true, items: [...], totalItems, totalPrice }
        // - { success:true, data: { cart: ... } } or { success:true, data: { items: [...] } }
        const data = response.data;
        const cartFromCartProp = data.cart;
        const itemsFromTop = data.items || data.data?.items || data.data?.cart?.items;
        const totalItems = data.totalItems || data.totalItems === 0 ? data.totalItems : data.data?.totalItems || (cartFromCartProp && cartFromCartProp.totalItems);
        const totalAmount = data.totalAmount || data.totalPrice || data.data?.totalPrice || (cartFromCartProp && (cartFromCartProp.totalAmount || cartFromCartProp.totalPrice));

        const items = (cartFromCartProp && cartFromCartProp.items) || itemsFromTop || (data.data && (data.data.items || (data.data.cart && data.data.cart.items))) || [];

        return {
          items: items.map(item => {
            // if backend returns { product, quantity } or { product: {...}, quantity }
            if (item.product) return item;
            // if backend returns { productId, quantity } try to keep shape consistent
            if (item.productId) return { product: { _id: item.productId }, quantity: item.quantity };
            // fallback: assume item is already product-like
            return item;
          }),
          totalItems: typeof totalItems === 'number' ? totalItems : items.reduce((sum, it) => sum + (it.quantity || 0), 0),
          totalAmount: typeof totalAmount === 'number' ? parseFloat(totalAmount) : 0
        };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Get cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch cart';
      throw new Error(errorMessage);
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const payload = { productId, quantity };
      // Debug: log the resolved request URL and payload so devs can verify routing
      try {
        const base = api.defaults && api.defaults.baseURL ? api.defaults.baseURL : '';
        console.log(`CartService -> POST ${base.replace(/\/$/, '')}/cart/add`, payload);
      } catch (_) {
        console.log('CartService -> adding to cart', payload);
      }

      const response = await api.post('/cart/add', payload);
      
      if (response.data?.success) {
        console.log('Added to cart successfully:', response.data);
        // Normalize like getCart
        const data = response.data;
        const items = data.cart?.items || data.items || data.data?.items || [];
        const totalItems = data.totalItems || data.data?.totalItems || (items.reduce ? items.reduce((s, i) => s + (i.quantity || 0), 0) : 0);
        const totalAmount = data.totalAmount || data.totalPrice || data.data?.totalPrice || 0;

        return {
          items: items.map(item => item.product ? item : (item.productId ? { product: { _id: item.productId }, quantity: item.quantity } : item)),
          totalItems,
          totalAmount
        };
      } else {
        throw new Error(response.data?.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      throw new Error(errorMessage);
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      
      if (response.data?.success) {
        const data = response.data;
        const items = data.cart?.items || data.items || data.data?.items || [];
        const totalItems = data.totalItems || data.data?.totalItems || (items.reduce ? items.reduce((s, i) => s + (i.quantity || 0), 0) : 0);
        const totalAmount = data.totalAmount || data.totalPrice || data.data?.totalPrice || 0;

        return {
          items: items.map(item => item.product ? item : (item.productId ? { product: { _id: item.productId }, quantity: item.quantity } : item)),
          totalItems,
          totalAmount
        };
      } else {
        throw new Error(response.data?.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from cart';
      throw new Error(errorMessage);
    }
  },

  // Update item quantity in cart
  updateCartItem: async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        // Call the method on the service object explicitly
        return await cartService.removeFromCart(productId);
      }
      
      const response = await api.put('/cart/update', {
        productId,
        quantity
      });
      
      if (response.data?.success) {
        const data = response.data;
        const items = data.cart?.items || data.items || data.data?.items || [];
        const totalItems = data.totalItems || data.data?.totalItems || (items.reduce ? items.reduce((s, i) => s + (i.quantity || 0), 0) : 0);
        const totalAmount = data.totalAmount || data.totalPrice || data.data?.totalPrice || 0;

        return {
          items: items.map(item => item.product ? item : (item.productId ? { product: { _id: item.productId }, quantity: item.quantity } : item)),
          totalItems,
          totalAmount
        };
      } else {
        throw new Error(response.data?.message || 'Failed to update cart item');
      }
    } catch (error) {
      console.error('Update cart item error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
      throw new Error(errorMessage);
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      
      if (response.data?.success) {
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
      throw new Error(errorMessage);
    }
  },

  // Purchase items (checkout)
  purchaseItems: async (items, shippingAddress = {}) => {
    try {
      console.log('Processing purchase:', { items, shippingAddress });
      
      const response = await api.post('/purchase', {
        items,
        shippingAddress
      });
      
      if (response.data?.success) {
        console.log('Purchase successful:', response.data);
        const order = response.data.order || response.data.data?.order || response.data.data;
        const user = response.data.user;
        return { order, user };
      } else {
        throw new Error(response.data?.message || 'Failed to process purchase');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process purchase';
      throw new Error(errorMessage);
    }
  },

  // Get user's orders
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      
      if (response.data.success) {
        return response.data.orders;
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Get orders error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      throw new Error(errorMessage);
    }
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      
      if (response.data.success) {
        return response.data.order;
      } else {
        throw new Error(response.data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Get order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
      throw new Error(errorMessage);
    }
  }
};

export default cartService;
