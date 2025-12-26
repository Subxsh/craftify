const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    // Validate productId
    if (!productId || productId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    let sortOrder = { createdAt: -1 };
    if (sortBy === 'helpful') {
      sortOrder = { helpfulCount: -1, createdAt: -1 };
    } else if (sortBy === 'rating-high') {
      sortOrder = { rating: -1, createdAt: -1 };
    } else if (sortBy === 'rating-low') {
      sortOrder = { rating: 1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit) || 10, 100); // Cap limit at 100

    const reviews = await Review.find({
      product: productId,
      isApproved: true
    })
      .populate('user', 'firstName lastName')
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum)
      .maxTimeMS(5000); // 5 second timeout

    const total = await Review.countDocuments({
      product: productId,
      isApproved: true
    }).maxTimeMS(5000);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: parseInt(page),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Get reviews for a specific user's orders
router.get('/user/pending', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all delivered orders
    const orders = await Order.find({
      customer: userId,
      status: 'delivered'
    });

    const orderIds = orders.map(order => order._id);

    // Get products from those orders that the user hasn't reviewed yet
    const reviewedProducts = await Review.find({
      user: userId,
      order: { $in: orderIds }
    }).select('product');

    const reviewedProductIds = reviewedProducts.map(r => r.product.toString());

    const pendingReviews = [];

    for (const order of orders) {
      for (const item of order.items) {
        if (!reviewedProductIds.includes(item.product.toString())) {
          pendingReviews.push({
            order: order._id,
            product: item.product,
            productName: item.name,
            price: item.price
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: pendingReviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending reviews',
      error: error.message
    });
  }
});

// Create a review
router.post('/', protect, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId || !orderId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    // Check if product is in the order
    const itemInOrder = order.items.some(item => 
      item.product.toString() === productId
    );
    if (!itemInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await Review.create({
      product: productId,
      order: orderId,
      user: userId,
      rating,
      title,
      comment,
      images: images || []
    });

    await review.populate('user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// Update a review
router.put('/:reviewId', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this review'
      });
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// Delete a review
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this review'
      });
    }

    await Review.deleteOne({ _id: reviewId });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// Mark review as unhelpful
router.post('/:reviewId/unhelpful', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { unhelpfulCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

module.exports = router;
