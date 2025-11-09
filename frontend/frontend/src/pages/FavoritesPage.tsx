import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; 
import { RootState } from '../store/index'; 
import { allHotels, HotelType } from '../pages/HotelDetailsPage'; 
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';


const FavoritesPage: React.FC = () => {
  const favoriteIds = useSelector((state: RootState) => state.favorites.favoriteIds);

  const favoriteHotels: HotelType[] = allHotels.filter((hotel: HotelType) => 
      favoriteIds.includes(hotel.id)
  );

  if (favoriteHotels.length === 0) {
      return (
        <div className="container">
            <h1>Your Favorite Hotels</h1>
            <p className="no-favorites-message">
                You haven't added any hotels to your favorites yet. 💔
            </p>
            <Link to="/hotels" className="btn-browse-hotels">Browse Hotels</Link>
        </div>
      );
  }

  return (
    <div className="hotels-page">
      <div className="container">
           
        <div className="hotels-heading" style={{marginBottom: 20}}>
            <h2>
                Your Favorite Hotels ({favoriteHotels.length})
            </h2>
        </div>

          <div className="hotels-grid">
            {favoriteHotels.map((hotel) => (

              <div key={hotel.id} className="hotel-card">
                <div className="hotel-image">
                  <img src={hotel.images[0]} alt={hotel.name} />
                </div>
                
                <div className="hotel-info">

                  <div className="hotel-rating">
                    <FaStar />
                    <span>{hotel.rating}</span>
                  </div>

                  <h3 className="hotel-name">{hotel.name}</h3>

                  <p className="hotel-location">
                    <FaMapMarkerAlt />
                    {hotel.location}
                  </p>
                    {/* <div className="hotel-amenities">
                      {hotel.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                    </div> */}
                  <div className="hotel-footer">
                    <Link to={`/hotels/${hotel.id}`} className="view-btn" style={{background: '#5CC1FF'}}>
                      View Details
                    </Link>
                    <div className="hotel-price">
                      <span className="price" style={{color: '#333'}}>R{hotel.pricePerNight}</span>
                      <span className="price-unit">per night</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default FavoritesPage;