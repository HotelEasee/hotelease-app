import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaThumbsUp, FaCalendarAlt, FaCreditCard, FaClock } from 'react-icons/fa';
import BookingSummary from '../components/payment/BookingSummary';
import PersonalDetails from '../components/payment/PersonalDetails';
import PaymentDetails from '../components/payment/PaymentDetails';
import './PaymentPage.css';

interface PaymentStep {
  id: number;
  title: string;
  description: string;
}

const PaymentPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Get booking ID and booking data from location state (passed from BookingPage)
  const bookingId = location.state?.bookingId;
  const bookingDataFromState = location.state?.bookingData;
  
  // Get search filters from location state if available
  const searchFilters = location.state?.searchFilters || {
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    rooms: 1
  };
  
  const [bookingData, setBookingData] = useState({
    hotel: {
      id: hotelId || '1',
      name: 'HotelEase',
      address: '176 Paul Kruger Avenue, 0261 Hartbeespoort, South Africa',
      rating: 5,
      image: '/premium_photo-1674651240687-92b4ad15d0ea.jpeg'
    },
    checkIn: searchFilters.checkIn || '',
    checkOut: searchFilters.checkOut || '',
    nights: 0,
    roomType: 'Standard Room',
    basePrice: 0,
    vat: 0,
    total: 0,
    adults: searchFilters.adults || 2,
    children: searchFilters.children || 0,
    rooms: searchFilters.rooms || 1
  });

  const steps: PaymentStep[] = [
    { id: 1, title: 'Your Selection', description: 'Review your booking' },
    { id: 2, title: 'Enter your details', description: 'Personal information' },
    { id: 3, title: 'Payment', description: 'Complete your reservation' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete reservation
      handleCompleteReservation();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteReservation = async (completedBookingId: string, paymentIntentId: string) => {
    try {
      // Redirect to confirmation page with payment success
      navigate('/booking-confirmation', { 
        state: { 
          bookingData, 
          bookingId: completedBookingId,
          paymentIntentId,
          paymentSuccess: true 
        } 
      });
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const updateBookingData = (updates: Partial<typeof bookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Progress Indicator */}
        <div className="progress-indicator">
          {steps.map((step, index) => (
            <div key={step.id} className={`step ${currentStep >= step.id ? 'active' : ''}`}>
              <div className="step-number">{step.id}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="payment-content">
          {/* Left Column - Booking Summary */}
          <div className="booking-summary-column">
            <BookingSummary 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
            />
          </div>

          {/* Middle Column - Personal Details */}
          <div className="personal-details-column">
            <PersonalDetails 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              currentStep={currentStep}
            />
          </div>

          {/* Right Column - Payment Details */}
          <div className="payment-details-column">
            <PaymentDetails 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              currentStep={currentStep}
              onComplete={handleCompleteReservation}
              bookingId={bookingId}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="payment-footer">
          <div className="footer-content">
            <span className="footer-brand">HotelEase</span>
            <div className="footer-icons">
              <div className="social-icon">📧</div>
              <div className="social-icon">📱</div>
              <div className="social-icon">🌐</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
