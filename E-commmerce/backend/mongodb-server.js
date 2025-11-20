const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
  console.log(`📍 Database: ${MONGODB_URI}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('⚠️ Falling back to in-memory storage for demo');
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'craftify_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Jewelry', 'Home Decor', 'Art & Prints', 'Clothing', 'Pottery', 'Woodwork', 'Textiles', 'Accessories', 'Toys & Games', 'Beauty & Personal Care']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  materials: [{
    type: String,
    trim: true
  }],
  techniques: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low stock threshold cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    type: String,
    trim: true
  },
  sales: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views count cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

// Cart Schema
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative']
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

// Order Schema (simplified for this implementation)
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  productSnapshot: {
    name: String,
    description: String,
    category: String,
    images: [{
      url: String,
      alt: String,
      isMain: Boolean
    }]
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  totalItems: {
    type: Number,
    required: [true, 'Total items is required'],
    min: [1, 'Total items must be at least 1']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'paid' // Simplified for demo
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

// Fallback in-memory storage if MongoDB fails
let fallbackUsers = [];
let fallbackCounter = 1;

// Request logging (optimized)
app.use((req, res, next) => {
  if (req.path !== '/api/health') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Craftify Backend API with MongoDB',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'MongoDB Disconnected',
    endpoints: [
      'GET /api/health',
      'GET /api/users',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const now = Date.now();
  if (!app.lastHealthLog || now - app.lastHealthLog > 30000) {
    let userCount = 0;
    try {
      userCount = mongoose.connection.readyState === 1 ? await User.countDocuments() : fallbackUsers.length;
    } catch (error) {
      userCount = fallbackUsers.length;
    }
    console.log(`🔍 Health check - Users: ${userCount}, DB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    app.lastHealthLog = now;
  }
  
  let usersCount = 0;
  try {
    usersCount = mongoose.connection.readyState === 1 ? await User.countDocuments() : fallbackUsers.length;
  } catch (error) {
    usersCount = fallbackUsers.length;
  }
  
  res.json({
    status: 'OK',
    message: 'Craftify Backend with MongoDB!',
    timestamp: new Date().toISOString(),
    usersCount,
    serverUptime: Math.floor(process.uptime()),
    port: 5000,
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'MongoDB Disconnected',
    storageType: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory'
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('\n🔥 REGISTRATION REQUEST RECEIVED');
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  
  const { firstName, lastName, email, password, role } = req.body;
  
  try {
    // Validation
    if (!firstName || firstName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'First name must be at least 2 characters'
      });
    }
    
    if (!lastName || lastName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Last name must be at least 2 characters'
      });
    }
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Try MongoDB first, fallback to in-memory
    if (mongoose.connection.readyState === 1) {
      console.log('💾 Using MongoDB storage');
      
      // Check if user exists in MongoDB
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }
      
      // Create user in MongoDB
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        role: role || 'buyer'
      });
      
      await user.save();
      console.log('✅ User saved to MongoDB:', user._id);
      
      // Generate token
      const token = user.generateAuthToken();
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      const totalUsers = await User.countDocuments();
      console.log('📊 Total users in MongoDB:', totalUsers);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        token,
        user: userResponse,
        debug: {
          usersCount: totalUsers,
          storageType: 'mongodb',
          userId: user._id
        }
      });
      
    } else {
      console.log('⚠️ MongoDB not available, using fallback storage');
      
      // Check if user exists in fallback
      const existingUser = fallbackUsers.find(user => user.email === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }
      
      // Hash password manually for fallback
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user in fallback storage
      const user = {
        _id: fallbackCounter++,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'buyer',
        isActive: true,
        createdAt: new Date()
      };
      
      fallbackUsers.push(user);
      console.log('✅ User saved to fallback storage');
      
      // Generate token
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          role: user.role
        },
        'craftify_secret_key',
        { expiresIn: '7d' }
      );
      
      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;
      
      console.log('📊 Total users in fallback:', fallbackUsers.length);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        token,
        user: userResponse,
        debug: {
          usersCount: fallbackUsers.length,
          storageType: 'fallback',
          userId: user._id
        }
      });
    }
    
    console.log('🎉 REGISTRATION COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('\n🔐 LOGIN REQUEST RECEIVED');
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Try MongoDB first, fallback to in-memory
    if (mongoose.connection.readyState === 1) {
      console.log('💾 Using MongoDB for login');

      // Find user in MongoDB
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        console.log('❌ User not found in MongoDB');
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      console.log('✅ Login successful for MongoDB user:', user.email);

      // Generate token
      const token = user.generateAuthToken();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: userResponse
      });

    } else {
      console.log('⚠️ MongoDB not available, using fallback storage');

      // Find user in fallback storage
      const user = fallbackUsers.find(user => user.email === email.toLowerCase());

      if (!user) {
        console.log('❌ User not found in fallback storage');
        console.log('📊 Available users:', fallbackUsers.map(u => u.email));
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare password for fallback user
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log('❌ Invalid password for fallback user:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      console.log('✅ Login successful for fallback user:', user.email);

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role
        },
        'craftify_secret_key',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: userResponse
      });
    }

    console.log('🎉 LOGIN COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
});

// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'craftify_secret_key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    // Get user from database
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } else {
      // Fallback storage
      const user = fallbackUsers.find(user => user._id === decoded.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found'
        });
      }

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        success: true,
        user: userResponse
      });
    }

  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all users endpoint
app.get('/api/users', async (req, res) => {
  console.log('\n📋 USERS LIST REQUESTED');
  
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().select('-password');
      console.log('📊 MongoDB users count:', users.length);
      
      res.json({
        success: true,
        users,
        count: users.length,
        message: users.length === 0 ? 'No users in MongoDB yet' : `Found ${users.length} users in MongoDB`,
        storageType: 'mongodb'
      });
    } else {
      const users = fallbackUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      console.log('📊 Fallback users count:', users.length);
      
      res.json({
        success: true,
        users,
        count: users.length,
        message: users.length === 0 ? 'No users in fallback storage yet' : `Found ${users.length} users in fallback storage`,
        storageType: 'fallback'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
  
  console.log('📋 USERS LIST SENT\n');
});

// Get single user by ID (for seller profiles)
app.get('/api/users/:userId', async (req, res) => {
  console.log('\n👤 GET USER BY ID REQUEST');
  console.log('User ID:', req.params.userId);

  try {
    const userId = req.params.userId;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ User found:', user.email);

      res.json({
        success: true,
        user
      });
    } else {
      // Fallback storage
      const user = fallbackUsers.find(user => user._id.toString() === userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });
    }

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }

  console.log('👤 USER DATA SENT\n');
});

// Middleware to verify JWT token and get user
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'craftify_secret_key');

    // Get user from database
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      req.user = user;
    } else {
      // Fallback storage
      const user = fallbackUsers.find(user => user._id === decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
};

// Create product endpoint with image upload
app.post('/api/products', authenticateToken, upload.array('images', 5), async (req, res) => {
  console.log('\n🛍️ CREATE PRODUCT REQUEST');
  console.log('👤 Seller:', req.user.firstName, req.user.lastName);
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📸 Uploaded files:', req.files?.length || 0);

  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can create products'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          url: `/uploads/${file.filename}`,
          alt: req.body.name || 'Product image',
          isMain: index === 0 // First image is main
        });
      });
    }

    // Parse arrays from form data
    const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const materials = req.body.materials ? req.body.materials.split(',').map(material => material.trim()).filter(material => material) : [];
    const techniques = req.body.techniques ? req.body.techniques.split(',').map(technique => technique.trim()).filter(technique => technique) : [];

    const productData = {
      name: req.body.name,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      price: parseFloat(req.body.price),
      comparePrice: req.body.comparePrice ? parseFloat(req.body.comparePrice) : undefined,
      category: req.body.category,
      tags,
      materials,
      techniques,
      images,
      seller: req.user._id,
      inventory: {
        quantity: parseInt(req.body['inventory.quantity']) || 0,
        trackQuantity: req.body['inventory.trackQuantity'] !== 'false',
        lowStockThreshold: parseInt(req.body['inventory.lowStockThreshold']) || 5
      },
      customizationOptions: req.body.customizationOptions,
      status: 'active'
    };

    if (mongoose.connection.readyState === 1) {
      const product = new Product(productData);
      await product.save();

      await product.populate('seller', 'firstName lastName businessName email');

      console.log('✅ Product saved to MongoDB:', product._id);
      console.log('📊 Product details:', {
        name: product.name,
        price: product.price,
        category: product.category,
        images: product.images.length
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully!',
        product
      });
    } else {
      // Fallback storage
      const product = {
        _id: Date.now(),
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('✅ Product saved to fallback storage');

      res.status(201).json({
        success: true,
        message: 'Product created successfully!',
        product
      });
    }

    console.log('🎉 PRODUCT CREATION COMPLETED\n');

  } catch (error) {
    console.error('❌ Product creation error:', error);

    // Clean up uploaded files if product creation failed
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product: ' + error.message
    });
  }
});

// Get products by seller
app.get('/api/products/seller/:sellerId', async (req, res) => {
  console.log('\n📦 GET SELLER PRODUCTS REQUEST');
  console.log('Seller ID:', req.params.sellerId);

  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({
        seller: req.params.sellerId,
        status: { $ne: 'archived' }
      }).populate('seller', 'firstName lastName businessName');

      console.log('📊 Found products:', products.length);

      res.json({
        success: true,
        products,
        count: products.length
      });
    } else {
      // Fallback - return empty array
      res.json({
        success: true,
        products: [],
        count: 0,
        message: 'Using fallback storage'
      });
    }

  } catch (error) {
    console.error('❌ Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }

  console.log('📦 SELLER PRODUCTS SENT\n');
});

// Get single product by ID
app.get('/api/products/:productId', async (req, res) => {
  console.log('\n📦 GET SINGLE PRODUCT REQUEST');
  console.log('Product ID:', req.params.productId);

  try {
    const productId = req.params.productId;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId)
        .populate('seller', 'firstName lastName businessName email')
        .exec();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      console.log('✅ Product found:', product.name);

      res.json({
        success: true,
        product
      });
    } else {
      // Fallback - return mock product
      res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }

  console.log('📦 SINGLE PRODUCT SENT\n');
});

// Get all products (public)
app.get('/api/products', async (req, res) => {
  console.log('\n🛍️ GET ALL PRODUCTS REQUEST');

  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { status: 'active' };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (mongoose.connection.readyState === 1) {
      const products = await Product.find(filter)
        .populate('seller', 'firstName lastName businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(filter);

      console.log('📊 Found products:', products.length, 'of', total);

      res.json({
        success: true,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      });
    } else {
      // Fallback - return mock products
      const mockProducts = [
        {
          _id: '1',
          name: 'Handmade Ceramic Vase',
          price: 45.99,
          category: 'Home Decor',
          seller: { firstName: 'Maria', lastName: 'Rodriguez', businessName: 'Maria\'s Ceramics' },
          images: [{ url: '🏺', alt: 'Ceramic Vase', isMain: true }]
        }
      ];

      res.json({
        success: true,
        products: mockProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProducts: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }

  console.log('🛍️ PRODUCTS LIST SENT\n');
});

// Delete product endpoint
app.delete('/api/products/:productId', authenticateToken, async (req, res) => {
  console.log('\n🗑️ DELETE PRODUCT REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);
  console.log('📦 Product ID:', req.params.productId);

  try {
    const productId = req.params.productId;

    if (mongoose.connection.readyState === 1) {
      // Find the product first to check ownership and get image paths
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user owns this product
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own products'
        });
      }

      // Delete associated image files
      if (product.images && product.images.length > 0) {
        product.images.forEach(image => {
          const imagePath = path.join(__dirname, image.url);
          fs.unlink(imagePath, (err) => {
            if (err) console.error('Error deleting image file:', err);
            else console.log('✅ Deleted image file:', image.url);
          });
        });
      }

      // Delete the product from database
      await Product.findByIdAndDelete(productId);

      console.log('✅ Product deleted from MongoDB:', productId);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      // Fallback storage - not implemented for this demo
      res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

    console.log('🎉 PRODUCT DELETION COMPLETED\n');

  } catch (error) {
    console.error('❌ Product deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product: ' + error.message
    });
  }
});

// Update product endpoint
app.put('/api/products/:productId', authenticateToken, upload.array('images', 5), async (req, res) => {
  console.log('\n✏️ UPDATE PRODUCT REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);
  console.log('📦 Product ID:', req.params.productId);
  console.log('📝 Update data:', JSON.stringify(req.body, null, 2));
  console.log('📸 New uploaded files:', req.files?.length || 0);

  try {
    if (mongoose.connection.readyState === 1) {
      const { productId } = req.params;
      const {
        name,
        description,
        price,
        category,
        quantity,
        materials,
        techniques,
        customizationOptions
      } = req.body;

      // Find the existing product
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user owns this product
      if (existingProduct.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own products'
        });
      }

      // Prepare update data
      const updateData = {
        name: name || existingProduct.name,
        description: description || existingProduct.description,
        price: parseFloat(price) || existingProduct.price,
        category: category || existingProduct.category,
        inventory: {
          quantity: parseInt(quantity) || existingProduct.inventory?.quantity || 0,
          reserved: existingProduct.inventory?.reserved || 0
        },
        materials: materials ? materials.split(',').map(m => m.trim()).filter(m => m) : existingProduct.materials,
        techniques: techniques ? techniques.split(',').map(t => t.trim()).filter(t => t) : existingProduct.techniques,
        customizationOptions: customizationOptions || existingProduct.customizationOptions,
        updatedAt: new Date()
      };

      // Handle new image uploads if any
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          alt: `${updateData.name} - Image ${index + 1}`,
          isMain: index === 0 && (!existingProduct.images || existingProduct.images.length === 0)
        }));

        // Add new images to existing ones
        updateData.images = [...(existingProduct.images || []), ...newImages];
        console.log('📸 Added new images:', newImages.length);
      }

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      ).populate('seller', 'firstName lastName email');

      console.log('✅ Product updated successfully');
      console.log('📊 Updated product details:', {
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category,
        quantity: updatedProduct.inventory?.quantity,
        images: updatedProduct.images?.length || 0
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });

    } else {
      res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

    console.log('🎉 PRODUCT UPDATE COMPLETED\n');

  } catch (error) {
    console.error('❌ Product update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product: ' + error.message
    });
  }
});

// Get user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  console.log('\n🛒 GET CART REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);

  try {
    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: req.user._id })
        .populate({
          path: 'items.product',
          populate: {
            path: 'seller',
            select: 'firstName lastName'
          }
        });

      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
      }

      console.log('✅ Cart found with', cart.items.length, 'items');

      res.json({
        success: true,
        cart
      });
    } else {
      res.json({
        success: true,
        cart: { items: [], totalAmount: 0, totalItems: 0 }
      });
    }

  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }

  console.log('🛒 CART DATA SENT\n');
});

// Add item to cart
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  console.log('\n🛒 ADD TO CART REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (mongoose.connection.readyState === 1) {
      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check stock
      if (product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }

      // Get or create cart
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.inventory.quantity) {
          return res.status(400).json({
            success: false,
            message: 'Cannot add more items than available in stock'
          });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();

      // Populate cart for response
      await cart.populate({
        path: 'items.product',
        populate: {
          path: 'seller',
          select: 'firstName lastName'
        }
      });

      console.log('✅ Item added to cart. Total items:', cart.totalItems);

      res.json({
        success: true,
        message: 'Item added to cart successfully',
        cart
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }

  console.log('🛒 ADD TO CART COMPLETED\n');
});

// Remove item from cart
app.delete('/api/cart/remove/:productId', authenticateToken, async (req, res) => {
  console.log('\n🛒 REMOVE FROM CART REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);
  console.log('📦 Product ID:', req.params.productId);

  try {
    const productId = req.params.productId;

    if (mongoose.connection.readyState === 1) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      cart.items = cart.items.filter(item =>
        item.product.toString() !== productId
      );

      await cart.save();

      // Populate cart for response
      await cart.populate({
        path: 'items.product',
        populate: {
          path: 'seller',
          select: 'firstName lastName'
        }
      });

      console.log('✅ Item removed from cart. Total items:', cart.totalItems);

      res.json({
        success: true,
        message: 'Item removed from cart successfully',
        cart
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }

  console.log('🛒 REMOVE FROM CART COMPLETED\n');
});

// Purchase/Buy Now endpoint
app.post('/api/purchase', authenticateToken, async (req, res) => {
  console.log('\n💳 PURCHASE REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { items, paymentMethod = 'credit_card' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required for purchase'
      });
    }

    if (mongoose.connection.readyState === 1) {
      // Validate and process each item
      const orderItems = [];
      let totalAmount = 0;
      let totalItems = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId).populate('seller');

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`
          });
        }

        if (product.inventory.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}`
          });
        }

        // Update product inventory and sales
        product.inventory.quantity -= item.quantity;
        product.sales = (product.sales || 0) + item.quantity;
        await product.save();

        // Create order item
        orderItems.push({
          product: product._id,
          seller: product.seller._id,
          quantity: item.quantity,
          price: product.price,
          productSnapshot: {
            name: product.name,
            description: product.description,
            category: product.category,
            images: product.images
          }
        });

        totalAmount += product.price * item.quantity;
        totalItems += item.quantity;

        console.log(`✅ Processed: ${product.name} x${item.quantity}`);
      }

      // Create order
      const order = new Order({
        buyer: req.user._id,
        items: orderItems,
        totalAmount,
        totalItems,
        paymentStatus: 'paid', // Simplified for demo
        orderStatus: 'confirmed'
      });

      await order.save();

      // Clear cart if items were from cart
      if (req.body.clearCart) {
        await Cart.findOneAndUpdate(
          { user: req.user._id },
          { $set: { items: [] } }
        );
      }

      // Populate order for response
      await order.populate([
        {
          path: 'buyer',
          select: 'firstName lastName email'
        },
        {
          path: 'items.product',
          select: 'name price category images'
        },
        {
          path: 'items.seller',
          select: 'firstName lastName'
        }
      ]);

      console.log('✅ Order created:', order.orderNumber);
      console.log('📊 Total amount:', totalAmount);

      res.status(201).json({
        success: true,
        message: 'Purchase completed successfully!',
        order
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

  } catch (error) {
    console.error('❌ Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Purchase failed: ' + error.message
    });
  }

  console.log('💳 PURCHASE COMPLETED\n');
});

// Get user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  console.log('\n📋 GET ORDERS REQUEST');
  console.log('👤 User:', req.user.firstName, req.user.lastName);

  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({ buyer: req.user._id })
        .populate([
          {
            path: 'items.product',
            select: 'name price category images'
          },
          {
            path: 'items.seller',
            select: 'firstName lastName'
          }
        ])
        .sort({ createdAt: -1 });

      console.log('✅ Found', orders.length, 'orders');

      res.json({
        success: true,
        orders
      });
    } else {
      res.json({
        success: true,
        orders: []
      });
    }

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }

  console.log('📋 ORDERS DATA SENT\n');
});

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 CRAFTIFY MONGODB BACKEND STARTED!');
  console.log('='.repeat(60));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users List: http://localhost:${PORT}/api/users`);
  console.log(`🗄️ Database: ${MONGODB_URI}`);
  console.log('='.repeat(60));
  console.log('✅ Ready with MongoDB support!');
  console.log('\n📋 API ENDPOINTS:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/users');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:productId');
  console.log('  POST /api/products');
  console.log('  PUT  /api/products/:productId');
  console.log('  GET  /api/products/seller/:sellerId');
  console.log('  DELETE /api/products/:productId');
  console.log('  GET  /api/users/:userId');
  console.log('  GET  /api/cart');
  console.log('  POST /api/cart/add');
  console.log('  DELETE /api/cart/remove/:productId');
  console.log('  POST /api/purchase');
  console.log('  GET  /api/orders');
  console.log('\n🎯 Waiting for requests...\n');
});
