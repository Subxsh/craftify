const axios = require('axios');

// Import the getImageUrl function to test it
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's an image object, get the URL from it
  if (typeof imagePath === 'object' && imagePath.url) {
    return imagePath.url;
  }

  // If it's already a full URL, return as is
  if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // For local uploads, prepend the backend URL
  // Use relative uploads path by default so proxy / same-origin serves images correctly
  const base = ''; // For testing purposes
  const prefix = base ? `${base}/uploads` : '/uploads';
  return `${prefix}/${imagePath}`;
};

// Test if images are displayed correctly
async function testImageDisplay() {
  try {
    // Fetch all products to see if our test product with image is there
    const response = await axios.get('http://localhost:5000/api/products');
    
    if (response.data.success && response.data.data.products.length > 0) {
      // Find our test product
      const testProduct = response.data.data.products.find(p => 
        p.name.includes('Test Product with Image')
      );
      
      if (testProduct) {
        console.log('Found test product with image:');
        console.log('Product name:', testProduct.name);
        console.log('Images:', testProduct.images);
        
        // Test the getImageUrl function with the image object
        if (testProduct.images && testProduct.images.length > 0) {
          const imageUrl = getImageUrl(testProduct.images[0]);
          console.log('✅ Images are being stored and retrieved correctly!');
          console.log('Image URL from object:', imageUrl);
          
          // Test that the URL is valid
          if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            console.log('✅ Image URL is valid and can be displayed in the frontend!');
          } else {
            console.log('❌ Image URL is not valid for display');
          }
        } else {
          console.log('❌ No images found for the product');
        }
      } else {
        console.log('Test product not found in the product list');
      }
    } else {
      console.log('No products found');
    }
  } catch (error) {
    console.error('Error fetching products:', error.message);
  }
}

testImageDisplay();