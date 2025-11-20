const axios = require('axios');

// Test to debug image display issues
async function debugImageDisplay() {
  try {
    // Fetch all products
    const response = await axios.get('http://localhost:5000/api/products');
    
    console.log('API Response Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success && response.data.data.products.length > 0) {
      console.log(`Found ${response.data.data.products.length} products`);
      
      // Check the first few products
      for (let i = 0; i < Math.min(3, response.data.data.products.length); i++) {
        const product = response.data.data.products[i];
        console.log(`\n--- Product ${i + 1} ---`);
        console.log('Name:', product.name);
        console.log('ID:', product._id);
        console.log('Images array:', product.images);
        console.log('Images array length:', product.images?.length || 0);
        
        // Check if product has images
        if (product.images && product.images.length > 0) {
          const firstImage = product.images[0];
          console.log('First image object:', firstImage);
          console.log('First image URL:', firstImage.url);
          console.log('First image public_id:', firstImage.public_id);
          console.log('First image isMain:', firstImage.isMain);
        } else {
          console.log('No images found for this product');
        }
      }
    } else {
      console.log('No products found in response');
    }
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
  }
}

debugImageDisplay();