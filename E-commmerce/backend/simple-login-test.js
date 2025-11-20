const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

async function simpleLoginTest() {
  // Test data
  const req = {
    body: {
      email: 'admin@craftify.com',
      password: 'admin123'
    }
  };
  
  console.log('Testing validation with data:', req.body);
  
  // Apply validation middleware
  let validationPassed = true;
  let validationErrors = [];
  
  // Process each validation rule
  for (const validator of validateLogin) {
    await new Promise((resolve) => {
      const mockRes = {
        status: function() { return this; },
        json: function(data) {
          validationPassed = false;
          validationErrors.push(data);
          resolve();
        }
      };
      
      const mockNext = () => {
        resolve();
      };
      
      validator(req, mockRes, mockNext);
    });
  }
  
  if (validationPassed) {
    console.log('✅ Validation passed');
  } else {
    console.log('❌ Validation failed:', validationErrors);
    return;
  }
  
  // Test bcrypt comparison
  const testPassword = 'admin123';
  const storedHash = '$2a$12$q9key0bsefP2HfAbVUflVuMHIlFJ7.2ZpNN8tJAfELV08QIWfA4PK';
  
  console.log(`Testing bcrypt comparison with password: ${testPassword}`);
  console.log(`Stored hash: ${storedHash}`);
  
  const isMatch = await bcrypt.compare(testPassword, storedHash);
  console.log('Bcrypt comparison result:', isMatch);
  
  if (isMatch) {
    console.log('✅ Password comparison successful');
  } else {
    console.log('❌ Password comparison failed');
  }
}

// Run the test
simpleLoginTest();