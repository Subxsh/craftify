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
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    serverUptime: process.uptime()
  });
});

// Register endpoint with ultra-simple validation
app.post('/api/auth/register', (req, res) => {
  console.log('=== REGISTRATION REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { firstName, lastName, email, password, role } = req.body;
  
  // Ultra-simple validation with clear error messages
  if (!firstName) {
    console.log('ERROR: Missing firstName');
    return res.status(400).json({
      success: false,
      message: 'First name is required'
    });
  }
  
  if (firstName.length < 2) {
    console.log('ERROR: firstName too short');
    return res.status(400).json({
      success: false,
      message: 'First name must be at least 2 characters'
    });
  }
  
  if (!lastName) {
    console.log('ERROR: Missing lastName');
    return res.status(400).json({
      success: false,
      message: 'Last name is required'
    });
  }
  
  if (lastName.length < 2) {
    console.log('ERROR: lastName too short');
    return res.status(400).json({
      success: false,
      message: 'Last name must be at least 2 characters'
    });
  }
  
  if (!email) {
    console.log('ERROR: Missing email');
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  if (!email.includes('@')) {
    console.log('ERROR: Invalid email format');
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  if (!password) {
    console.log('ERROR: Missing password');
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  if (password.length < 6) {
    console.log('ERROR: Password too short');
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email.toLowerCase());
  if (existingUser) {
    console.log('ERROR: User already exists');
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

  console.log('User added to array. Current users count:', users.length);
  console.log('All users in array:', JSON.stringify(users, null, 2));

  // Generate simple token
  const token = `token_${user._id}_${Date.now()}`;

  console.log('SUCCESS: User registered:', user);
  console.log('Token generated:', token);
  console.log('=== END REGISTRATION ===');
  
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('=== LOGIN REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  // Find user (for demo, any password works if user exists)
  const user = users.find(user => user.email === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No account found with this email address'
    });
  }
  
  // Generate simple token
  const token = `token_${user._id}_${Date.now()}`;
  
  console.log('SUCCESS: User logged in:', user);
  console.log('=== END LOGIN ===');
  
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
      message: 'No authentication token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Extract user ID from token
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

// List all users (for debugging)
app.get('/api/users', (req, res) => {
  console.log('=== USERS LIST REQUEST ===');
  console.log('Current users array:', JSON.stringify(users, null, 2));
  console.log('Users count:', users.length);
  console.log('=== END USERS LIST ===');

  res.json({
    success: true,
    users,
    count: users.length,
    message: users.length === 0 ? 'No users registered yet' : `Found ${users.length} registered users`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('🚀 ULTRA-SIMPLE CRAFTIFY BACKEND STARTED!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log('✅ Ready for registration!');
  console.log('');
  console.log('📋 VALIDATION RULES:');
  console.log('- First Name: 2+ characters');
  console.log('- Last Name: 2+ characters');
  console.log('- Email: must contain @');
  console.log('- Password: 6+ characters');
  console.log('');
});
