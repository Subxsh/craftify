const http = require('http');
const url = require('url');

console.log('🚀 Starting Craftify Working Server...');

// Simple in-memory storage
let users = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Seller',
    email: 'seller@test.com',
    password: 'password123',
    role: 'seller'
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${new Date().toISOString()} - ${method} ${path}`);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Craftify server is running!',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Login endpoint
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const loginData = JSON.parse(body);
        console.log('📧 Login attempt for:', loginData.email);

        // Accept any login for demo - match expected format
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful!',
          token: 'demo-token-' + Date.now(),
          user: {
            _id: 'demo-user-' + Date.now(),
            firstName: 'Welcome',
            lastName: 'Back',
            email: loginData.email,
            role: 'seller'
          }
        }));
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid login data'
        }));
      }
    });
    return;
  }

  // Register endpoint
  if (path === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        console.log('📝 Registration attempt for:', userData.email);

        // Simple validation
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'All fields are required'
          }));
          return;
        }

        // Create user
        const newUser = {
          _id: 'user-' + Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role || 'buyer'
        };

        users.push(newUser);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Registration successful!',
          token: 'demo-token-' + Date.now(),
          user: newUser
        }));
      } catch (error) {
        console.error('Registration error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid registration data'
        }));
      }
    });
    return;
  }

  // Get current user
  if (path === '/api/auth/me' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: {
        _id: 'demo-user-123',
        firstName: 'Welcome',
        lastName: 'Back',
        email: 'user@craftify.com',
        role: 'seller'
      }
    }));
    return;
  }

  // Get all users
  if (path === '/api/users' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      users: users,
      count: users.length
    }));
    return;
  }

  // Mock products endpoint
  if (path === '/api/products' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
    }));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    message: 'Route not found'
  }));
});

const PORT = 5000;

server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    return;
  }
  
  console.log('✅ Craftify Working Server running on http://localhost:5000');
  console.log('🔍 Health check: http://localhost:5000/api/health');
  console.log('🔐 Login endpoint: http://localhost:5000/api/auth/login');
  console.log('📝 Register endpoint: http://localhost:5000/api/auth/register');
  console.log('🛍️ Products endpoint: http://localhost:5000/api/products');
  console.log('👥 Users endpoint: http://localhost:5000/api/users');
  console.log('🎉 Ready for requests!');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log('🔄 Port 5000 is in use, trying port 5001...');
    server.listen(5001, () => {
      console.log('✅ Server running on http://localhost:5001 instead');
    });
  }
});

console.log('🔧 Server setup complete, starting...');
