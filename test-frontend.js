const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test the frontend form submission with image upload
async function testFrontendSubmission() {
  try {
    // First, login to get a valid token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser3@example.com',
      password: 'TestPass123'
    });

    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Simulate what the frontend sends with an image
    const formData = new FormData();
    formData.append('name', 'Test Product with Image ' + Date.now());
    formData.append('description', 'This is a test product with an image uploaded to simulate frontend submission with a longer description to meet validation requirements');
    formData.append('price', '29.99');
    formData.append('category', 'Jewelry');
    formData.append('quantity', '10');
    formData.append('materials', 'Gold, Silver');
    formData.append('techniques', 'Handcrafted');
    formData.append('customizationOptions', 'Size, Color');
    
    // Add a test image file
    formData.append('images', fs.createReadStream('test-image.txt'));

    console.log('Sending form data with image...');
    
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

testFrontendSubmission();