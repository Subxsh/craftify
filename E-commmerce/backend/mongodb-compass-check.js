const mongoose = require('mongoose');

async function checkMongoDBForCompass() {
  try {
    console.log('🔍 MongoDB Compass Verification');
    console.log('='.repeat(50));
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/craftify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database: craftify');
    console.log('📍 Host: localhost:27017');
    console.log('📍 Full URI: mongodb://localhost:27017/craftify');
    
    const db = mongoose.connection.db;
    
    // List all databases
    const admin = db.admin();
    const databases = await admin.listDatabases();
    console.log('\n📋 Available Databases:');
    databases.databases.forEach(database => {
      console.log(`  - ${database.name} (${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check current database
    console.log(`\n🎯 Current Database: ${db.databaseName}`);
    
    // List collections in craftify database
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in craftify database:');
    if (collections.length === 0) {
      console.log('  ⚠️ No collections found');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      }
    }
    
    // Detailed users check
    console.log('\n👥 Users Collection Details:');
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`  Total users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('\n📝 User Records:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user._id}`);
        console.log(`     Name: ${user.firstName} ${user.lastName}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Role: ${user.role}`);
        console.log(`     Created: ${user.createdAt || 'N/A'}`);
        console.log(`     Active: ${user.isActive}`);
        console.log('');
      });
    }
    
    // Products check
    console.log('📦 Products Collection Details:');
    const productsCollection = db.collection('products');
    const productCount = await productsCollection.countDocuments();
    console.log(`  Total products: ${productCount}`);
    
    console.log('\n🎯 MongoDB Compass Instructions:');
    console.log('1. Open MongoDB Compass');
    console.log('2. Connect to: mongodb://localhost:27017');
    console.log('3. Look for database: craftify');
    console.log('4. Click on "users" collection');
    console.log('5. Click "Refresh" button if data doesn\'t appear');
    console.log('6. You should see the users listed above');
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if MongoDB service is started');
    console.log('3. Try connecting to MongoDB Compass manually');
    console.log('4. Verify the connection string: mongodb://localhost:27017');
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

checkMongoDBForCompass();
