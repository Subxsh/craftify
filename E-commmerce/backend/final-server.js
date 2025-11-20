const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Final Working Server...');

const app = express();

// CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Load users from file
const USERS_FILE = path.join(__dirname, 'users.json');
let users = [];

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      users = parsed.users || [];
      console.log(`✅ Loaded ${users.length} users from file`);
    } else {
      console.log('❌ No users file found, creating empty array');
      users = [];
    }
  } catch (error) {
    console.error('❌ Error loading users:', error.message);
    users = [];
  }
}

function saveUsers() {
  try {
    const data = {
      users: users,
      userCounter: users.length + 1,
      lastSaved: new Date().toISOString()
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${users.length} users to file`);
    return true;
  } catch (error) {
    console.error('❌ Error saving users:', error.message);
    return false;
  }
}

// Load users on startup
loadUsers();

// Sample products
const products = [
  {
    _id: 'product-1',
    name: 'Handmade Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with intricate blue and white patterns. Perfect for home decoration and fresh flower arrangements.',
    price: 45.99,
    category: 'Home Decor',
    inventory: { quantity: 8 },
    images: [{ url: '/uploads/ceramic-vase.jpg', alt: 'Ceramic Vase', isMain: true }],
    seller: { _id: 'user-1', firstName: 'Subash', lastName: 'Periyasamy' },
    materials: 'High-quality ceramic clay',
    techniques: 'Hand-thrown on pottery wheel',
    sales: 15,
    views: 234
  },
  {
    _id: 'product-2',
    name: 'Wooden Jewelry Box',
    description: 'Elegant handcrafted wooden jewelry box with intricate carvings and soft velvet interior. Features multiple compartments.',
    price: 89.99,
    category: 'Accessories',
    inventory: { quantity: 5 },
    images: [{ url: '/uploads/jewelry-box.jpg', alt: 'Jewelry Box', isMain: true }],
    seller: { _id: 'user-2', firstName: 'Vijeth', lastName: 'B' },
    materials: 'Sustainable oak wood, velvet lining',
    techniques: 'Hand-carved and polished',
    sales: 8,
    views: 156
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.status(200).json({
    success: true,
    message: 'Final server is running perfectly!',
    timestamp: new Date().toISOString(),
    users: users.length,
    products: products.length,
    status: 'OK'
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('\n🔐 LOGIN REQUEST RECEIVED');
  console.log('Request body:', req.body);
  
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Find user
  const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log('❌ User not found with email:', email);
    console.log('Available users:', users.map(u => u.email || 'NO_EMAIL'));
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  // Check password
  if (!user.password || user.password !== password) {
    console.log('❌ Invalid password for user:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  console.log('✅ Login successful for:', email);
  
  // Return success response
  const { password: _, ...userResponse } = user;
  
  const response = {
    success: true,
    message: 'Login successful!',
    token: `token_${user._id}_${Date.now()}`,
    user: userResponse
  };
  
  console.log('Sending login response:', response);
  res.status(200).json(response);
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('\n📝 REGISTER REQUEST RECEIVED');
  console.log('Request body:', req.body);
  
  const { firstName, lastName, email, password, role } = req.body;
  
  // Validate input
  if (!firstName || !lastName || !email || !password) {
    console.log('❌ Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    console.log('❌ User already exists with email:', email);
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create new user
  const newUser = {
    _id: `user-${Date.now()}`,
    firstName: firstName,
    lastName: lastName,
    email: email.toLowerCase(),
    password: password,
    role: role || 'buyer',
    createdAt: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to file
  const saved = saveUsers();
  
  if (!saved) {
    console.log('❌ Failed to save user to file');
    return res.status(500).json({
      success: false,
      message: 'Failed to save user data'
    });
  }
  
  console.log('✅ Registration successful for:', email);
  console.log('Total users now:', users.length);
  
  // Return success response
  const { password: _, ...userResponse } = newUser;
  
  const response = {
    success: true,
    message: 'Registration successful!',
    token: `token_${newUser._id}_${Date.now()}`,
    user: userResponse
  };
  
  console.log('Sending registration response:', response);
  res.status(201).json(response);
});

// Get all products
app.get('/api/products', (req, res) => {
  console.log('\n🛍️ GET PRODUCTS REQUEST');
  res.status(200).json({
    success: true,
    products: products,
    count: products.length
  });
  console.log(`✅ Sent ${products.length} products`);
});

// Get product by ID
app.get('/api/products/:productId', (req, res) => {
  console.log('\n📦 GET PRODUCT BY ID:', req.params.productId);
  
  const product = products.find(p => p._id === req.params.productId);
  
  if (!product) {
    console.log('❌ Product not found');
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  console.log('✅ Found product:', product.name);
  res.status(200).json({
    success: true,
    product: product
  });
});

// Get user by ID
app.get('/api/users/:userId', (req, res) => {
  console.log('\n👤 GET USER BY ID:', req.params.userId);
  
  const user = users.find(u => u._id === req.params.userId);
  
  if (!user) {
    console.log('❌ User not found');
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const { password: _, ...userResponse } = user;
  
  console.log('✅ Found user:', user.firstName, user.lastName);
  res.status(200).json({
    success: true,
    user: userResponse
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

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = 5005;

app.listen(PORT, () => {
  console.log('\n🎉 FINAL WORKING SERVER STARTED!');
  console.log('=' .repeat(50));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`🛍️ Products: ${products.length}`);
  console.log('=' .repeat(50));
  
  if (users.length > 0) {
    console.log('\n🔐 EXISTING LOGIN CREDENTIALS:');
    users.forEach(user => {
      console.log(`  📧 ${user.email} | 🔑 ${user.password || 'NO_PASSWORD'}`);
    });
  } else {
    console.log('\n📝 No existing users - register new accounts!');
  }
  
  console.log('\n📋 API ENDPOINTS:');
  console.log('  GET  /api/health');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:productId');
  console.log('  GET  /api/users/:userId');
  
  console.log('\n✅ Server ready for requests!\n');
});

console.log('Setting up final server...');
