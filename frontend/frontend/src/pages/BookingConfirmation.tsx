import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaCreditCard } from 'react-icons/fa';
import './BookingConfirmation.css';

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

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData, paymentSuccess } = location.state as { 
    bookingData: BookingData; 
    paymentSuccess: boolean 
  };

  if (!bookingData) {
    navigate('/');
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackToHotels = () => {
    navigate('/hotels');
  };

  const handleViewBooking = () => {
    navigate('/profile');
  };

  return (
    <div className="booking-confirmation">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          <h1>Booking Confirmed!</h1>
          <p>Your reservation has been successfully created</p>
        </div>

        {/* Booking Details Card */}
        <div className="booking-details-card">
          <div className="hotel-info">
            <div className="hotel-image">
              <img src={bookingData.hotel.image} alt={bookingData.hotel.name} />
            </div>
            <div className="hotel-details">
              <h2>{bookingData.hotel.name}</h2>
              <div className="hotel-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < bookingData.hotel.rating ? 'filled' : ''} />
                  ))}
                </div>
                <span className="rating-text">Excellent</span>
              </div>
              <div className="hotel-location">
                <FaMapMarkerAlt />
                <span>{bookingData.hotel.address}</span>
              </div>
            </div>
          </div>

          <div className="booking-info">
            <div className="info-section">
              <h3>Booking Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="label">Check-in</span>
                    <span className="value">{formatDate(bookingData.checkIn)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="label">Check-out</span>
                    <span className="value">{formatDate(bookingData.checkOut)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="label">Duration</span>
                  <span className="value">{bookingData.nights} night{bookingData.nights > 1 ? 's' : ''}</span>
                </div>
                <div className="info-item">
                  <span className="label">Room Type</span>
                  <span className="value">{bookingData.roomType}</span>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <h3>Payment Summary</h3>
              <div className="payment-details">
                <div className="payment-item">
                  <span>Room Rate</span>
                  <span>ZAR {bookingData.basePrice.toLocaleString()}</span>
                </div>
                <div className="payment-item">
                  <span>VAT (15%)</span>
                  <span>ZAR {bookingData.vat.toLocaleString()}</span>
                </div>
                <div className="payment-item total">
                  <span>Total Paid</span>
                  <span>ZAR {bookingData.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="payment-method">
                <FaCreditCard />
                <span>Payment processed successfully</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        {bookingData.personalInfo && (
          <div className="guest-info-card">
            <h3>Guest Information</h3>
            <div className="guest-details">
              <div className="guest-item">
                <span className="label">Name</span>
                <span className="value">
                  {bookingData.personalInfo.title} {bookingData.personalInfo.firstName} {bookingData.personalInfo.lastName}
                </span>
              </div>
              <div className="guest-item">
                <span className="label">Email</span>
                <span className="value">{bookingData.personalInfo.email}</span>
              </div>
              <div className="guest-item">
                <span className="label">Phone</span>
                <span className="value">
                  {bookingData.personalInfo.phoneCode} {bookingData.personalInfo.phoneNumber}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Important Information */}
        <div className="important-info">
          <h3>Important Information</h3>
          <ul>
            <li>Check-in time: 3:00 PM</li>
            <li>Check-out time: 11:00 AM</li>
            <li>A confirmation email has been sent to your email address</li>
            <li>Please bring a valid ID for check-in</li>
            <li>Free cancellation up to 24 hours before check-in</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleBackToHotels} className="btn btn-secondary">
            Browse More Hotels
          </button>
          <button onClick={handleViewBooking} className="btn btn-primary">
            View My Bookings
          </button>
        </div>

        {/* Footer */}
        <div className="confirmation-footer">
          <p>Thank you for choosing HotelEase!</p>
          <p>If you have any questions, please contact our customer service.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
