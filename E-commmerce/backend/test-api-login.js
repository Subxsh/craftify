const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API directly...');
    
    const loginData = {
      email: 'admin@craftify.com',
      password: 'admin123'
    };
    
    console.log('Sending login request with:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('Login failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
  }
}

testLogin();