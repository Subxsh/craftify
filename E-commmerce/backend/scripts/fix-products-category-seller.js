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

    // Ensure demo seller exists and is verified
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
    } else {
      seller.role = 'seller';
      seller.sellerProfile = seller.sellerProfile || {};
      seller.sellerProfile.isVerified = true;
      await seller.save();
      console.log('Using existing seller');
    }

    // Find products needing fixes
    const products = await Product.find({
      $or: [
        { category: { $type: 'string' } },
        { seller: { $exists: false } },
        { seller: null },
        { status: { $ne: 'active' } },
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { 'images.0.public_id': { $exists: false } },
        { 'images.0.url': { $exists: false } }
      ]
    });

    console.log('Products to fix:', products.length);

    const fallbackImage = '/uploads/1755665081272-116260199.png';

    let fixed = 0;
    for (const p of products) {
      // Fix category if it's a string name
      if (typeof p.category === 'string') {
        const name = p.category.trim();
        let cat = await Category.findOne({ name });
        if (!cat) {
          cat = await Category.create({ name });
          console.log('Created missing category:', name);
        }
        p.category = cat._id;
      }

      // Fix seller
      if (!p.seller) {
        p.seller = seller._id;
      }

      // Fix images
      if (!Array.isArray(p.images) || p.images.length === 0) {
        p.images = [{ public_id: `fixed_${p._id}`, url: fallbackImage, alt: p.name, isMain: true }];
      } else {
        p.images = p.images.map((img, idx) => ({
          public_id: img.public_id || `fixed_${p._id}_${idx}`,
          url: img.url || fallbackImage,
          alt: img.alt || p.name,
          isMain: idx === 0 ? true : !!img.isMain
        }));
      }

      // Ensure status/flags and inventory
      p.status = 'active';
      p.isDeleted = false;
      if (!p.inventory) p.inventory = { quantity: 5 };
      if (p.inventory.quantity == null || p.inventory.quantity < 1) p.inventory.quantity = 5;

      await p.save();
      fixed++;
    }

    console.log('Fixed products:', fixed);
  } catch (err) {
    console.error('Fix error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
})();