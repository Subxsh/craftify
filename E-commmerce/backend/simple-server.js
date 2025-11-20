const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// In-memory user storage
let users = [];
let userCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Craftify Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint - very simple validation
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  
  const { firstName, lastName, email, password, role } = req.body;
  
  // Simple validation
  if (!firstName || firstName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'First name must be at least 2 characters'
    });
  }
  
  if (!lastName || lastName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Last name must be at least 2 characters'
    });
  }
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
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
  
  // Generate simple token (just user ID for demo)
  const token = `token_${user._id}_${Date.now()}`;
  
  console.log('User registered successfully:', user);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    token,
    user
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Find user (for demo, any password works)
  const user = users.find(user => user.email === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Generate simple token
  const token = `token_${user._id}_${Date.now()}`;
  
  console.log('User logged in successfully:', user);
  
  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Extract user ID from token (simple demo implementation)
  const tokenParts = token.split('_');
  if (tokenParts.length < 2) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  const userId = parseInt(tokenParts[1]);
  const user = users.find(user => user._id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    user
  });
});

// List all users (for debugging)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users,
    count: users.length
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('🚀 Craftify Simple Backend Server Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users list: http://localhost:${PORT}/api/users`);
  console.log('✅ Ready to accept registration requests!');
});
