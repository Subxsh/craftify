import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: JSON.parse(localStorage.getItem('wishlistItems')) || [],
  totalItems: 0
};

// Action types
const WISHLIST_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS',
  SET_WISHLIST_FROM_BACKEND: 'SET_WISHLIST_FROM_BACKEND'
};

// Reducer function
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.ADD_ITEM: {
      const product = action.payload;
      const existingItem = state.items.find(item => item._id === product._id);
      
      if (existingItem) {
        return state; // Already in wishlist
      }
      
      const newItems = [...state.items, product];
      
      return {
        ...state,
        items: newItems
      };
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      const newItems = state.items.filter(item => item._id !== productId);
      
      return {
        ...state,
        items: newItems
      };
    }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        items: [],
        totalItems: 0
      };

    case WISHLIST_ACTIONS.CALCULATE_TOTALS: {
      const totalItems = state.items.length;

      return {
        ...state,
        totalItems
      };
    }

    case WISHLIST_ACTIONS.SET_WISHLIST_FROM_BACKEND: {
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
const WishlistContext = createContext();

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { user, token } = useAuth();

  // Clear wishlist when user logs out
  useEffect(() => {
    if (!user || !token) {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
    }
  }, [user, token]);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: WISHLIST_ACTIONS.CALCULATE_TOTALS });
  }, [state.items]);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(state.items));
  }, [state.items]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    const existingItem = state.items.find(item => item._id === product._id);
    
    if (existingItem) {
      toast.info('Product already in wishlist');
      return;
    }
    
    dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: product });
    toast.success('Added to wishlist');
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: productId });
    toast.success('Removed from wishlist');
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  // Clear wishlist
  const clearWishlist = () => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
  };

  const value = {
    items: state.items,
    totalItems: state.totalItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    dispatch
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
