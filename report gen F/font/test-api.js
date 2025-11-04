// Simple API Test Script
// Run with: node test-api.js

const API_BASE_URL = 'http://localhost:8080/api/v1';

async function testApiConnection() {
    console.log('🔍 Testing API Connection...');
    console.log(`📡 Backend URL: ${API_BASE_URL}`);
    
    try {
        // Test basic connectivity
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend is reachable');
            const data = await response.json();
            console.log('📊 Health check response:', data);
        } else {
            console.log(`⚠️  Backend responded with status: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        console.log('💡 Make sure your Spring Boot application is running on port 8080');
    }
}

async function testAuthEndpoint() {
    console.log('\n🔐 Testing Authentication Endpoint...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword'
            })
        });
        
        if (response.ok) {
            console.log('✅ Auth endpoint is accessible');
            const data = await response.json();
            console.log('🔑 Auth response structure:', Object.keys(data));
        } else {
            console.log(`⚠️  Auth endpoint responded with status: ${response.status}`);
            if (response.status === 401) {
                console.log('🔒 Authentication failed (expected with test credentials)');
            }
        }
    } catch (error) {
        console.log('❌ Auth endpoint test failed:', error.message);
    }
}

async function testFormsEndpoint() {
    console.log('\n📋 Testing Forms Endpoint...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/forms`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            console.log('✅ Forms endpoint is accessible');
            const data = await response.json();
            console.log('📊 Forms response structure:', Object.keys(data));
        } else if (response.status === 401) {
            console.log('🔒 Forms endpoint requires authentication (expected)');
        } else {
            console.log(`⚠️  Forms endpoint responded with status: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Forms endpoint test failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting API Integration Tests\n');
    
    await testApiConnection();
    await testAuthEndpoint();
    await testFormsEndpoint();
    
    console.log('\n✨ API testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your Spring Boot backend is running');
    console.log('2. Start the Angular app: ng serve');
    console.log('3. Navigate to http://localhost:4200/api-test');
    console.log('4. Test the authentication and form APIs through the UI');
}

runTests().catch(console.error);
