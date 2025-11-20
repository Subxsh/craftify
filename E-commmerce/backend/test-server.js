const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory storage
let users = [];
let userIdCounter = 1;

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Craftify API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple validation function
const validateRegistration = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Please provide a valid email');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return errors;
};

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'buyer' } = req.body;

    // Validate input
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if user exists
    const existingUser = users.find(user => user.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      _id: userIdCounter++,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      'craftify_secret_key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(user => user.email === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      'craftify_secret_key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user route
app.get('/api/auth/me', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, 'craftify_secret_key');
    const user = users.find(user => user._id === decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Craftify Backend Server running on port ${PORT}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 CORS enabled for: http://localhost:3000`);
});
