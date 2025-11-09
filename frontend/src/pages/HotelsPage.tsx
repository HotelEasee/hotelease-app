import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaStar, FaHeart, FaTimes } from 'react-icons/fa';
import './HotelsPage.css';
import HotelsPageImage from '../assets/Hotel1.jpg';
import HotelsPageImage1 from '../assets/Capital.jpg';
import HotelsPageImage2 from '../assets/Max.jpg';
import HotelsPageImage3 from '../assets/Sky.jpg';
import HotelsPageImage4 from '../assets/Pretoria.jpg';
import HotelsPageImage5 from '../assets/Prime.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '@/store/slices/favoriteSlice';
import { hotelsAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { RootState } from '../store';



const HotelsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHotels();
  }, [searchQuery, location, minPrice, maxPrice, minRating]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery) filters.q = searchQuery;
      if (location) filters.location = location;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;
      if (minRating) filters.minRating = minRating;

      const response = await hotelsAPI.getAll(filters);
      setHotels(response.items || response.data?.items || []);
    } catch (error: any) {
      console.error('Failed to load hotels:', error);
      // Fallback to mock data if API fails
      setHotels([
    {
      id: '1',
      name: 'Hotel Sky',
      location: 'Qwaqwa, Free-state',
      price: 2000,
      rating: 5.0,
      image: HotelsPageImage,
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    },
    {
      id: '2',
      name: 'The Capital',
      location: 'Durban, KZN',
      price: 3000,
      rating: 4.5,
      image: HotelsPageImage1,
      amenities: ['WiFi', 'Pool', 'Restaurant'],
    },
    {
      id: '3',
      name: 'Max Hotel',
      location: 'Badplass, Mpumalanga',
      price: 1900,
      rating: 4.7,
      image: HotelsPageImage2,
      amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking'],
    },
    {
      id: '4',
      name: 'Hotel Sky',
      location: 'Newcastle, KZN',
      price: 2100,
      rating: 4.6,
      image: HotelsPageImage3,
      amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking'],
    },
    {
      id: '5',
      name: 'PKT Hotel',
      location: 'Pretoria, Gauteng',
      price: 1999,
      rating: 4.6,
      image: HotelsPageImage4,
      amenities: ['WiFi', 'Spa', 'Beach', 'Restaurant', 'Parking'],
    },
    {
      id: '6',
      name: 'Prime Hotel',
      location: 'Gemiston, Gauteng',
      price: 2000,
      rating: 4.8,
      image: HotelsPageImage5,
      amenities: ['WiFi', 'Spa', 'Beach', 'Restaurant', 'Parking'],
    },
  ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await userAPI.getFavorites();
      const favoriteHotels = response.data?.favorites || [];
      setFavoriteIds(new Set(favoriteHotels.map((f: any) => f.hotel_id?.toString() || f.hotelId?.toString())));
    } catch (error) {
      // Silent fail
    }
  };

  const handleToggleFavorite = async (hotelId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      const isFavorite = favoriteIds.has(hotelId);
      if (isFavorite) {
        await userAPI.removeFavorite(hotelId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(hotelId);
          return newSet;
        });
        toast.success('Removed from favorites');
      } else {
        await userAPI.addFavorite(hotelId);
        setFavoriteIds(prev => new Set(prev).add(hotelId));
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update favorite');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minRating) params.set('minRating', minRating);
    setSearchParams(params);
    loadHotels();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSearchParams({});
    loadHotels();
  };

  return (
    <div className="hotels-page">
      <div className="container">
        {/* Search and Filters */}
        <div className="search-section">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-group">
              <FaMapMarkerAlt className="search-icon" />
              <input
                type="text"
                placeholder="Where are you going?"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="date-inputs">
              <input 
                type="date" 
                className="date-input"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
              <input 
                type="date" 
                className="date-input"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div className="guests-input">
              <select 
                className="guests-select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3+ Guests</option>
              </select>
            </div>
            <button type="submit" className="search-btn">
              <FaSearch />
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Filters</h3>
            <button 
              className="clear-filters-btn"
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                className="filter-input"
                placeholder="City or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Min Price (ZAR)</label>
              <input
                type="number"
                className="filter-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Max Price (ZAR)</label>
              <input
                type="number"
                className="filter-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Min Rating</label>
              <select 
                className="filter-select"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading hotels...</div>
        ) : (
          <div className="hotels-grid">
            {hotels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                No hotels found. Try adjusting your filters.
              </div>
            ) : (
              hotels.map((hotel) => {
                const hotelId = hotel.hotel_id?.toString() || hotel.id?.toString();
                const isFavorite = favoriteIds.has(hotelId);
                
                return (
                  <div key={hotelId} className="hotel-card">
                    <div className="hotel-image">
                      <img 
                        src={Array.isArray(hotel.images) && hotel.images.length > 0 ? hotel.images[0] : hotel.image || HotelsPageImage} 
                        alt={hotel.name} 
                      />
                      
                      <button 
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={() => handleToggleFavorite(hotelId)}
                      >
                        <FaHeart />
                      </button>
                    </div>
                    <div className="hotel-info">
                      <h3 className="hotel-name">{hotel.name}</h3>
                      <p className="hotel-location">
                        <FaMapMarkerAlt />
                        {hotel.location}
                      </p>
                      <div className="hotel-rating">
                        <FaStar />
                        <span>{hotel.rating?.toFixed(1) || hotel.rating || 'N/A'}</span>
                      </div>
                      <div className="hotel-amenitiese">
                        {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 ? (
                          hotel.amenities.slice(0, 4).map((amenity: string, index: number) => (
                            <span key={index} className="amenity-tag">
                              {amenity}
                            </span>
                          ))
                        ) : hotel.amenities ? (
                          hotel.amenities.map((amenity: string, index: number) => (
                            <span key={index} className="amenity-tag">
                              {amenity}
                            </span>
                          ))
                        ) : null}
                      </div>
                      <div className="hotel-footer">
                        <Link to={`/hotels/${hotelId}`} className="view-btn">
                          View Details
                        </Link>
                        <div className="hotel-price">
                          <span className="price">R{hotel.price_per_night || hotel.price}</span>
                          <span className="price-unit">per night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default HotelsPage;


