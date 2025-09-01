// Simple test script to verify backend functionality
// Run with: node test-backend.js

async function testBackend() {
  const backendUrl = 'http://localhost:3000';
  
  try {
    // Test health check endpoint
    console.log('Testing health check endpoint...');
    const healthResponse = await fetch(`${backendUrl}/`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    
    // Test create checkout session endpoint
    console.log('\nTesting create checkout session endpoint...');
    const checkoutResponse = await fetch(`${backendUrl}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIndex: 0,
        transactionData: {
          userId: 'test_user',
          timestamp: new Date().toISOString()
        }
      })
    });
    
    const checkoutData = await checkoutResponse.json();
    console.log('Checkout session response:', checkoutData);
    
    if (checkoutData.sessionId) {
      console.log('✅ Backend is working correctly!');
      console.log('Session ID:', checkoutData.sessionId);
    } else {
      console.log('❌ Error creating checkout session:', checkoutData.error);
    }
  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
  }
}

// Run the test
testBackend();