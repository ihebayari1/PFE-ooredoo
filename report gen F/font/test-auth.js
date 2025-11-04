// Test script to create a test user and verify authentication
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:8080/api/v1';

// Test user data
const testUser = {
  firstname: 'Test',
  lastname: 'User',
  email: 'test@example.com',
  password: 'password123',
  pinHash: '1234',
  userType: 'INTERNAL'
};

const loginData = {
  email: 'test@example.com',
  password: 'password123'
};

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData,
            rawData: responseData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: responseData
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuthentication() {
  console.log('🔍 Testing Authentication System...\n');
  
  try {
    // 1. Test backend connectivity
    console.log('1. Testing backend connectivity...');
    try {
      const healthCheck = await makeRequest(`${BASE_URL}/auth/`);
      console.log(`   ✅ Backend is accessible (Status: ${healthCheck.status})`);
    } catch (error) {
      console.log(`   ❌ Backend connectivity failed: ${error.message}`);
      console.log('\n   Possible solutions:');
      console.log('   - Start the backend server: mvn spring-boot:run');
      console.log('   - Check if PostgreSQL is running');
      console.log('   - Verify database connection settings');
      return;
    }

    // 2. Test user registration
    console.log('\n2. Testing user registration...');
    try {
      const registerResponse = await makeRequest(`${BASE_URL}/auth/register`, 'POST', testUser);
      if (registerResponse.status === 202) {
        console.log('   ✅ User registration successful');
        console.log('   📧 Check your email for activation code');
      } else {
        console.log(`   ⚠️  Registration response: ${registerResponse.status}`);
        console.log(`   Response: ${registerResponse.rawData}`);
      }
    } catch (error) {
      console.log(`   ❌ Registration failed: ${error.message}`);
    }

    // 3. Test login (this will fail if user is not activated)
    console.log('\n3. Testing login...');
    try {
      const loginResponse = await makeRequest(`${BASE_URL}/auth/authenticate`, 'POST', loginData);
      if (loginResponse.status === 200) {
        console.log('   ✅ Login successful');
        console.log('   🔑 Token received');
      } else {
        console.log(`   ⚠️  Login response: ${loginResponse.status}`);
        console.log(`   Response: ${loginResponse.rawData}`);
        if (loginResponse.status === 403) {
          console.log('   📧 User needs activation - check email for activation code');
        }
      }
    } catch (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
    }

    console.log('\n📋 Next Steps:');
    console.log('1. If registration was successful, check your email for activation code');
    console.log('2. Use the activation code to activate your account');
    console.log('3. Then try logging in again');
    console.log('4. After login, you\'ll receive an OTP code for final verification');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthentication();