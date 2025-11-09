import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaCalendarAlt } from 'react-icons/fa';

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
}

interface BookingSummaryProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingData, updateBookingData }) => {
  const [checkInDate, setCheckInDate] = useState(bookingData.checkIn || '');
  const [checkOutDate, setCheckOutDate] = useState(bookingData.checkOut || '');
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const basePrice = nights * 1500; // ZAR 1500 per night
        const vat = basePrice * 0.15; // 15% VAT
        const total = basePrice + vat;
        
        updateBookingData({
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          basePrice,
          vat,
          total
        });
      }
    }
  }, [checkInDate, checkOutDate, updateBookingData]);

  const handleDateChange = (date: string, type: 'checkIn' | 'checkOut') => {
    if (type === 'checkIn') {
      setCheckInDate(date);
      setShowCheckInCalendar(false);
    } else {
      setCheckOutDate(date);
      setShowCheckOutCalendar(false);
    }
  };

  return (
    <div className="booking-summary">
      <h2>Your Selection</h2>
      
      {/* Hotel Information */}
      <div className="hotel-card">
        <div className="hotel-image">
          <img src={bookingData.hotel.image} alt={bookingData.hotel.name} />
        </div>
        <div className="hotel-info">
          <h3>{bookingData.hotel.name}</h3>
          <div className="hotel-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < bookingData.hotel.rating ? 'filled' : ''} />
              ))}
            </div>
            <FaThumbsUp className="thumbs-up" />
          </div>
          <p className="hotel-address">{bookingData.hotel.address}</p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="booking-details">
        <h3>Your booking details</h3>
        
        <div className="date-input-group">
          <div className="date-input">
            <label>Check-in date</label>
            <div className="date-picker">
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => handleDateChange(e.target.value, 'checkIn')}
                placeholder="mm/dd/yyyy"
              />
              <FaCalendarAlt className="calendar-icon" />
            </div>
          </div>
          
          <div className="date-input">
            <label>Checkout date</label>
            <div className="date-picker">
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => handleDateChange(e.target.value, 'checkOut')}
                placeholder="mm/dd/yyyy"
                min={checkInDate}
              />
              <FaCalendarAlt className="calendar-icon" />
            </div>
          </div>
        </div>

        <div className="stay-duration">
          <label>Total length of stay</label>
          <div className="duration-display">
            {bookingData.nights > 0 ? `${bookingData.nights} night${bookingData.nights > 1 ? 's' : ''}` : 'Select dates'}
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="price-summary">
        <h3>Your price Summary</h3>
        
        <div className="price-item">
          <label>Room Type</label>
          <div className="price-value">{bookingData.roomType}</div>
        </div>
        
        <div className="price-item">
          <label>Price Information</label>
          <div className="price-value">
            {bookingData.basePrice > 0 ? `ZAR ${bookingData.basePrice.toLocaleString()}` : 'Select dates'}
          </div>
        </div>
        
        <p className="vat-note">Includes ZAR VAT in taxes and fees</p>
        
        <div className="price-item">
          <label>15% VAT</label>
          <div className="price-value">
            {bookingData.vat > 0 ? `ZAR ${bookingData.vat.toLocaleString()}` : 'ZAR 0'}
          </div>
        </div>
        
        <div className="price-item total">
          <label>Total</label>
          <div className="price-value">
            {bookingData.total > 0 ? `ZAR ${bookingData.total.toLocaleString()}` : 'ZAR 0'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
