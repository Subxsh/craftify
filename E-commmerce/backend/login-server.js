console.log('🚀 Starting Craftify Login Server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Craftify server is running!',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const loginData = JSON.parse(body);
        console.log('📧 Login attempt for:', loginData.email);
        
        // For now, accept any login to get you back in
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful!',
          token: 'temp-token-' + Date.now(),
          user: {
            _id: 'temp-user-id',
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
  
  if (req.url === '/api/auth/me' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: {
        _id: 'temp-user-id',
        firstName: 'Welcome',
        lastName: 'Back',
        email: 'user@craftify.com',
        role: 'seller'
      }
    }));
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    message: 'Route not found'
  }));
});

const PORT = 5000;
server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
  console.log(`✅ Craftify server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log('📝 You can now try to login with any email/password!');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('❌ Server error:', err);
  }
});

console.log('🔧 Server setup complete, attempting to start...');
