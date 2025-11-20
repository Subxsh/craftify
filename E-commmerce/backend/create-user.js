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

async function createUser() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // New admin user details
    const userData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@craftify.com',
      password: 'admin123',
      role: 'admin'  // Changed from 'seller' to 'admin'
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`❌ User already exists with email: ${userData.email}`);
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create new admin user
    const newUser = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: userData.role
    });

    await newUser.save();

    console.log('✅ New admin user created successfully!');
    console.log(`📧 Email: ${userData.email}`);
    console.log(`🔑 Password: ${userData.password}`);
    console.log(`👤 Role: ${userData.role}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createUser();