const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Category = require('../src/models/Category');
const User = require('../src/models/User');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCol = db.collection('products');

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

    const fallbackImage = '/uploads/1755665081272-116260199.png';

    // Cursor over problematic docs via raw collection (no schema casting)
    const cursor = productsCol.find({
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

    let processed = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const update = { $set: {} };

      // Category: if string, map to Category _id
      if (typeof doc.category === 'string') {
        const name = doc.category.trim();
        let cat = await Category.findOne({ name });
        if (!cat) cat = await Category.create({ name });
        update.$set.category = cat._id;
      }

      // Seller
      if (!doc.seller) {
        update.$set.seller = seller._id;
      }

      // Images
      if (!Array.isArray(doc.images) || doc.images.length === 0) {
        update.$set.images = [{ public_id: 'fallback', url: fallbackImage, alt: doc.name || 'image', isMain: true }];
      } else {
        // Ensure first image has required fields
        const imgs = doc.images.map((img, idx) => ({
          public_id: img.public_id || `fallback_${doc._id}_${idx}`,
          url: img.url || fallbackImage,
          alt: img.alt || doc.name || 'image',
          isMain: idx === 0 ? true : !!img.isMain
        }));
        update.$set.images = imgs;
      }

      // Status/flags/inventory
      update.$set.status = 'active';
      update.$set.isDeleted = false;
      if (!doc.inventory || doc.inventory.quantity == null || doc.inventory.quantity < 1) {
        update.$set['inventory'] = Object.assign({}, doc.inventory, { quantity: 5 });
      }

      await productsCol.updateOne({ _id: doc._id }, update);
      processed++;
    }

    console.log('Processed products:', processed);
  } catch (err) {
    console.error('Raw fix error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
})();