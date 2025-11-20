import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS',
  SET_CART_FROM_BACKEND: 'SET_CART_FROM_BACKEND'
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product, quantity }];
      }
      
      return {
        ...state,
        items: newItems
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      const newItems = state.items.filter(item => item.product._id !== productId);
      
      return {
        ...state,
        items: newItems
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      }
      
      const newItems = state.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      );
      
      return {
        ...state,
        items: newItems
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    case CART_ACTIONS.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case CART_ACTIONS.CALCULATE_TOTALS: {
      const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      const totalPrice = state.items.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
      );

      return {
        ...state,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      };
    }

    case CART_ACTIONS.SET_CART_FROM_BACKEND: {
      return {
        ...state,
        items: action.payload
      };
    }

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, token, updateUser } = useAuth();

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (user && token) {
      fetchCartFromBackend();
    } else {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [user, token]);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: CART_ACTIONS.CALCULATE_TOTALS });
  }, [state.items]);

  // Save to localStorage whenever cart changes (fallback)
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

  // Fetch cart from backend
  const fetchCartFromBackend = async () => {
    try {
      const cart = await cartService.getCart();
      const backendItems = (cart?.items || []).map(item => ({
        product: item.product,
        quantity: item.quantity
      }));

      // Update state with backend cart (even if empty)
      dispatch({
        type: CART_ACTIONS.SET_CART_FROM_BACKEND,
        payload: backendItems
      });
    } catch (error) {
      console.error('Error fetching cart from backend:', error);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!user || !token) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      // Extract product ID - handle both product._id and product.id
      const productId = product._id || product.id;
      if (!productId) {
        throw new Error('Invalid product data: missing product ID');
      }

      // Use cartService which already uses the correct API base URL and token interceptor
      const cart = await cartService.addToCart(productId, quantity);

      // Update local state based on returned cart if available, otherwise fallback to local update
      if (cart && cart.items) {
        const items = cart.items.map(item => ({ product: item.product, quantity: item.quantity }));
        dispatch({ type: CART_ACTIONS.SET_CART_FROM_BACKEND, payload: items });
      } else {
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: { product, quantity }
        });
      }

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    if (item) {
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      toast.success(`${item.product.name} removed from cart!`);
    }
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { productId, quantity } 
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Cart cleared!');
  };

  // Toggle cart visibility
  const toggleCart = () => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART });
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return state.totalItems;
  };

  // Get cart total
  const getCartTotal = () => {
    return state.totalPrice;
  };

  // Buy now function
  const buyNow = async (product, quantity = 1) => {
    if (!user || !token) {
      toast.error('Please login to make purchases');
      return;
    }

    try {
      const items = [{ productId: product._id || product.id, quantity }];
      const result = await cartService.purchaseItems(items, {});
      if (result) {
        // Update user data in auth context if provided
        if (result.user) {
          updateUser(result.user);
        }
        toast.success('Product Purchased Successfully');
        return { success: true, order: result.order };
      }
      toast.error('Purchase failed');
      return { success: false, message: 'Purchase failed' };
    } catch (error) {
      console.error('Error making purchase:', error);
      toast.error(error.message || 'Purchase failed');
      return { success: false, message: error.message || 'Purchase failed' };
    }
  };

  // Buy from cart function
  const buyFromCart = async () => {
    if (!user || !token) {
      toast.error('Please login to make purchases');
      return;
    }

    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const items = state.items.map(item => ({
        productId: item.product._id || item.product.id,
        quantity: item.quantity
      }));

      const result = await cartService.purchaseItems(items, {});

      if (result) {
        // Update user data in auth context if provided
        if (result.user) {
          updateUser(result.user);
        }
        // Clear local cart
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        toast.success('Product Purchased Successfully');
        return { success: true, order: result.order };
      } else {
        toast.error('Purchase failed');
        return { success: false, message: 'Purchase failed' };
      }
    } catch (error) {
      console.error('Error making purchase:', error);
      toast.error(error.message || 'Purchase failed');
      return { success: false, message: error.message || 'Purchase failed' };
    }
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    getItemQuantity,
    isInCart,
    getCartItemCount,
    getCartTotal,
    buyNow,
    buyFromCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
