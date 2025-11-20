const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkAdmin = async () => {
  await connectDB();
  
  try {
    // Find admin users
    const admins = await User.find({ role: 'admin' });
    console.log(`Found ${admins.length} admin users:`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.firstName} ${admin.lastName} - ${admin.email} - Role: ${admin.role} - Active: ${admin.isActive}`);
    });
    
    // Find the specific admin user
    const adminUser = await User.findOne({ email: 'admin@craftify.com' });
    if (adminUser) {
      console.log('\nSpecific admin user found:');
      console.log(`Name: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`Active: ${adminUser.isActive}`);
      console.log(`Password hash: ${adminUser.password}`);
    } else {
      console.log('\nAdmin user with email admin@craftify.com not found');
    }
    
    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking admin users:', error);
    mongoose.connection.close();
  }
};

checkAdmin();