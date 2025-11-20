const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // 1) Create or get a verified seller
    let seller = await User.findOne({ email: 'seller@craftify.com' });
    if (!seller) {
      seller = await User.create({
        firstName: 'Demo',
        lastName: 'Seller',
        email: 'seller@craftify.com',
        password: 'seller123', // hashed by pre-save
        role: 'seller',
        sellerProfile: { isVerified: true }
      });
      console.log('Created seller user: seller@craftify.com / seller123');
    } else {
      // ensure verified seller
      seller.role = 'seller';
      seller.sellerProfile = seller.sellerProfile || {};
      seller.sellerProfile.isVerified = true;
      await seller.save();
      console.log('Using existing seller:', seller.email);
    }

    // 2) Ensure categories
    const catNames = ['Jewelry', 'Home Decor', 'Art & Prints'];
    const categories = {};
    for (const name of catNames) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({ name });
        console.log('Created category:', name);
      }
      categories[name] = cat;
    }

    // 3) Create sample products if none exist
    const existing = await Product.countDocuments({});
    if (existing === 0) {
      const samples = [
        {
          name: 'Handmade Silver Necklace',
          description: 'Elegant handmade silver necklace with intricate design.',
          price: 49.99,
          category: categories['Jewelry']._id,
          seller: seller._id,
          images: [{ public_id: 'sample1', url: '/uploads/1755665081272-116260199.png', alt: 'Necklace', isMain: true }],
          inventory: { quantity: 10 },
          status: 'active'
        },
        {
          name: 'Rustic Wooden Wall Art',
          description: 'Unique rustic wall art piece crafted from reclaimed wood.',
          price: 89.0,
          category: categories['Home Decor']._id,
          seller: seller._id,
          images: [{ public_id: 'sample2', url: '/uploads/1755669880989-488917829.png', alt: 'Wall Art', isMain: true }],
          inventory: { quantity: 5 },
          status: 'active'
        },
        {
          name: 'Watercolor Landscape Print',
          description: 'High-quality print of an original watercolor landscape.',
          price: 25.0,
          category: categories['Art & Prints']._id,
          seller: seller._id,
          images: [{ public_id: 'sample3', url: '/uploads/1755670026099-665740531.png', alt: 'Watercolor', isMain: true }],
          inventory: { quantity: 20 },
          status: 'active'
        }
      ];

      await Product.insertMany(samples);
      console.log('Inserted sample products');
    } else {
      console.log(`Products already exist: ${existing}`);
    }

    console.log('Seeding done');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();