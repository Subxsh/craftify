const axios = require('axios');

// Test adding a product to cart
async function testAddToCart() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'subashperiyasamy25@gmail.com',
      password: 'subash25'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');
    
    // Get products
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    const products = productsResponse.data.data.products;
    
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    const product = products[0];
    console.log('Using product:', product.name, product._id);
    
    // Add product to cart
    const cartResponse = await axios.post('http://localhost:5000/api/cart/add', 
      { productId: product._id, quantity: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Add to cart response:', cartResponse.data);
    
    if (cartResponse.data.success) {
      console.log('✅ Product added to cart successfully!');
      console.log('Cart total items:', cartResponse.data.cart.totalItems);
      console.log('Cart total amount:', cartResponse.data.cart.totalAmount);
    } else {
      console.log('❌ Failed to add product to cart');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAddToCart();