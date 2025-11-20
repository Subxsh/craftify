const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Ensure demo seller exists
    let seller = await User.findOne({ email: 'seller@craftify.com' });
    if (!seller) {
      seller = await User.create({
        firstName: 'Demo',
        lastName: 'Seller',
        email: 'seller@craftify.com',
        password: 'seller123',
        role: 'seller',
        sellerProfile: { isVerified: true }
      });
      console.log('Created demo seller');
    }

    // Map string categories to Category IDs
    const stringCats = await Product.distinct('category', { category: { $type: 'string' } });
    console.log('String categories found:', stringCats);

    for (const name of stringCats) {
      if (!name || typeof name !== 'string') continue;
      const trimmed = name.trim();
      let cat = await Category.findOne({ name: trimmed });
      if (!cat) {
        cat = await Category.create({ name: trimmed });
        console.log('Created category:', trimmed);
      }
      const res = await Product.updateMany({ category: name }, { $set: { category: cat._id } });
      console.log(`Remapped products for category "${trimmed}":`, res.modifiedCount || res.nModified || 0);
    }

    // Ensure seller field exists
    const resSeller = await Product.updateMany(
      { $or: [ { seller: { $exists: false } }, { seller: null } ] },
      { $set: { seller: seller._id } }
    );
    console.log('Set missing sellers:', resSeller.modifiedCount || resSeller.nModified || 0);

    // Ensure images array exists; if missing or empty, set default
    const fallbackImage = '/uploads/1755665081272-116260199.png';
    const resImages1 = await Product.updateMany(
      { $or: [ { images: { $exists: false } }, { images: { $size: 0 } } ] },
      { $set: { images: [{ public_id: 'fallback', url: fallbackImage, alt: 'image', isMain: true }] } }
    );
    console.log('Set fallback images:', resImages1.modifiedCount || resImages1.nModified || 0);

    // For any image missing fields, set defaults using positional updates is complex; skip for now.

    // Ensure status, flags, and inventory quantity
    const resStatus = await Product.updateMany({}, { $set: { status: 'active', isDeleted: false } });
    console.log('Set status/isDeleted:', resStatus.modifiedCount || resStatus.nModified || 0);

    const resInv = await Product.updateMany(
      { $or: [ { 'inventory.quantity': { $exists: false } }, { 'inventory.quantity': null }, { 'inventory.quantity': { $lt: 1 } } ] },
      { $set: { 'inventory.quantity': 5 } }
    );
    console.log('Ensured inventory quantities:', resInv.modifiedCount || resInv.nModified || 0);

    console.log('Bulk fix complete');
  } catch (err) {
    console.error('Bulk fix error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
})();