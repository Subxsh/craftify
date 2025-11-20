const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Clean Craftify Server...');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      console.log('❌ No users file found');
      users = [];
    }
  } catch (error) {
    console.error('❌ Error loading users:', error);
    users = [];
  }
}

// Load users on startup
loadUsers();

// Sample products data
const products = [
  {
    _id: 'product-1',
    name: 'Handmade Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with intricate blue and white patterns. Perfect for home decoration and fresh flower arrangements. Made by skilled artisans using traditional pottery techniques.',
    price: 45.99,
    category: 'Home Decor',
    inventory: { quantity: 8 },
    images: [
      {
        url: '/uploads/ceramic-vase.jpg',
        alt: 'Handmade Ceramic Vase',
        isMain: true
      }
    ],
    seller: {
      _id: 'user-1',
      firstName: 'Subash',
      lastName: 'Periyasamy'
    },
    materials: 'High-quality ceramic clay, natural glazes',
    techniques: 'Hand-thrown on pottery wheel, kiln-fired',
    customizationOptions: 'Available in different colors and sizes',
    sales: 15,
    views: 234
  },
  {
    _id: 'product-2',
    name: 'Wooden Jewelry Box',
    description: 'Elegant handcrafted wooden jewelry box with intricate carvings and soft velvet interior. Features multiple compartments for organized storage of your precious jewelry.',
    price: 89.99,
    category: 'Accessories',
    inventory: { quantity: 5 },
    images: [
      {
        url: '/uploads/jewelry-box.jpg',
        alt: 'Wooden Jewelry Box',
        isMain: true
      }
    ],
    seller: {
      _id: 'user-2',
      firstName: 'Vijeth',
      lastName: 'B'
    },
    materials: 'Sustainable oak wood, velvet lining, brass hinges',
    techniques: 'Hand-carved, sanded and polished finish',
    customizationOptions: 'Custom engraving available',
    sales: 8,
    views: 156
  },
  {
    _id: 'product-3',
    name: 'Artisan Leather Wallet',
    description: 'Premium handcrafted leather wallet made from genuine full-grain leather. Features multiple card slots, bill compartments, and a coin pocket. Perfect for everyday use.',
    price: 65.00,
    category: 'Accessories',
    inventory: { quantity: 12 },
    images: [
      {
        url: '/uploads/leather-wallet.jpg',
        alt: 'Artisan Leather Wallet',
        isMain: true
      }
    ],
    seller: {
      _id: 'user-3',
      firstName: 'Admin',
      lastName: 'User'
    },
    materials: 'Full-grain leather, cotton thread, metal hardware',
    techniques: 'Hand-stitched, edge-painted, conditioned',
    customizationOptions: 'Personalized initials embossing',
    sales: 22,
    views: 312
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.json({
    success: true,
    message: 'Clean Craftify Server is running!',
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    productsCount: products.length
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('\n🔐 LOGIN REQUEST');
  const { email, password } = req.body;
  
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password ? '[PROVIDED]' : '[MISSING]'}`);
  
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log('❌ User not found');
    console.log('📋 Available users:', users.map(u => u.email));
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  if (user.password !== password) {
    console.log('❌ Invalid password');
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  console.log('✅ Login successful');
  
  // Remove password from response
  const { password: _, ...userResponse } = user;
  
  res.json({
    success: true,
    message: 'Login successful!',
    token: `token_${user._id}_${Date.now()}`,
    user: userResponse
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  console.log('\n🛍️ GET PRODUCTS REQUEST');
  res.json({
    success: true,
    products: products,
    count: products.length
  });
  console.log(`✅ Sent ${products.length} products`);
});

// Get single product by ID
app.get('/api/products/:productId', (req, res) => {
  console.log('\n📦 GET PRODUCT BY ID');
  const productId = req.params.productId;
  console.log(`🔍 Looking for product: ${productId}`);
  
  const product = products.find(p => p._id === productId);
  
  if (!product) {
    console.log('❌ Product not found');
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  console.log(`✅ Found product: ${product.name}`);
  
  res.json({
    success: true,
    product: product
  });
});

// Get products by seller
app.get('/api/products/seller/:sellerId', (req, res) => {
  console.log('\n👤 GET PRODUCTS BY SELLER');
  const sellerId = req.params.sellerId;
  console.log(`🔍 Looking for seller: ${sellerId}`);
  
  const sellerProducts = products.filter(p => p.seller._id === sellerId);
  
  console.log(`✅ Found ${sellerProducts.length} products for seller`);
  
  res.json({
    success: true,
    products: sellerProducts,
    count: sellerProducts.length
  });
});

// Get user by ID
app.get('/api/users/:userId', (req, res) => {
  console.log('\n👤 GET USER BY ID');
  const userId = req.params.userId;
  console.log(`🔍 Looking for user: ${userId}`);
  
  const user = users.find(u => u._id === userId);
  
  if (!user) {
    console.log('❌ User not found');
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
  
  // Remove password from response
  const { password: _, ...userResponse } = user;
  
  res.json({
    success: true,
    user: userResponse
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Start server
const PORT = 5002;

app.listen(PORT, () => {
  console.log('\n🎉 CLEAN CRAFTIFY SERVER STARTED!');
  console.log('=' .repeat(50));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`🛍️ Products: ${products.length}`);
  console.log('=' .repeat(50));
  console.log('\n📋 API ENDPOINTS:');
  console.log('  GET  /api/health');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:productId');
  console.log('  GET  /api/products/seller/:sellerId');
  console.log('  GET  /api/users/:userId');
  console.log('\n🔐 LOGIN CREDENTIALS:');
  users.forEach(user => {
    console.log(`  📧 ${user.email} | 🔑 ${user.password}`);
  });
  console.log('\n✅ Ready for requests!\n');
});

console.log('🔧 Server setup complete...');
