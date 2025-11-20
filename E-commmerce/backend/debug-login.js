const bcrypt = require('bcryptjs');
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

async function debugLogin() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@craftify.com';
    const password = 'admin123';
    
    console.log(`Looking for user with email: ${email}`);
    
    // Find user in MongoDB (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found in database');
    console.log('User ID:', user._id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);
    console.log('Password hash:', user.password);
    
    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      return;
    }
    
    console.log(`\nComparing password: ${password}`);
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password does not match');
      return;
    }
    
    console.log('✅ Password matches! Login should be successful');

  } catch (error) {
    console.error('Error during login debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
debugLogin();