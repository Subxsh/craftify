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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function testLogin() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const user = await User.findOne({ email: 'admin@craftify.com' }).select('+password');
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('User found:');
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password hash: ${user.password}`);
    
    // Test password comparison
    const testPassword = 'admin123';
    console.log(`\nTesting password: ${testPassword}`);
    
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Password match: ${isMatch}`);
    
    if (isMatch) {
      console.log('✅ Login would be successful with these credentials');
    } else {
      console.log('❌ Login would fail - password mismatch');
    }

  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
testLogin();