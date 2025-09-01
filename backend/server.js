require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const SecurityUtils = require('./security');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Product catalog (in a real app, this would come from a database)
const products = [
  { id: 'price_100coins', name: '100 Coins', price: 99, coins: 100 }, // price in cents
  { id: 'price_500coins', name: '500 Coins', price: 499, coins: 500 },
  { id: 'price_1000coins', name: '1000 Coins', price: 999, coins: 1000 }
];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Tap & Merge Game Backend is running!', timestamp: new Date().toISOString() });
});

// Add authentication routes
app.get('/auth/signin', (req, res) => {
  res.json({ 
    message: 'This is a mock authentication endpoint. In a real implementation, this would handle Stripe Customer Portal authentication.',
    timestamp: new Date().toISOString(),
    docs: 'https://stripe.com/docs/customer-portal'
  });
});

// Dummy user authentication route
app.post('/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  // This is just a mock implementation
  // In a real application, you would validate credentials and issue JWT tokens
  
  // Create user data
  const userData = {
    id: 'user_123',
    email: email || 'user@example.com',
    name: 'Game Player',
    timestamp: new Date().toISOString()
  };
  
  // Sign the user data for security
  const signedData = SecurityUtils.signTransaction(userData);
  
  // Encode the token with base64
  const token = SecurityUtils.secureEncode(signedData);
  
  res.json({
    success: true,
    message: 'Mock authentication successful',
    user: userData,
    token: token,
    token_type: 'secure_encoded'
  });
});

// Endpoint to create a Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { productIndex, transactionData } = req.body;
    
    // Validate product index
    if (productIndex === undefined || productIndex < 0 || productIndex >= products.length) {
      return res.status(400).json({ error: 'Invalid product index' });
    }
    
    const product = products[productIndex];
    
    // Prepare transaction data with security
    const baseTransactionData = {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      coins: product.coins,
      currency: 'usd',
      timestamp: new Date().toISOString(),
      ...transactionData
    };
    
    // Sign the transaction data
    const signedTransaction = SecurityUtils.signTransaction(baseTransactionData);
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}?payment_success=true&coins=${product.coins}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}?payment_cancelled=true`,
      metadata: {
        product_id: product.id,
        coins: product.coins,
        transaction_hash: signedTransaction.hash,
        // We can't store the full transaction data in metadata (size limits),
        // so we store just the essential information
        transaction_id: signedTransaction.signedData.transaction_id
      }
    });

    // Return both the session ID and the signed transaction data
    res.json({ 
      sessionId: session.id,
      secureTransaction: {
        data: signedTransaction.signedData,
        hash: signedTransaction.hash,
        encoded: SecurityUtils.secureEncode(signedTransaction.signedData)
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook endpoint for Stripe events (optional but recommended)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Fulfill the purchase (e.g., add coins to user account)
      console.log('Payment successful for session:', session.id);
      console.log('Coins to add:', session.metadata.coins);
      console.log('Transaction hash:', session.metadata.transaction_hash);
      // In a real implementation, you would update your database here
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// Endpoint to verify payment status
app.get('/api/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Enhanced security response
    const secureResponse = {
      status: session.status,
      payment_status: session.payment_status,
      coins: session.metadata?.coins,
      product_id: session.metadata?.product_id,
      transaction_id: session.metadata?.transaction_id,
      timestamp: new Date().toISOString()
    };
    
    // Sign the response for security
    const signedResponse = SecurityUtils.signTransaction(secureResponse);
    
    res.json({
      data: signedResponse.signedData,
      hash: signedResponse.hash,
      encoded: SecurityUtils.secureEncode(signedResponse.signedData)
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Endpoint to verify transaction integrity
app.post('/api/verify-transaction', (req, res) => {
  try {
    const { data, hash } = req.body;
    
    if (!data || !hash) {
      return res.status(400).json({ error: 'Missing data or hash' });
    }
    
    // Verify the transaction
    const verification = SecurityUtils.verifyTransaction(data, hash);
    
    res.json(verification);
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

// Endpoint to decode secure data
app.post('/api/decode', (req, res) => {
  try {
    const { encodedData } = req.body;
    
    if (!encodedData) {
      return res.status(400).json({ error: 'Missing encoded data' });
    }
    
    // Decode the data
    const decoded = SecurityUtils.secureDecode(encodedData);
    
    if (!decoded) {
      return res.status(400).json({ error: 'Invalid encoded data' });
    }
    
    res.json({
      success: true,
      data: decoded
    });
  } catch (error) {
    console.error('Error decoding data:', error);
    res.status(500).json({ error: 'Failed to decode data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8000'}`);
});