const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

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

async function replicateAuthRoute() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database connection status:', mongoose.connection.readyState);

    // Create express app for testing
    const app = express();
    app.use(express.json());
    
    // Simulate the login route exactly as in the backend
    app.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
      try {
        console.log('=== REPLICATED LOGIN ATTEMPT ===');
        console.log('Request body:', req.body);
        console.log('Email provided:', req.body.email);
        console.log('Password provided:', req.body.password ? 'YES' : 'NO');
        
        const { email, password } = req.body;
        
        // Log database connection status
        console.log('Database connection status:', mongoose.connection.readyState);
        if (mongoose.connection.readyState !== 1) {
          console.log('❌ Database not connected!');
          return res.status(500).json({
            success: false,
            message: 'Database connection error'
          });
        }

        // Find user in MongoDB (include password for comparison)
        console.log('Looking up user in database...');
        console.log('Searching for email:', email.toLowerCase());
        
        // Try multiple search approaches
        const user1 = await User.findOne({ email: email.toLowerCase() }).select('+password');
        console.log('Method 1 result:', user1 ? 'Found' : 'Not found');
        
        if (!user1) {
          // Try case-insensitive search
          const user2 = await User.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') } 
          }).select('+password');
          console.log('Method 2 result:', user2 ? 'Found' : 'Not found');
          
          if (!user2) {
            // List all users to debug
            console.log('User not found. Listing all users:');
            const allUsers = await User.find({}).select('email');
            allUsers.forEach((u, i) => {
              console.log(`  ${i+1}. ${u.email}`);
            });
            
            console.log('❌ User not found - returning invalid credentials error');
            return res.status(401).json({
              success: false,
              message: 'Invalid email or password'
            });
          }
        }

        const user = user1; // Use the first result
        console.log('User lookup result:', user ? 'Found' : 'Not found');
        console.log('User email from DB:', user?.email);
        
        if (!user) {
          console.log('❌ User not found - returning invalid credentials error');
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Check if account is active
        if (!user.isActive) {
          console.log('❌ Account is deactivated');
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated. Please contact support.'
          });
        }

        // Compare password
        console.log('Comparing passwords...');
        console.log('Password provided length:', password.length);
        console.log('Stored password hash:', user.password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('❌ Password invalid - returning invalid credentials error');
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        console.log('✅ Login successful - generating token');
        
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
      
      console.log('\n=== Testing Replicated Login Route ===');
      console.log('Test data:', testData);
      
      // Create a mock request and response
      const req = {
        body: testData,
        headers: {}
      };
      
      let responseSent = false;
      let responseStatus = null;
      let responseData = null;
      
      const res = {
        status: function(code) {
          responseStatus = code;
          return this;
        },
        json: function(data) {
          responseSent = true;
          responseData = data;
          console.log(`Response Status: ${responseStatus}`);
          console.log('Response Data:', data);
        }
      };
      
      // Apply middleware in order
      let middlewareIndex = 0;
      const middlewares = [validateLogin, handleValidationErrors];
      
      const processMiddleware = async () => {
        if (middlewareIndex < middlewares.length) {
          const middleware = middlewares[middlewareIndex];
          middlewareIndex++;
          
          if (Array.isArray(middleware)) {
            // Process array of middleware functions
            for (const singleMiddleware of middleware) {
              await new Promise((resolve) => {
                singleMiddleware(req, res, resolve);
              });
              if (responseSent) return; // Stop if response was sent
            }
            await processMiddleware();
          } else {
            await new Promise((resolve) => {
              middleware(req, res, resolve);
            });
            if (responseSent) return; // Stop if response was sent
            await processMiddleware();
          }
        } else {
          // Run the main route handler
          await app.routes?.login?.(req, res);
        }
      };
      
      await processMiddleware();
      
      if (!responseSent) {
        // If no response was sent, run the main handler directly
        const loginHandler = app._router ? 
          app._router.stack.find(layer => layer.route)?.route.stack[0].handle : 
          null;
        
        if (loginHandler) {
          await loginHandler(req, res);
        } else {
          console.log('Could not find login route handler');
        }
      }
    };
    
    await testLogin();
    
  } catch (error) {
    console.error('Error during replicated auth route test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
replicateAuthRoute();