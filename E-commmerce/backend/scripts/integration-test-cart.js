const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

async function main() {
  try {
    console.log('\n=== Integration Test: login -> add to cart -> fetch cart ===\n');

    // Unique email to avoid conflicts
    const ts = Date.now();
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test+${ts}@example.com`,
      password: 'Password123!'
    };

    console.log('1) Registering test user:', testUser.email);
    const regRes = await axios.post(`${API}/auth/register`, testUser);
    if (!regRes.data || !regRes.data.success) {
      console.error('Registration failed:', regRes.data || regRes.statusText);
      process.exit(1);
    }

    const token = regRes.data.token;
    console.log('  -> Registered. Received token:', token ? 'yes' : 'no');

    // Get products and pick first
    console.log('\n2) Fetching products to select an item to add');
    const prodRes = await axios.get(`${API}/products`);
    if (!prodRes.data || !prodRes.data.success || !Array.isArray(prodRes.data.products)) {
      console.error('Failed to fetch products:', prodRes.data || prodRes.statusText);
      process.exit(1);
    }

    const products = prodRes.data.products;
    if (products.length === 0) {
      console.error('No products available to add to cart');
      process.exit(1);
    }

    const product = products[0];
    console.log(`  -> Selected product: ${product._id} - ${product.name} ($${product.price})`);

    // Add to cart using token from registration
    console.log('\n3) Adding product to cart');
    const addRes = await axios.post(`${API}/cart/add`, { productId: product._id, quantity: 1 }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!addRes.data || !addRes.data.success) {
      console.error('Add to cart failed:', addRes.data || addRes.statusText);
      process.exit(1);
    }

    console.log('  -> Add to cart response OK');

    // Fetch cart
    console.log('\n4) Fetching cart for the test user');
    const cartRes = await axios.get(`${API}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!cartRes.data || !cartRes.data.success) {
      console.error('Fetch cart failed:', cartRes.data || cartRes.statusText);
      process.exit(1);
    }

    const cart = cartRes.data.cart || cartRes.data.items || cartRes.data.data || cartRes.data;

    console.log('\n=== Test Results ===');

    if (cart && cart.items && cart.items.length > 0) {
      const found = cart.items.find(item => (item.product && item.product._id === product._id) || (item.productId === product._id));
      if (found) {
        console.log(`SUCCESS: Product ${product._id} present in cart (quantity: ${found.quantity || 'N/A'})`);
      } else {
        console.error('FAIL: Product not found in returned cart items');
      }
    } else if (Array.isArray(cartRes.data.items) && cartRes.data.items.length > 0) {
      const found = cartRes.data.items.find(i => i.product && i.product._id === product._id);
      if (found) {
        console.log(`SUCCESS: Product ${product._id} present in cart (quantity: ${found.quantity || 'N/A'})`);
      } else {
        console.error('FAIL: Product not found in returned cart.items');
      }
    } else {
      console.error('FAIL: Cart appears empty or shape unexpected:', JSON.stringify(cart, null, 2));
      process.exit(1);
    }

    console.log('\nIntegration test completed.');
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('HTTP Error:', err.response.status, err.response.data || err.response.statusText);
    } else {
      console.error('Error:', err.message || err);
    }
    process.exit(1);
  }
}

main();
