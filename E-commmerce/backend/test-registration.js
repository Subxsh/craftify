const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing Registration Endpoint...');
    
    const testUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'password123',
      role: 'buyer'
    };
    
    console.log('📝 Sending registration request...');
    console.log('Data:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test login with the same user
    console.log('\n🔐 Testing Login...');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test users endpoint
async function testUsersEndpoint() {
  try {
    console.log('\n👥 Testing Users Endpoint...');
    const response = await axios.get('http://localhost:5000/api/users');
    console.log('Users Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Users endpoint failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testRegistration();
  await testUsersEndpoint();
}

runTests();
