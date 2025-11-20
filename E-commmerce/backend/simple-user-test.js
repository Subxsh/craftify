const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

async function simpleUserTest() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database connection status:', mongoose.connection.readyState);

    const email = 'admin@craftify.com';
    
    console.log('\n=== Simple User Test ===');
    console.log('Searching for email:', email);
    console.log('Searching for email (lowercase):', email.toLowerCase());
    
    // Test 1: Direct import usage
    console.log('\n1. Using User model directly (as in auth route):');
    const user1 = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('Result:', user1 ? 'Found' : 'Not found');
    if (user1) {
      console.log('Email from DB:', user1.email);
    }
    
    // Test 2: Check if User is the same model
    console.log('\n2. User model info:');
    console.log('User model name:', User.modelName);
    console.log('User collection name:', User.collection.name);
    
    // Test 3: List all users with direct query
    console.log('\n3. Listing all users with direct query:');
    const allUsers = await User.find({}).select('email role');
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`  ${index+1}. ${user.email} (${user.role})`);
      if (user.email === email) {
        console.log('     🎯 This is our target user!');
      }
    });

  } catch (error) {
    console.error('Error in simple user test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
simpleUserTest();