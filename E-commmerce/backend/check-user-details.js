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

async function checkUserDetails() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const user = await User.findOne({ email: 'admin@craftify.com' }).select('+password');
    
    if (!user) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ User found in database');
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);
    console.log('Created At:', user.createdAt);
    console.log('Password Hash:', user.password);
    
    // Check if account is active
    if (!user.isActive) {
      console.log('⚠️  Account is deactivated');
    }

  } catch (error) {
    console.error('Error checking user details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
checkUserDetails();