const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Fresh Craftify Server...');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Load users from file
const USERS_FILE = path.join(__dirname, 'users.json');
let users = [];

try {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    users = parsed.users || [];
    console.log(`✅ Loaded ${users.length} users`);
  }
} catch (error) {
  console.error('❌ Error loading users:', error);
  users = [];
}

// Products data
const products = [
  {
    _id: 'product-1',
    name: 'Handmade Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with intricate patterns.',
    price: 45.99,
    category: 'Home Decor',
    inventory: { quantity: 8 },
    images: [{ url: '/uploads/ceramic-vase.jpg', alt: 'Ceramic Vase', isMain: true }],
    seller: { _id: 'user-1', firstName: 'Subash', lastName: 'Periyasamy' }
  },
  {
    _id: 'product-2',
    name: 'Wooden Jewelry Box',
    description: 'Elegant wooden jewelry box with intricate carvings.',
    price: 89.99,
    category: 'Accessories',
    inventory: { quantity: 5 },
    images: [{ url: '/uploads/jewelry-box.jpg', alt: 'Jewelry Box', isMain: true }],
    seller: { _id: 'user-2', firstName: 'Vijeth', lastName: 'B' }
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fresh server running!',
    users: users.length,
    products: products.length
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  console.log('\n🔐 LOGIN REQUEST');
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log('❌ User not found:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  if (user.password !== password) {
    console.log('❌ Wrong password for:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  console.log('✅ Login successful:', email);
  
  const { password: _, ...userResponse } = user;
  
  res.json({
    success: true,
    message: 'Login successful!',
    token: `token_${user._id}_${Date.now()}`,
    user: userResponse
  });
});

// Get products
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: products
  });
});

// Get product by ID
app.get('/api/products/:productId', (req, res) => {
  const product = products.find(p => p._id === req.params.productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    product: product
  });
});

// Get user by ID
app.get('/api/users/:userId', (req, res) => {
  const user = users.find(u => u._id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const { password: _, ...userResponse } = user;
  
  res.json({
    success: true,
    user: userResponse
  });
});

// Start server on port 5002
const PORT = 5002;

app.listen(PORT, () => {
  console.log(`\n🎉 FRESH SERVER STARTED ON PORT ${PORT}!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`🛍️ Products: ${products.length}`);
  console.log('\n🔐 LOGIN CREDENTIALS:');
  users.forEach(user => {
    console.log(`  📧 ${user.email} | 🔑 ${user.password}`);
  });
  console.log('\n✅ Ready!\n');
});

console.log('Starting server...');
