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

// Load users from file
let users = [];
let userCounter = 1;

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      users = parsed.users || [];
      userCounter = parsed.userCounter || 1;
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

// Load users on startup
loadUsers();

// Login endpoint with proper password validation
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

// Sample products data
const sampleProducts = [
  {
    _id: 'product-1',
    name: 'Handmade Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with intricate patterns.',
    price: 45.99,
    category: 'Home Decor',
    inventory: { quantity: 5 },
    images: [{ url: '/uploads/ceramic-vase.jpg', alt: 'Ceramic Vase', isMain: true }],
    seller: { _id: 'seller-1', firstName: 'John', lastName: 'Artist' }
  },
  {
    _id: 'product-2',
    name: 'Wooden Jewelry Box',
    description: 'Elegant wooden jewelry box with intricate carvings.',
    price: 89.99,
    category: 'Accessories',
    inventory: { quantity: 3 },
    images: [{ url: '/uploads/jewelry-box.jpg', alt: 'Jewelry Box', isMain: true }],
    seller: { _id: 'seller-2', firstName: 'Jane', lastName: 'Craftsperson' }
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
  
  console.log('✅ Product found:', product.name);
  
  res.json({
    success: true,
    product
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth server is running!',
    timestamp: new Date().toISOString(),
    usersCount: users.length
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

const PORT = 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 CRAFTIFY AUTH SERVER STARTED!');
  console.log('='.repeat(50));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Loaded Users: ${users.length}`);
  console.log('='.repeat(50));
  console.log('✅ Ready for authentication!');
  console.log('\n📋 API ENDPOINTS:');
  console.log('  GET  /api/health');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:productId');
  console.log('\n🎯 Waiting for requests...\n');
});

console.log('🔧 Auth server setup complete, starting...');
