import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaHeart, FaShare, FaMapMarkerAlt, FaStar, FaWifi, FaSwimmingPool, FaCar, FaUtensils } from 'react-icons/fa';
import './HotelDetailsPage.css';
import '../components/ShareModal.css';
import '../components/ReviewsSection.css';
import HotelsPageImage from '../assets/Hotel1.jpg';
import HotelsPageImage1 from '../assets/Hotel1-1.jpg';
import HotelsPageImage2 from '../assets/Hotel1-2.jpg';

import CapitalHotelImage1 from '../assets/Capital-1.jpg';
import CapitalHotelImage2 from '../assets/Capital-2.jpg';
import CapitalHotelImage3 from '../assets/Capital-3.jpg';

import HotelMap from '../components/HotelMap';
import ReviewsSection from '../components/ReviewsSection';
import { useDispatch, useSelector } from 'react-redux';
import { setCheckIn, setCheckOut } from '@/store/slices/bookingSlice';
import { RootState } from '@/store';

// Define the structure of a single amenity object
export interface AmenityType {
  name: string;
  icon: React.ElementType; // Assuming 'icon' holds the FaReactIcon name
}

// Define the structure of a single hotel object
export interface HotelType {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  latitude: number, 
  longitude: number,
  rating: number;
  pricePerNight: number;
  images: string[];
  amenities: AmenityType[];
  policies: string[];
}

export const allHotels: HotelType[] = [
    {
      id: '1',
      name: 'Hotel Sky',
      description: 'Experience luxury and comfort at our world-class hotel located in the heart of the city. Our hotel offers exceptional service, modern amenities, and breathtaking views.',
      location: 'Qwaqwa, Free-state',
      address: '048, Mokhethi St',
      rating: 5.0,
      pricePerNight: 2000,
      images: [HotelsPageImage, HotelsPageImage1, HotelsPageImage2],
      amenities: [
        { name: 'Free WiFi', icon: FaWifi },
        { name: 'Swimming Pool', icon: FaSwimmingPool },
        { name: 'Free Parking', icon: FaCar },
        { name: 'Restaurant', icon: FaUtensils },
      ],
      policies: [
        'Check-in: 3:00 PM',
        'Check-out: 11:00 AM',
        'Cancellation: Free cancellation up to 24 hours before check-in',
        'Pet Policy: Pets allowed with additional fee',
      ],
      latitude: -28.519657, 
      longitude: 28.816808,
    },

    {
      id: '2',
      name: 'The Capital',
      description: "Discover a haven in the heart of the city at The Capital. Whether you're here for work or leisure, we've got you covered with essential amenities: a refreshing swimming pool for relaxation, a sophisticated restaurant for every meal, and free, fast Wi-Fi to keep you connected.",
      location: 'Durban, KZN',
      address: '012, Mandela St',
      rating: 4.5,
      pricePerNight: 3000,
      images: [CapitalHotelImage1, CapitalHotelImage2, CapitalHotelImage3],
      amenities: [
        { name: 'Free WiFi', icon: FaWifi },
        { name: 'Swimming Pool', icon: FaSwimmingPool },
        { name: 'Restaurant', icon: FaUtensils },
      ],
      policies: [
        'Check-in: 08:00 AM',
        'Check-out: 18:00 PM',
        'Cancellation: Free cancellation up to 24 hours before check-in',
        'Pet Policy: Pets allowed with additional fee',
      ],
      latitude: -29.8587, 
      longitude: 31.0218,
    },
  ];

const HotelDetailsPage: React.FC = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const checkIn = useSelector((state: RootState) => state.bookings.checkIn);
  const checkOut = useSelector((state: RootState) => state.bookings.checkOut);
  const dispatch = useDispatch();

  const { hotelId } = useParams<{ hotelId: string }>();
  // Mock hotel data
  const hotel = allHotels.find(h => h.id === hotelId);

  if(!hotel) {
    return <div>Hotel not found!!</div>;
  }

  const hotelUrl = `${window.location.origin}/hotels/${hotel.id}`;


  return (
    <div className="hotel-details-page">
      <div className="container">
        {/* Hotel Header */}
        <div className="hotel-header">
          <div className="hotel-title-section">
            <h1 className="hotel-name">{hotel.name}</h1>
            <div className="hotel-location">
              <FaMapMarkerAlt />
              <span>{hotel.location}</span>
            </div>
            <div className="hotel-rating">
              <FaStar />
              <span>{hotel.rating}</span>
              <span className="rating-text">Excellent</span>
            </div>
          </div>
          <div className="hotel-actions">
            <button className="action-btn favorite">
              <FaHeart />
              Save
            </button>
            <button className="action-btn share" onClick={() => setShowShareModal(true)}>
              <FaShare />
              Share
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={hotel.images[0]} alt={hotel.name} />
          </div>
          <div className="thumbnail-images">
            {hotel.images.slice(1).map((image, index) => (
              <img key={index} src={image} alt={`${hotel.name} ${index + 2}`} />
            ))}
          </div>
        </div>

        {/* Hotel Info */}
        <div className="hotel-content">
          <div className="hotel-main-info">
            <div className="description-section">
              <h2>About this hotel</h2>
              <p>{hotel.description}</p>
            </div>

            <div className="amenities-section">
              <h2>Hotel amenities</h2>
              <div className="amenities-grid">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <amenity.icon />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="policies-section">
              <h2>Hotel policies</h2>
              <ul className="policies-list">
                {hotel.policies.map((policy, index) => (
                  <li key={index}>{policy}</li>
                ))}
              </ul>
            </div>

            <div className="map-section" style={{ padding: '20px 0' }}>
              <h2 style={{marginLeft: 20}}>Location</h2>
              <HotelMap 
                    latitude={hotel.latitude} 
                    longitude={hotel.longitude} 
                    name={hotel.name}
                />
                <p className="address-display">
                    <FaMapMarkerAlt /> {hotel.address}, {hotel.location}
                </p>
            </div>

            <div className="reviews-section-wrapper" style={{ padding: '20px 0' }}>
              <ReviewsSection hotelId={hotel.id} />
            </div>

          </div>

          <div className="booking-card">
            <div className="price-section">
              <div className="price">
                <span className="amount">R{hotel.pricePerNight}</span>
                <span className="unit">/night</span>
              </div>
              <div className="price-note">Prices may vary by date</div>
            </div>

            <div className="booking-form">
              <div className="form-group">
                <label>Check-in</label>
                <input
                 type="date"
                 className="form-input"
                 value={checkIn}
                 onChange={e => dispatch(setCheckIn(e.target.value))}
                 />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input 
                 type="date" 
                 className="form-input"
                 value={checkOut}
                 onChange={e => dispatch(setCheckOut(e.target.value))}
                 />
              </div>
              <div className="form-group">
                <label>Guests</label>
                <select className="form-input">
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3+ Guests</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rooms</label>
                <select className="form-input">
                  <option>1 Room</option>
                  <option>2 Rooms</option>
                  <option>3+ Rooms</option>
                </select>
              </div>
              <Link to={`/booking/${hotel.id}`} className="book-btn">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        hotelName={hotel.name}
        hotelUrl={hotelUrl}
      />
    </div>
  );
};

export default HotelDetailsPage;

