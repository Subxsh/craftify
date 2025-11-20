const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftify';

// Product schema (simplified)
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: mongoose.Schema.Types.ObjectId,
  seller: mongoose.Schema.Types.ObjectId,
  status: String,
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count all products
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in database: ${totalProducts}`);

    // Count active products
    const activeProducts = await Product.countDocuments({ status: 'active', isDeleted: false });
    console.log(`Active products: ${activeProducts}`);

    // Count all products (including deleted)
    const allProducts = await Product.find();
    console.log(`All products:`);
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.status} - ${product.isDeleted ? 'Deleted' : 'Active'}`);
    });

  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
checkProducts();
