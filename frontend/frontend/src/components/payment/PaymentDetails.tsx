import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaCalendarAlt, FaQuestionCircle, FaClock, FaCheckCircle } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { bookingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface BookingData {
  hotel: {
    id: string;
    name: string;
    address: string;
    rating: number;
    image: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  basePrice: number;
  vat: number;
  total: number;
  personalInfo?: any;
}

interface PaymentDetailsProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  onComplete: (bookingId: string, paymentIntentId: string) => void;
  bookingId?: string;
}

interface PaymentInfo {
  paymentMethod: 'card' | 'googlepay';
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
  securePayment: boolean;
  arrivalTime: string;
}

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y');

const PaymentFormWrapper: React.FC<{
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  onComplete: (bookingId: string, paymentIntentId: string) => void;
  bookingId: string;
}> = ({ paymentInfo, setPaymentInfo, onComplete, bookingId }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!bookingId) {
        toast.error('Booking ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await bookingsAPI.createPaymentIntent(bookingId);
        setClientSecret(response.clientSecret);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to initialize payment');
        console.error('Payment intent creation error:', error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [bookingId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading payment form...</div>;
  }

  if (!clientSecret) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Failed to load payment form. Please refresh the page.</div>;
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        clientSecret,
      }}
    >
      <PaymentForm
        paymentInfo={paymentInfo}
        setPaymentInfo={setPaymentInfo}
        onComplete={onComplete}
        bookingId={bookingId}
        clientSecret={clientSecret}
      />
    </Elements>
  );
};

const PaymentForm: React.FC<{
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  onComplete: (bookingId: string, paymentIntentId: string) => void;
  bookingId: string;
  clientSecret: string;
}> = ({ paymentInfo, setPaymentInfo, onComplete, bookingId, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Payment confirmation failed:', error);
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Payment succeeded, confirm with backend
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          await bookingsAPI.confirmPayment(paymentIntent.id, bookingId);
          toast.success('Payment successful!');
          onComplete(bookingId, paymentIntent.id);
        } catch (error: any) {
          console.error('Payment confirmation error:', error);
          toast.error(error.response?.data?.message || 'Failed to confirm payment');
        }
      } else {
        toast.error('Payment was not completed');
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      toast.error(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label htmlFor="cardholderName">Cardholder's Name *</label>
        <input
          type="text"
          id="cardholderName"
          value={paymentInfo.cardholderName}
          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardholderName: e.target.value })}
          className="form-input"
          placeholder="Name on card"
          required
        />
      </div>

      <div className="form-group">
        <label>Card Details *</label>
        <div className="card-input-wrapper">
          <PaymentElement
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
      </div>

      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={paymentInfo.saveCard}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
          />
          <span className="checkmark"></span>
          Save card
        </label>
      </div>

      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={paymentInfo.securePayment}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, securePayment: e.target.checked })}
            required
          />
          <span className="checkmark"></span>
          Secure payment
        </label>
      </div>

      <div className="arrival-time-section">
        <div className="arrival-info">
          <FaClock className="clock-icon" />
          <span>Your room will be ready for check-in at 3:00 PM</span>
        </div>
        <div className="form-group">
          <label htmlFor="arrivalTime">Add your estimated arrival time (optional)</label>
          <input
            type="time"
            id="arrivalTime"
            value={paymentInfo.arrivalTime}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, arrivalTime: e.target.value })}
            className="form-input"
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-complete"
        disabled={isProcessing || !stripe}
      >
        {isProcessing ? 'Processing Payment...' : 'Complete Reservation'}
      </button>
    </form>
  );
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onPrevious, 
  currentStep,
  onComplete,
  bookingId
}) => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    paymentMethod: 'card',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
    securePayment: false,
    arrivalTime: ''
  });

  const handlePaymentMethodChange = (method: 'card' | 'googlepay') => {
    setPaymentInfo({ ...paymentInfo, paymentMethod: method });
  };

  return (
    <div className="payment-details">
      <div className="step-header">
        <h2>Payment</h2>
      </div>

      <div className="payment-methods">
        <h3>How do you want to pay?</h3>
        
        <div className="payment-option">
          <label className="payment-option-label">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentInfo.paymentMethod === 'card'}
              onChange={() => handlePaymentMethodChange('card')}
            />
            <div className="payment-option-content">
              <FaCreditCard className="payment-icon" />
              <span>New card</span>
            </div>
          </label>
        </div>

        <div className="payment-option">
          <label className="payment-option-label">
            <input
              type="radio"
              name="paymentMethod"
              value="googlepay"
              checked={paymentInfo.paymentMethod === 'googlepay'}
              onChange={() => handlePaymentMethodChange('googlepay')}
            />
            <div className="payment-option-content">
              <div className="google-pay-logo">G Pay</div>
              <span>Google Pay</span>
            </div>
          </label>
        </div>
      </div>

      {paymentInfo.paymentMethod === 'card' && bookingId && (
        <div className="card-payment-section">
          <h4>New card (details section)</h4>
          <PaymentFormWrapper
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
            onComplete={onComplete}
            bookingId={bookingId}
          />
        </div>
      )}
      {paymentInfo.paymentMethod === 'card' && !bookingId && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Booking ID is missing. Please go back and create a booking first.
        </div>
      )}

      {paymentInfo.paymentMethod === 'googlepay' && (
        <div className="google-pay-section">
          <div className="google-pay-button">
            <div className="google-pay-content">
              <div className="google-pay-logo-large">G Pay</div>
              <span>Pay with Google Pay</span>
            </div>
          </div>
          <p className="google-pay-note">
            Google Pay integration would be implemented here for production use.
          </p>
        </div>
      )}

      {/* Confirmation Section */}
      <div className="confirmation-section">
        <div className="confirmation-icon">
          <FaCheckCircle />
        </div>
        <div className="confirmation-text">Confirmed</div>
        <div className="payment-provider-logo">PL</div>
      </div>
    </div>
  );
};

export default PaymentDetails;
