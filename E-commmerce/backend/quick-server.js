const http = require('http');
const url = require('url');

console.log('🚀 Starting Craftify Quick Server...');

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

        // Accept any login
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful!',
          token: 'quick-token-' + Date.now(),
          user: {
            _id: 'quick-user-' + Date.now(),
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

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Registration successful!',
          token: 'quick-token-' + Date.now(),
          user: {
            _id: 'quick-user-' + Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role || 'buyer'
          }
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
        _id: 'quick-user-123',
        firstName: 'Welcome',
        lastName: 'Back',
        email: 'user@craftify.com',
        role: 'seller'
      }
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
          name: 'Sample Product',
          description: 'This is a sample product',
          price: 29.99,
          category: 'Art & Prints',
          inventory: { quantity: 10 },
          images: []
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
    if (err.code === 'EADDRINUSE') {
      console.log('🔄 Port 5000 is in use, trying port 5001...');
      server.listen(5001, () => {
        console.log('✅ Craftify Quick Server running on http://localhost:5001');
        console.log('🔍 Health check: http://localhost:5001/api/health');
        console.log('🔐 Ready for login attempts!');
      });
    }
    return;
  }
  
  console.log('✅ Craftify Quick Server running on http://localhost:5000');
  console.log('🔍 Health check: http://localhost:5000/api/health');
  console.log('🔐 Ready for login attempts!');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`🔄 Port ${PORT} is in use, trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('❌ Server error:', err);
  }
});

console.log('🔧 Server setup complete, starting...');
