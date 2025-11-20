const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, authorize, verifiedSeller, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for product image uploads to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/products/admin
// @desc    Get all products for admin (no filters)
// @access  Private (Admin only)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    }

    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerProfile.businessName sellerProfile.rating')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('sort').optional().isIn(['newest', 'oldest', 'price-low', 'price-high', 'rating', 'popular']).withMessage('Invalid sort option')
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      rating,
      search,
      tags,
      seller,
      featured,
      sort = 'newest'
    } = req.query;

    // Build filter object
    const filter = {
      status: 'active',
      isDeleted: false
    };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      filter['reviews.averageRating'] = { $gte: parseFloat(rating) };
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Seller filter
    if (seller) {
      filter.seller = seller;
    }

    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { 'reviews.averageRating': -1 };
        break;
      case 'popular':
        sortObj = { 'sales.totalSold': -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerProfile.businessName sellerProfile.rating')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products/seller/:sellerId
// @desc    Get products by seller
// @access  Public
router.get('/seller/:sellerId', optionalAuth, async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    }

    const products = await Product.find({
      seller: req.params.sellerId,
      status: 'active',
      isDeleted: false
    })
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerProfile.businessName sellerProfile.rating')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching seller products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: 'active',
      isDeleted: false
    })
    .populate('category', 'name slug description')
    .populate('seller', 'firstName lastName sellerProfile.businessName sellerProfile.rating sellerProfile.totalReviews')
    .populate({
      path: 'reviews',
      match: { isApproved: true },
      options: { sort: { createdAt: -1 }, limit: 5 },
      populate: {
        path: 'customer',
        select: 'firstName lastName avatar'
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Seller/Admin)
router.post('/', protect, upload.array('images', 10), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer')
], handleValidationErrors, async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Quantity value:', req.body.quantity);
    console.log('Quantity type:', typeof req.body.quantity);
    console.log('Files received:', req.files?.length || 0);
    // Find category by name
    const category = await Category.findOne({ 
      name: { $regex: new RegExp(`^${req.body.category}$`, 'i') } 
    });
    if (!category) {
      // If category doesn't exist, create it
      const newCategory = new Category({
        name: req.body.category,
        description: `${req.body.category} category for handmade products`
      });
      await newCategory.save();
      req.body.category = newCategory._id;
    } else {
      req.body.category = category._id;
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          public_id: file.filename, // Use the actual filename
          url: `/uploads/${file.filename}`, // Point to the actual uploaded file
          alt: `${req.body.name} image ${index + 1}`,
          isMain: index === 0
        });
      });
    } else {
      // If no files were uploaded, create a placeholder
      images.push({
        public_id: `placeholder_${Date.now()}_0`,
        url: `https://placehold.co/600x400?text=No+Image`,
        alt: `${req.body.name} placeholder`,
        isMain: true
      });
    }

    // Create product
    const productData = {
      ...req.body,
      seller: req.user._id,
      status: 'active',  // Set status to active by default so products appear in listings
      inventory: {
        quantity: parseInt(req.body.quantity),
        trackQuantity: true,
        lowStockThreshold: 5
      },
      images: images
    };
    
    // Remove the standalone quantity field since it's now in inventory
    delete productData.quantity;

    const product = new Product(productData);
    await product.save();

    // Populate the response
    await product.populate('category', 'name slug');
    await product.populate('seller', 'firstName lastName sellerProfile.businessName');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
  }
  
  // Pass error to next middleware
  next(error);
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Seller/Admin)
router.put('/:id', protect, upload.array('images', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user is authorized to update this product (seller or admin)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Process uploaded images if any
    let images = product.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        public_id: file.filename,
        url: `/uploads/${file.filename}`,
        alt: `${req.body.name || product.name} image ${images.length + index + 1}`,
        isMain: images.length + index === 0
      }));
      images = [...images, ...newImages];
    }
    
    // Handle category - if it's a string name, find the category ID
    let category = req.body.category || product.category;
    if (category && typeof category === 'string' && !mongoose.Types.ObjectId.isValid(category)) {
      // Try to find category by name
      const categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category}$`, 'i') },
        isActive: true 
      });
      if (categoryDoc) {
        category = categoryDoc._id;
      } else {
        // If category not found, keep the existing one
        category = product.category;
      }
    }
    
    // Update product fields
    const updateFields = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      price: req.body.price ? parseFloat(req.body.price) : product.price,
      category: category,
      'inventory.quantity': req.body.quantity ? parseInt(req.body.quantity) : product.inventory.quantity,
      'handmadeDetails.materials': req.body.materials ? req.body.materials.split(',').map(m => m.trim()) : product.handmadeDetails.materials,
      'handmadeDetails.techniques': req.body.techniques ? req.body.techniques.split(',').map(t => t.trim()) : product.handmadeDetails.techniques,
      'handmadeDetails.customizationOptions': req.body.customizationOptions || product.handmadeDetails.customizationOptions,
      images: images
    };
    
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerProfile.businessName');
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete - mark as deleted)
// @access  Private (Seller/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user is authorized to delete this product (seller or admin)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }
    
    // Soft delete - mark as deleted instead of removing from database
    product.isDeleted = true;
    product.status = 'inactive';  // Use 'inactive' instead of 'deleted'
    await product.save();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

module.exports = router;


























