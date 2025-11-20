console.log('Starting debug server...');

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
      message: 'Debug server is running!',
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
      console.log('Login request body:', body);
      
      // Simple mock login - any email/password works
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Login successful (debug mode)',
        token: 'debug-token-123',
        user: {
          _id: '1',
          firstName: 'Debug',
          lastName: 'User',
          email: 'debug@test.com',
          role: 'seller'
        }
      }));
    });
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    message: 'Route not found'
  }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Debug server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log('✅ Ready for login attempts!');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Debug server setup complete.');
