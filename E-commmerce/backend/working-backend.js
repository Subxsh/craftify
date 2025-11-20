const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS - Allow all origins for testing
app.use(cors());
app.use(express.json());

console.log('🚀 Starting Working Backend...');

// Load users
const USERS_FILE = path.join(__dirname, 'users.json');
let users = [];

try {
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  const parsed = JSON.parse(data);
  users = parsed.users || [];
  console.log(`✅ Loaded ${users.length} users`);
} catch (error) {
  console.log('❌ Could not load users:', error.message);
  users = [];
}

// Sample products
const products = [
  {
    _id: 'product-1',
    name: 'Handmade Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with intricate patterns. Perfect for home decoration.',
    price: 45.99,
    category: 'Home Decor',
    inventory: { quantity: 8 },
    images: [{ url: '/uploads/ceramic-vase.jpg', alt: 'Ceramic Vase', isMain: true }],
    seller: { _id: 'user-1', firstName: 'Subash', lastName: 'Periyasamy' },
    materials: 'High-quality ceramic',
    techniques: 'Hand-thrown and glazed',
    sales: 15,
    views: 234
  },
  {
    _id: 'product-2',
    name: 'Wooden Jewelry Box',
    description: 'Elegant wooden jewelry box with intricate carvings and velvet interior.',
    price: 89.99,
    category: 'Accessories',
    inventory: { quantity: 5 },
    images: [{ url: '/uploads/jewelry-box.jpg', alt: 'Jewelry Box', isMain: true }],
    seller: { _id: 'user-2', firstName: 'Vijeth', lastName: 'B' },
    materials: 'Oak wood, velvet lining',
    techniques: 'Hand-carved and finished',
    sales: 8,
    views: 156
  },
  {
    _id: 'product-3',
    name: 'Artisan Leather Wallet',
    description: 'Premium handcrafted leather wallet with multiple card slots and bill compartments.',
    price: 65.00,
    category: 'Accessories',
    inventory: { quantity: 12 },
    images: [{ url: '/uploads/leather-wallet.jpg', alt: 'Leather Wallet', isMain: true }],
    seller: { _id: 'user-3', firstName: 'Admin', lastName: 'User' },
    materials: 'Full-grain leather',
    techniques: 'Hand-stitched',
    sales: 22,
    views: 312
  }
];

// Health check
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.status(200).json({
    success: true,
    message: 'Working Backend is running!',
    timestamp: new Date().toISOString(),
    users: users.length,
    products: products.length
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('\n🔐 LOGIN REQUEST');
  console.log('Body:', req.body);
  
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
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log('❌ User not found:', email);
    console.log('Available users:', users.map(u => u.email));
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  // Check password
  if (user.password !== password) {
    console.log('❌ Wrong password for:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  console.log('✅ Login successful for:', email);
  
  // Return success response
  const { password: _, ...userResponse } = user;
  
  res.status(200).json({
    success: true,
    message: 'Login successful!',
    token: `token_${user._id}_${Date.now()}`,
    user: userResponse
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('\n📝 REGISTER REQUEST');
  console.log('Body:', req.body);
  
  const { firstName, lastName, email, password, role } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create new user
  const newUser = {
    _id: `user-${Date.now()}`,
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role: role || 'buyer',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  console.log('✅ Registration successful for:', email);
  
  const { password: _, ...userResponse } = newUser;
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token: `token_${newUser._id}_${Date.now()}`,
    user: userResponse
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  console.log('\n🛍️ GET PRODUCTS');
  res.status(200).json({
    success: true,
    products: products,
    count: products.length
  });
});

// Get product by ID
app.get('/api/products/:productId', (req, res) => {
  console.log('\n📦 GET PRODUCT BY ID:', req.params.productId);
  
  const product = products.find(p => p._id === req.params.productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
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
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const { password: _, ...userResponse } = user;
  
  res.status(200).json({
    success: true,
    user: userResponse
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = 5003;

app.listen(PORT, () => {
  console.log('\n🎉 WORKING BACKEND STARTED!');
  console.log('=' .repeat(40));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`🛍️ Products: ${products.length}`);
  console.log('=' .repeat(40));
  
  if (users.length > 0) {
    console.log('\n🔐 LOGIN CREDENTIALS:');
    users.forEach(user => {
      console.log(`  📧 ${user.email} | 🔑 ${user.password}`);
    });
  }
  
  console.log('\n✅ Backend ready for requests!\n');
});

console.log('Setting up server...');
