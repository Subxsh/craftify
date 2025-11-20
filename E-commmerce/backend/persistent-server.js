const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

// File-based storage for persistence
const USERS_FILE = path.join(__dirname, 'users.json');

// Load users from file or create empty array
let users = [];
let userCounter = 1;

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      users = parsed.users || [];
      userCounter = parsed.userCounter || 1;
      // Initialize cart for existing users
      users.forEach(user => {
        if (!user.cart) user.cart = [];
      });
      console.log(`📂 Loaded ${users.length} users from file`);
    } else {
      console.log('📂 No users file found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading users:', error);
    users = [];
    userCounter = 1;
  }
}

function saveUsers() {
  try {
    const data = {
      users,
      userCounter,
      lastSaved: new Date().toISOString()
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${users.length} users to file`);
    return true;
  } catch (error) {
    console.error('❌ Error saving users:', error);
    return false;
  }
}

// Load users on startup
loadUsers();

// Request logging (optimized)
app.use((req, res, next) => {
  // Only log non-health check requests to reduce spam
  if (req.path !== '/api/health') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Craftify Backend API with Persistent Storage',
    status: 'running',
    usersCount: users.length,
    endpoints: [
      'GET /api/health',
      'GET /api/users',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/cart',
      'POST /api/cart/add'
    ]
  });
});

// Health check endpoint (with reduced logging)
app.get('/api/health', (req, res) => {
  // Only log health checks every 30 seconds to reduce spam
  const now = Date.now();
  if (!app.lastHealthLog || now - app.lastHealthLog > 30000) {
    console.log(`🔍 Health check - Users: ${users.length}, Uptime: ${Math.floor(process.uptime())}s`);
    app.lastHealthLog = now;
  }

  res.json({
    status: 'OK',
    message: 'Craftify Backend is running with persistent storage!',
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    serverUptime: Math.floor(process.uptime()),
    port: 5000,
    storageType: 'file-based'
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('\n🔥 REGISTRATION REQUEST RECEIVED');
  console.log('📊 Current users count BEFORE:', users.length);
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  
  const { firstName, lastName, email, password, role } = req.body;
  
  // Validation
  if (!firstName || firstName.length < 2) {
    console.log('❌ Validation failed: firstName');
    return res.status(400).json({
      success: false,
      message: 'First name must be at least 2 characters'
    });
  }
  
  if (!lastName || lastName.length < 2) {
    console.log('❌ Validation failed: lastName');
    return res.status(400).json({
      success: false,
      message: 'Last name must be at least 2 characters'
    });
  }
  
  if (!email || !email.includes('@')) {
    console.log('❌ Validation failed: email');
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  if (!password || password.length < 6) {
    console.log('❌ Validation failed: password');
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Check if user exists
  const existingUser = users.find(user => user.email === email.toLowerCase());
  if (existingUser) {
    console.log('❌ User already exists with email:', email);
    return res.status(400).json({
      success: false,
      message: 'A user with this email already exists'
    });
  }
  
  // Create user
  const user = {
    _id: userCounter++,
    firstName,
    lastName,
    email: email.toLowerCase(),
    role: role || 'buyer',
    cart: [],
    createdAt: new Date().toISOString()
  };
  
  // Add to array
  users.push(user);
  console.log('✅ User added to memory array');
  console.log('📊 Users count AFTER adding:', users.length);
  console.log('👤 New user:', JSON.stringify(user, null, 2));
  
  // Save to file
  const saved = saveUsers();
  if (saved) {
    console.log('💾 User successfully saved to file');
  } else {
    console.log('❌ Failed to save user to file');
  }
  
  // Generate token
  const token = `token_${user._id}_${Date.now()}`;
  
  // Verify user is in array
  const verification = users.find(u => u._id === user._id);
  console.log('🔍 Verification - User in array:', !!verification);
  console.log('📊 Final users count:', users.length);
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user,
    debug: {
      usersCount: users.length,
      savedToFile: saved,
      userExists: !!verification
    }
  });
  
  console.log('🎉 REGISTRATION COMPLETED SUCCESSFULLY\n');
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('\n🔐 LOGIN REQUEST');
  console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  const user = users.find(user => user.email === email.toLowerCase());

  if (!user) {
    console.log('❌ No user found with email:', email);
    console.log('📊 Available users:', users.map(u => u.email));
    return res.status(401).json({
      success: false,
      message: 'No account found with this email address'
    });
  }

  // Check password
  if (user.password !== password) {
    console.log('❌ Invalid password for user:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid password'
    });
  }

  const token = `token_${user._id}_${Date.now()}`;

  console.log('✅ Login successful for:', user.email);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: userWithoutPassword
  });
  
  console.log('🎉 LOGIN COMPLETED\n');
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('_');
  
  if (tokenParts.length < 2) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
  
  const userId = parseInt(tokenParts[1]);
  const user = users.find(user => user._id === userId);
  
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
});

// Add to cart
app.post('/api/cart/add', (req, res) => {
  console.log('\n🛒 ADD TO CART REQUEST');
  console.log('📝 Body:', JSON.stringify(req.body, null, 2));

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('_');

  if (tokenParts.length < 2) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }

  const userId = parseInt(tokenParts[1]);
  const user = users.find(user => user._id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found'
    });
  }

  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const qty = quantity || 1;
  if (qty < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }

  // Check if product exists
  const product = sampleProducts.find(p => p._id === productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if item already in cart
  const existingItem = user.cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += qty;
    console.log(`✅ Updated quantity for ${productId} to ${existingItem.quantity}`);
  } else {
    user.cart.push({ productId, quantity: qty });
    console.log(`✅ Added new item ${productId} with quantity ${qty}`);
  }

  // Save users
  const saved = saveUsers();
  if (!saved) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save cart'
    });
  }

  console.log('🛒 Cart updated successfully');

  // Build cart with product details to return a consistent shape
  const cartWithDetails = user.cart.map(item => {
    const product = sampleProducts.find(p => p._id === item.productId);
    if (!product) return null;
    return {
      product,
      quantity: item.quantity,
      subtotal: product.price * item.quantity
    };
  }).filter(i => i !== null);

  const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);

  res.json({
    success: true,
    message: 'Item added to cart successfully',
    cart: {
      items: cartWithDetails,
      totalItems,
      totalAmount: parseFloat(totalPrice.toFixed(2))
    }
  });

  console.log('🎉 ADD TO CART COMPLETED\n');
});

// Get cart
app.get('/api/cart', (req, res) => {
  console.log('\n🛒 GET CART REQUEST');

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('_');

  if (tokenParts.length < 2) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }

  const userId = parseInt(tokenParts[1]);
  const user = users.find(user => user._id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found'
    });
  }

  // Populate cart with product details
  const cartWithDetails = user.cart.map(item => {
    const product = sampleProducts.find(p => p._id === item.productId);
    if (!product) {
      console.warn(`Product ${item.productId} not found in cart`);
      return null;
    }
    return {
      product,
      quantity: item.quantity,
      subtotal: product.price * item.quantity
    };
  }).filter(item => item !== null);

  const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);

  console.log(`✅ Cart retrieved: ${cartWithDetails.length} items, total $${totalPrice.toFixed(2)}`);

  res.json({
    success: true,
    cart: {
      items: cartWithDetails,
      totalItems,
      totalAmount: parseFloat(totalPrice.toFixed(2))
    }
  });

  console.log('🎉 GET CART COMPLETED\n');
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  console.log('\n📋 USERS LIST REQUESTED');
  console.log('📊 Current users count:', users.length);
  console.log('👥 Users:', users.map(u => ({ id: u._id, email: u.email, name: `${u.firstName} ${u.lastName}` })));
  
  res.json({
    success: true,
    users,
    count: users.length,
    message: users.length === 0 ? 'No users registered yet' : `Found ${users.length} registered users`,
    debug: {
      userCounter,
      fileExists: fs.existsSync(USERS_FILE)
    }
  });
  
  console.log('📋 USERS LIST SENT\n');
});

// Debug endpoint to reload users from file
app.get('/api/debug/reload', (req, res) => {
  console.log('🔄 Reloading users from file...');
  loadUsers();
  res.json({
    success: true,
    message: 'Users reloaded from file',
    usersCount: users.length,
    users
  });
});

// Debug endpoint to force save
app.post('/api/debug/save', (req, res) => {
  console.log('💾 Force saving users to file...');
  const saved = saveUsers();
  res.json({
    success: saved,
    message: saved ? 'Users saved successfully' : 'Failed to save users',
    usersCount: users.length
  });
});

// Sample products data
const sampleProducts = [
  {
    _id: 'product-1',
    name: 'Handmade Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with intricate patterns. Perfect for home decoration and flower arrangements.',
    price: 45.99,
    category: 'Home Decor',
    inventory: { quantity: 5 },
    images: [
      {
        url: '/uploads/ceramic-vase.jpg',
        alt: 'Handmade Ceramic Vase',
        isMain: true
      }
    ],
    seller: {
      _id: 'seller-1',
      firstName: 'John',
      lastName: 'Artist'
    },
    materials: 'High-quality ceramic',
    techniques: 'Hand-thrown and glazed',
    customizationOptions: 'Available in different colors',
    sales: 12,
    views: 156
  },
  {
    _id: 'product-2',
    name: 'Wooden Jewelry Box',
    description: 'Elegant wooden jewelry box with intricate carvings and velvet interior. Handcrafted from sustainable wood.',
    price: 89.99,
    category: 'Accessories',
    inventory: { quantity: 3 },
    images: [
      {
        url: '/uploads/jewelry-box.jpg',
        alt: 'Wooden Jewelry Box',
        isMain: true
      }
    ],
    seller: {
      _id: 'seller-2',
      firstName: 'Jane',
      lastName: 'Craftsperson'
    },
    materials: 'Sustainable oak wood, velvet lining',
    techniques: 'Hand-carved and finished',
    customizationOptions: 'Custom engraving available',
    sales: 8,
    views: 89
  },
  {
    _id: 'product-3',
    name: 'Artisan Leather Wallet',
    description: 'Premium handcrafted leather wallet with multiple card slots and bill compartments. Made from genuine leather.',
    price: 65.00,
    category: 'Accessories',
    inventory: { quantity: 7 },
    images: [
      {
        url: '/uploads/leather-wallet.jpg',
        alt: 'Artisan Leather Wallet',
        isMain: true
      }
    ],
    seller: {
      _id: 'seller-3',
      firstName: 'Mike',
      lastName: 'Leatherworker'
    },
    materials: 'Genuine leather, cotton thread',
    techniques: 'Hand-stitched and dyed',
    customizationOptions: 'Personalized initials',
    sales: 15,
    views: 203
  }
];

// Get all products
app.get('/api/products', (req, res) => {
  console.log('\n🛍️ GET PRODUCTS REQUEST');

  res.json({
    success: true,
    products: sampleProducts,
    count: sampleProducts.length
  });

  console.log('✅ Products sent:', sampleProducts.length);
});

// Get single product by ID
app.get('/api/products/:productId', (req, res) => {
  console.log('\n📦 GET PRODUCT BY ID REQUEST');
  console.log('Product ID:', req.params.productId);

  const product = sampleProducts.find(p => p._id === req.params.productId);

  if (!product) {
    console.log('❌ Product not found:', req.params.productId);
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Increment view count
  product.views += 1;

  console.log('✅ Product found:', product.name);

  res.json({
    success: true,
    product
  });
});

// Get products by seller
app.get('/api/products/seller/:sellerId', (req, res) => {
  console.log('\n👤 GET PRODUCTS BY SELLER REQUEST');
  console.log('Seller ID:', req.params.sellerId);

  const sellerProducts = sampleProducts.filter(p => p.seller._id === req.params.sellerId);

  console.log('✅ Found products for seller:', sellerProducts.length);

  res.json({
    success: true,
    products: sellerProducts,
    count: sellerProducts.length
  });
});

// Get user by ID (for seller profiles)
app.get('/api/users/:userId', (req, res) => {
  console.log('\n👤 GET USER BY ID REQUEST');
  console.log('User ID:', req.params.userId);

  // Check if it's a sample seller
  const sampleSellers = {
    'seller-1': { _id: 'seller-1', firstName: 'John', lastName: 'Artist', email: 'john@craftify.com', role: 'seller' },
    'seller-2': { _id: 'seller-2', firstName: 'Jane', lastName: 'Craftsperson', email: 'jane@craftify.com', role: 'seller' },
    'seller-3': { _id: 'seller-3', firstName: 'Mike', lastName: 'Leatherworker', email: 'mike@craftify.com', role: 'seller' }
  };

  const sampleSeller = sampleSellers[req.params.userId];
  if (sampleSeller) {
    console.log('✅ Sample seller found:', sampleSeller.firstName, sampleSeller.lastName);
    return res.json({
      success: true,
      user: sampleSeller
    });
  }

  // Check registered users
  const user = users.find(u => u._id === req.params.userId);

  if (!user) {
    console.log('❌ User not found:', req.params.userId);
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  console.log('✅ User found:', user.firstName, user.lastName);

  res.json({
    success: true,
    user: userWithoutPassword
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 CRAFTIFY PERSISTENT BACKEND STARTED!');
  console.log('='.repeat(60));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users List: http://localhost:${PORT}/api/users`);
  console.log(`💾 Storage File: ${USERS_FILE}`);
  console.log(`📊 Loaded Users: ${users.length}`);
  console.log('='.repeat(60));
  console.log('✅ Ready with persistent storage!');
  console.log('\n📋 API ENDPOINTS:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/users');
  console.log('  GET  /api/users/:userId');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /api/cart');
  console.log('  POST /api/cart/add');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:productId');
  console.log('  GET  /api/products/seller/:sellerId');
  console.log('  GET  /api/debug/reload');
  console.log('  POST /api/debug/save');
  console.log('\n🎯 Waiting for requests...\n');
});

// Save users on shutdown
process.on('SIGINT', () => {
  console.log('\n💾 Saving users before shutdown...');
  saveUsers();
  console.log('👋 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n💾 Saving users before shutdown...');
  saveUsers();
  console.log('👋 Server shutting down gracefully...');
  process.exit(0);
});
