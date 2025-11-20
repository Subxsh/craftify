const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Product = require('../src/models/Product');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const res1 = await Product.updateMany({}, { $set: { status: 'active', isDeleted: false } });
    console.log('Set active/not-deleted:', res1.modifiedCount || res1.nModified || 0);

    const res2 = await Product.updateMany(
      { $or: [ { 'inventory.quantity': { $exists: false } }, { 'inventory.quantity': null }, { 'inventory.quantity': { $lt: 1 } } ] },
      { $set: { 'inventory.quantity': 5 } }
    );
    console.log('Fixed inventory quantities:', res2.modifiedCount || res2.nModified || 0);

  } catch (err) {
    console.error('Normalize error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
})();