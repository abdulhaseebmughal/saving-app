const axios = require('axios');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456';
const TEST_NAME = 'Test User';
const ADMIN_EMAIL = 'abdulhaseebmughal2006@gmail.com';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 SaveIt.AI Authentication Tests');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`API URL: ${API_URL}\n`);

async function testHealthCheck() {
  console.log('1️⃣  Testing Health Check...');
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    console.log('✅ Health check passed');
    console.log(`   MongoDB: ${response.data.mongodb.status}`);
    console.log(`   Gemini: ${response.data.gemini.configured ? 'Configured' : 'Not configured'}`);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testSignup() {
  console.log('\n2️⃣  Testing Signup Flow...');
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    console.log('✅ Signup successful');
    console.log(`   Message: ${response.data.message}`);
    console.log(`   Email sent: ${response.data.emailSent}`);
    console.log('   ⚠️  NOTE: Check email for OTP to complete verification');
    return true;
  } catch (error) {
    if (error.response?.data?.error?.includes('already registered')) {
      console.log('ℹ️  User already exists (this is expected)');
      return true;
    }
    console.log('❌ Signup failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testLoginRequest() {
  console.log('\n3️⃣  Testing Login OTP Request...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL
    });
    console.log('✅ Login OTP request successful');
    console.log(`   Message: ${response.data.message}`);
    console.log(`   Email sent: ${response.data.emailSent}`);
    console.log(`   ⚠️  NOTE: Check ${ADMIN_EMAIL} for OTP to complete login`);
    return true;
  } catch (error) {
    console.log('❌ Login OTP request failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testForgotPassword() {
  console.log('\n4️⃣  Testing Forgot Password...');
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: ADMIN_EMAIL
    });
    console.log('✅ Forgot password request successful');
    console.log(`   Message: ${response.data.message}`);
    return true;
  } catch (error) {
    console.log('❌ Forgot password request failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting tests...\n');

  const results = {
    health: await testHealthCheck(),
    signup: await testSignup(),
    login: await testLoginRequest(),
    forgotPassword: await testForgotPassword()
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Results Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}`);
  });

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Authentication is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Next Steps:');
  console.log('1. Start backend: cd backend && npm run dev');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Visit http://localhost:3000/login');
  console.log(`4. Login with: ${ADMIN_EMAIL}`);
  console.log('5. Check email for OTP code');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run tests
runTests().catch(console.error);
