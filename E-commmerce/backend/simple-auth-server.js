const express = require('express');
const cors = require('cors');

console.log('🚀 Starting Simple Auth Server...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({
    success: true,
    message: 'Simple Auth Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login request:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Accept any login for demo
  const response = {
    success: true,
    message: 'Login successful!',
    token: 'demo-token-' + Date.now(),
    user: {
      _id: 'demo-user-' + Date.now(),
      firstName: 'Welcome',
      lastName: 'Back',
      email: email,
      role: 'seller'
    }
  };
  
  console.log('✅ Login successful for:', email);
  res.json(response);
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Register request:', req.body);
  
  const { firstName, lastName, email, password, role } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  const response = {
    success: true,
    message: 'Registration successful!',
    token: 'demo-token-' + Date.now(),
    user: {
      _id: 'demo-user-' + Date.now(),
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role || 'buyer'
    }
  };
  
  console.log('✅ Registration successful for:', email);
  res.json(response);
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  console.log('👤 Get current user request');
  
  res.json({
    success: true,
    user: {
      _id: 'demo-user-123',
      firstName: 'Welcome',
      lastName: 'Back',
      email: 'user@craftify.com',
      role: 'seller'
    }
  });
});

// Get products
app.get('/api/products', (req, res) => {
  console.log('🛍️ Get products request');
  
  res.json({
    success: true,
    products: [
      {
        _id: 'product-1',
        name: 'Handmade Ceramic Vase',
        description: 'Beautiful handcrafted ceramic vase',
        price: 45.99,
        category: 'Home Decor',
        inventory: { quantity: 5 },
        images: [],
        seller: {
          _id: 'seller-1',
          firstName: 'John',
          lastName: 'Artist'
        }
      },
      {
        _id: 'product-2',
        name: 'Wooden Jewelry Box',
        description: 'Elegant wooden jewelry box with intricate carvings',
        price: 89.99,
        category: 'Accessories',
        inventory: { quantity: 3 },
        images: [],
        seller: {
          _id: 'seller-2',
          firstName: 'Jane',
          lastName: 'Craftsperson'
        }
      }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = 5001;

app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  
  console.log('✅ Simple Auth Server running on http://localhost:' + PORT);
  console.log('🔍 Health check: http://localhost:' + PORT + '/api/health');
  console.log('🔐 Login endpoint: http://localhost:' + PORT + '/api/auth/login');
  console.log('📝 Register endpoint: http://localhost:' + PORT + '/api/auth/register');
  console.log('🛍️ Products endpoint: http://localhost:' + PORT + '/api/products');
  console.log('🎉 Ready for requests!');
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

console.log('🔧 Server setup complete, starting...');
