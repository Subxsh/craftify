const mongoose = require('mongoose');

// MongoDB Connection Test
const MONGODB_URI = 'mongodb://localhost:27017/craftify';

async function testMongoDB() {
  try {
    console.log('🔍 Testing MongoDB Connection...');
    console.log('📍 URI:', MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check users collection
    if (collections.find(c => c.name === 'users')) {
      const usersCount = await db.collection('users').countDocuments();
      console.log(`\n👥 Users in database: ${usersCount}`);
      
      if (usersCount > 0) {
        const users = await db.collection('users').find({}).toArray();
        console.log('\n📝 User details:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
        });
      }
    } else {
      console.log('\n⚠️ No users collection found');
    }
    
    // Check products collection
    if (collections.find(c => c.name === 'products')) {
      const productsCount = await db.collection('products').countDocuments();
      console.log(`\n📦 Products in database: ${productsCount}`);
    } else {
      console.log('\n⚠️ No products collection found');
    }
    
    // Test creating a sample user
    console.log('\n🧪 Testing user creation...');
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@mongodb.com',
      password: 'hashedpassword123',
      role: 'buyer',
      isActive: true,
      createdAt: new Date()
    };
    
    // Check if test user already exists
    const existingUser = await db.collection('users').findOne({ email: testUser.email });
    if (existingUser) {
      console.log('⚠️ Test user already exists, skipping creation');
    } else {
      const result = await db.collection('users').insertOne(testUser);
      console.log('✅ Test user created with ID:', result.insertedId);
      
      // Verify the user was created
      const createdUser = await db.collection('users').findOne({ _id: result.insertedId });
      console.log('✅ Verified user creation:', createdUser.email);
    }
    
    console.log('\n🎉 MongoDB test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the test
testMongoDB();
