const { body, validationResult } = require('express-validator');

// Test email normalization
async function testEmailNormalization() {
  const testEmail = 'admin@craftify.com';
  
  console.log('Original email:', testEmail);
  
  // Create a mock request
  const req = {
    body: {
      email: testEmail,
      password: 'admin123'
    }
  };
  
  // Apply the same validation as in the login route
  const validateLogin = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
  
  // Process validation
  for (const validator of validateLogin) {
    await new Promise((resolve) => {
      const mockRes = {
        status: function() { return this; },
        json: function() { resolve(); }
      };
      
      const mockNext = () => {
        resolve();
      };
      
      validator(req, mockRes, mockNext);
    });
  }
  
  console.log('After normalization:', req.body.email);
  console.log('Lowercase version:', req.body.email.toLowerCase());
  
  // Check if they're different
  if (req.body.email !== testEmail) {
    console.log('⚠️  Email was modified by normalization!');
  }
  
  if (req.body.email.toLowerCase() !== req.body.email) {
    console.log('⚠️  Normalized email is not lowercase!');
  }
}

testEmailNormalization();