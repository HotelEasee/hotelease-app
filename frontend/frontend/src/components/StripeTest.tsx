import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement } from '@stripe/react-stripe-js';

// Test Stripe integration
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y');

const StripeTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Stripe Integration Test</h2>
      <p>Testing Stripe with your publishable key...</p>
      
      <Elements stripe={stripePromise}>
        <div style={{ marginTop: '20px' }}>
          <label>Test Card Input:</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </Elements>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Test Cards:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Success: 4242 4242 4242 4242</li>
          <li>Decline: 4000 0000 0000 0002</li>
          <li>Requires Auth: 4000 0025 0000 3155</li>
        </ul>
      </div>
    </div>
  );
};

export default StripeTest;
