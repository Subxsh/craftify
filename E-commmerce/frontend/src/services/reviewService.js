import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, page = 1, limit = 10, sortBy = 'recent') => {
    try {
      const response = await axios.get(`${API_URL}/reviews/product/${productId}`, {
        params: { page, limit, sortBy }
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending reviews for user
  getPendingReviews: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/user/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a review
  createReview: async (reviewData, token) => {
    try {
      const response = await axios.post(`${API_URL}/reviews`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData, token) => {
    try {
      const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a review
  deleteReview: async (reviewId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark review as unhelpful
  markUnhelpful: async (reviewId) => {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/unhelpful`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default reviewService;
