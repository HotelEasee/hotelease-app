require('dotenv').config();
const stripe = require('stripe');

console.log('Testing Stripe Configuration...\n');

// Check if key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('❌ STRIPE_SECRET_KEY not found in environment');
  console.log('Available STRIPE env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
  process.exit(1);
}

console.log('✅ STRIPE_SECRET_KEY found');
console.log('   Key:', process.env.STRIPE_SECRET_KEY.substring(0, 25) + '...');
console.log('   Length:', process.env.STRIPE_SECRET_KEY.length);

try {
  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe client initialized successfully');
  
  // Test creating a payment intent
  console.log('\nTesting payment intent creation...');
  stripeClient.paymentIntents.create({
    amount: 10000, // R100.00 in cents
    currency: 'zar',
    description: 'Test payment'
  })
  .then(intent => {
    console.log('✅ Payment intent created successfully!');
    console.log('   Intent ID:', intent.id);
    console.log('   Status:', intent.status);
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ Payment intent creation failed:');
    console.log('   Error:', error.message);
    console.log('   Type:', error.type);
    process.exit(1);
  });
} catch (error) {
  console.log('❌ Failed to initialize Stripe:');
  console.log('   Error:', error.message);
  process.exit(1);
}

