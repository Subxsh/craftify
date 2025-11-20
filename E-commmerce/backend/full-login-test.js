const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Validation middleware for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Sensitive operation limit middleware
const sensitiveOpLimit = (req, res, next) => {
  // Clear the sensitive operation store for testing
  global.sensitiveOpStore = new Map();
  next();
};

async function fullLoginTest() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create express app for testing
    const app = express();
    app.use(express.json());
    
    // Simulate the login route exactly as in the backend
    app.post('/login', validateLogin, handleValidationErrors, sensitiveOpLimit, async (req, res) => {
      try {
        const { email, password } = req.body;
        console.log('Login attempt with:', { email, password });

        // Find user in MongoDB (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        console.log('User lookup result:', user ? 'Found' : 'Not found');

        if (!user) {
          console.log('User not found in database');
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Check if account is active
        if (!user.isActive) {
          console.log('Account is deactivated');
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated. Please contact support.'
          });
        }

        // Compare password
        console.log('Comparing passwords...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('Password mismatch');
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        console.log('Login successful!');
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

    // Test the login route
    const testLogin = async () => {
      const testData = {
        email: 'admin@craftify.com',
        password: 'admin123'
      };
      
      console.log('\n=== Testing Login Route ===');
      console.log('Test data:', testData);
      
      // Create a mock request and response
      const req = {
        body: testData,
        headers: {}
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
          console.log(`Response Status: ${this.statusCode}`);
          console.log('Response Data:', data);
        }
      };
      
      // Process the login route
      await new Promise((resolve) => {
        // Apply middleware in order
        let index = 0;
        const middlewares = [validateLogin, handleValidationErrors, sensitiveOpLimit];
        
        const next = async () => {
          if (index < middlewares.length) {
            const middleware = middlewares[index];
            index++;
            
            if (Array.isArray(middleware)) {
              // Handle array of middleware functions
              let i = 0;
              const runArrayMiddleware = () => {
                if (i < middleware.length) {
                  middleware[i](req, res, () => {
                    i++;
                    runArrayMiddleware();
                  });
                } else {
                  next();
                }
              };
              runArrayMiddleware();
            } else {
              middleware(req, res, next);
            }
          } else {
            // Run the main route handler
            app._router && app._router.stack.find(layer => layer.route)?.route.stack[0].handle(req, res, resolve);
            // Or directly call our login handler
            const loginHandler = app._router ? 
              app._router.stack.find(layer => layer.route)?.route.stack[0].handle : 
              null;
            
            if (loginHandler) {
              loginHandler(req, res, resolve);
            } else {
              // Fallback to direct execution
              const loginRoute = app.routes?.login || 
                app._events?.request || 
                (() => console.log('Could not find login route'));
              resolve();
            }
          }
        };
        
        next();
      });
    };
    
    await testLogin();
    
  } catch (error) {
    console.error('Error during full login test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
fullLoginTest();