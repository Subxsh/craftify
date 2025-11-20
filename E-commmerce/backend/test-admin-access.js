const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

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

const testAdminAccess = async () => {
  await connectDB();
  
  try {
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@craftify.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:');
    console.log(`Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Active: ${adminUser.isActive}`);
    
    // Generate a JWT token for the admin user
    const payload = {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('\nGenerated JWT token:', token);
    
    // Test accessing the admin products endpoint
    console.log('\nTesting admin access to products...');
    
    // Simulate the admin route logic
    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerProfile.businessName sellerProfile.rating')
      .sort({ createdAt: -1 })
      .lean();
      
    console.log(`Found ${products.length} products for admin`);
    
    // Show first few products
    products.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price} - Status: ${product.status}`);
    });
    
    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error testing admin access:', error);
    mongoose.connection.close();
  }
};

testAdminAccess();