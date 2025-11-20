const express = require('express');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory user storage
let users = [];
let userCounter = 1;

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Craftify Backend API',
    status: 'running',
    endpoints: [
      'GET /api/health',
      'GET /api/users',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    message: 'Craftify Backend is running!',
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    serverUptime: process.uptime(),
    port: 5000
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('\n=== REGISTRATION REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const { firstName, lastName, email, password, role } = req.body;
  
  // Simple validation
  if (!firstName || firstName.length < 2) {
    console.log('❌ Validation failed: firstName');
    return res.status(400).json({
      success: false,
      message: 'First name must be at least 2 characters'
    });
  }
  
  if (!lastName || lastName.length < 2) {
    console.log('❌ Validation failed: lastName');
    return res.status(400).json({
      success: false,
      message: 'Last name must be at least 2 characters'
    });
  }
  
  if (!email || !email.includes('@')) {
    console.log('❌ Validation failed: email');
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  if (!password || password.length < 6) {
    console.log('❌ Validation failed: password');
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Check if user exists
  const existingUser = users.find(user => user.email === email.toLowerCase());
  if (existingUser) {
    console.log('❌ User already exists');
    return res.status(400).json({
      success: false,
      message: 'A user with this email already exists'
    });
  }
  
  // Create user
  const user = {
    _id: userCounter++,
    firstName,
    lastName,
    email: email.toLowerCase(),
    role: role || 'buyer',
    createdAt: new Date()
  };
  
  users.push(user);
  
  console.log('✅ User created successfully:', user);
  console.log('📊 Total users now:', users.length);
  
  // Generate token
  const token = `token_${user._id}_${Date.now()}`;
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user
  });
  
  console.log('=== END REGISTRATION ===\n');
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('\n=== LOGIN REQUEST ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  const user = users.find(user => user.email === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No account found with this email address'
    });
  }
  
  const token = `token_${user._id}_${Date.now()}`;
  
  console.log('✅ Login successful for:', user.email);
  
  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user
  });
  
  console.log('=== END LOGIN ===\n');
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('_');
  
  if (tokenParts.length < 2) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
  
  const userId = parseInt(tokenParts[1]);
  const user = users.find(user => user._id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found'
    });
  }
  
  res.json({
    success: true,
    user
  });
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  console.log('📋 Users list requested');
  console.log('Current users:', users.length);
  
  res.json({
    success: true,
    users,
    count: users.length,
    message: users.length === 0 ? 'No users registered yet' : `Found ${users.length} registered users`
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

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 CRAFTIFY BACKEND SERVER STARTED!');
  console.log('='.repeat(50));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users List: http://localhost:${PORT}/api/users`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
  console.log('='.repeat(50));
  console.log('✅ Ready to accept requests!');
  console.log('\n📋 API ENDPOINTS:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/users');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me');
  console.log('\n📝 VALIDATION RULES:');
  console.log('  - First Name: 2+ characters');
  console.log('  - Last Name: 2+ characters');
  console.log('  - Email: must contain @');
  console.log('  - Password: 6+ characters');
  console.log('\n🎯 Waiting for requests...\n');
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Server shutting down gracefully...');
  process.exit(0);
});
