import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { bookingsAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import toast from 'react-hot-toast';
import './PaymentMethodPage.css';
import { FaCreditCard } from 'react-icons/fa';
import PaymentMethod from '../assets/PaymentMethod.png';

const stripePromise = loadStripe('pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y');

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId, amount, currency, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await bookingsAPI.createPaymentIntent(bookingId);
        setClientSecret(response.data.clientSecret);
      } catch (err: any) {
        toast.error('Failed to initialize payment');
        setError(err.response?.data?.message || 'Payment initialization failed');
      }
    };

    if (bookingId) {
      createPaymentIntent();
    }
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe not initialized. Please refresh the page.');
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        toast.error(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment with backend
        await bookingsAPI.confirmPayment(paymentIntent.id, bookingId);
        toast.success('Payment successful!');
        onSuccess();
      } else {
        setError('Payment was not completed');
        toast.error('Payment was not completed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed');
      toast.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="stripe-card-container">
        <label>
          <FaCreditCard style={{ marginRight: '8px' }} />
          Card Details
        </label>
        <div className="card-element-wrapper">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="amount-to-pay">
        <span>Amount to pay:</span>
        <strong>
          {currency} {amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </strong>
      </div>

      <button 
        type="submit" 
        className="pay-now-btn" 
        disabled={!stripe || !clientSecret || processing}
      >
        {processing ? 'Processing...' : `Pay ${currency} ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </button>

      <p className="payment-note">
        Your payment is secure and encrypted. We never store your card details.
      </p>
    </form>
  );
};

const PaymentMethodPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const bookingId = location.state?.bookingId;
  const bookingData = location.state?.bookingData;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingId || !bookingData) {
      toast.error('Booking information missing. Please start over.');
      navigate('/hotels');
      return;
    }
  }, [user, bookingId, bookingData, navigate]);

  if (!bookingId || !bookingData) {
    return (
      <div className="payment-method-page">
        <div className="container">
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = () => {
    navigate('/booking-confirmation', {
      state: {
        bookingId,
        bookingData,
      },
    });
  };

  return (
    <div className="payment-method-page">
      <div className="container">
        <div className="payment-header">
          <div className="steps-indicator">
            <div className="step completed">1 Your selection</div>
            <div className="step completed">2 Your details</div>
            <div className="step current">3 Payment</div>
          </div>
          <h2>Complete Your Payment</h2>
          <p>Secure payment powered by Stripe</p>
        </div>

        <div className="payment-content">
          <div className="payment-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Hotel:</span>
              <strong>{bookingData.hotel?.name || 'Hotel'}</strong>
            </div>
            <div className="summary-item">
              <span>Check-in:</span>
              <strong>{new Date(bookingData.check_in_date).toLocaleDateString()}</strong>
            </div>
            <div className="summary-item">
              <span>Check-out:</span>
              <strong>{new Date(bookingData.check_out_date).toLocaleDateString()}</strong>
            </div>
            <div className="summary-item">
              <span>Guests:</span>
              <strong>{bookingData.number_of_guests}</strong>
            </div>
            <div className="summary-item">
              <span>Rooms:</span>
              <strong>{bookingData.number_of_rooms}</strong>
            </div>
            <div className="summary-item total">
              <span>Total Amount:</span>
              <strong>
                {bookingData.currency || 'ZAR'} {parseFloat(bookingData.total_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="payment-form-container">
            <h3>Payment Method</h3>
            <div className="accepted-cards">
              <img src={PaymentMethod} alt="Payment methods" width="70%" />
            </div>

            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingId={bookingId}
                amount={parseFloat(bookingData.total_amount)}
                currency={bookingData.currency || 'ZAR'}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPage;
