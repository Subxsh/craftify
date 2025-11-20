const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
// Ensure models are registered
require('../src/models/Category');
require('../src/models/User');
const Product = require('../src/models/Product');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const filter = { status: 'active', isDeleted: false };
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerProfile.businessName sellerProfile.rating')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    console.log('Found products:', products.length);
    console.dir(products, { depth: 2 });
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
})();