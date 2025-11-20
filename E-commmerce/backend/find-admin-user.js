const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

async function findAdminUser() {
  try {
    // Connect to database
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n=== Collections ===');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check each collection for users
    for (const collection of collections) {
      if (collection.name.includes('user') || collection.name.includes('User')) {
        console.log(`\n=== Checking collection: ${collection.name} ===`);
        const UserCollection = conn.connection.db.collection(collection.name);
        const users = await UserCollection.find({}).toArray();
        
        console.log(`Found ${users.length} users in ${collection.name}`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.firstName || user.name || 'N/A'} ${user.lastName || ''}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role || 'N/A'}`);
          if (user.email === 'admin@craftify.com') {
            console.log('   🎯 THIS IS OUR ADMIN USER!');
          }
          console.log('-------------------');
        });
      }
    }
    
    // Also check the specific User model collection
    console.log('\n=== Checking User model collection ===');
    const User = require('./src/models/User');
    const users = await User.find({}).select('+password');
    
    console.log(`Found ${users.length} users in User model`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      if (user.email === 'admin@craftify.com') {
        console.log('   🎯 THIS IS OUR ADMIN USER!');
        console.log(`   Password hash: ${user.password}`);
      }
      console.log('-------------------');
    });

  } catch (error) {
    console.error('Error finding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
findAdminUser();