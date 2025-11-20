const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

async function testAuthRoute() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database connection status:', mongoose.connection.readyState);

    const email = 'admin@craftify.com';
    const password = 'admin123';
    
    console.log(`\n=== Testing Auth Route Logic ===`);
    console.log('Email to search:', email);
    console.log('Email to search (lowercase):', email.toLowerCase());
    
    // Replicate exactly what the auth route does
    console.log('\n1. Using User.findOne with email.toLowerCase():');
    const user1 = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('Result:', user1 ? 'Found' : 'Not found');
    if (user1) {
      console.log('Email from DB:', user1.email);
      console.log('Password hash:', user1.password);
    }
    
    console.log('\n2. Using User.findOne with regex case-insensitive:');
    const user2 = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password');
    console.log('Result:', user2 ? 'Found' : 'Not found');
    if (user2) {
      console.log('Email from DB:', user2.email);
      console.log('Password hash:', user2.password);
    }
    
    console.log('\n3. Using User.find to list all users:');
    const allUsers = await User.find({}).select('email role');
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`  ${index+1}. ${user.email} (${user.role})`);
      if (user.email === email) {
        console.log('     🎯 This is our target user!');
      }
    });
    
    // Test password comparison if we found the user
    if (user1) {
      console.log('\n4. Testing password comparison:');
      console.log('Password provided:', password);
      console.log('Password hash from DB:', user1.password);
      const isPasswordValid = await bcrypt.compare(password, user1.password);
      console.log('Password comparison result:', isPasswordValid);
    }

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
testAuthRoute();