const axios = require('axios');
const FormData = require('form-data');

// Test product creation with user registration and login
async function testProductCreation() {
  try {
    // First, register a new user
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser3@example.com',
      password: 'TestPass123',
      role: 'seller'
    });

    console.log('Registration successful');

    // Then login to get a valid token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser3@example.com',
      password: 'TestPass123'
    });

    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Now create a product with a unique name
    const formData = new FormData();
    formData.append('name', 'Test Product ' + Date.now());
    formData.append('description', 'This is a test product with a longer description to meet the minimum requirements for validation');
    formData.append('price', '29.99');
    formData.append('category', 'Jewelry');
    formData.append('quantity', '5');

    const response = await axios.post('http://localhost:5000/api/products', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('Product created successfully:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testProductCreation();