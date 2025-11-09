import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/index';
import { updateProfile as updateReduxProfile } from '../store/slices/authSlice';
import { userAPI, bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaLock, FaStar, FaHeart, FaHistory } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'reviews' | 'favorites'>('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile fields
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Data
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'favorites') loadFavorites();
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      setBookings(response.bookings || response.data?.bookings || []);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getMyReviews();
      setReviews(response.data?.reviews || []);
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getFavorites();
      setFavorites(response.data?.favorites || []);
    } catch (error: any) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await userAPI.updateProfile({
        first_name: firstName,
        last_name: lastName
      });
      
      const updatedUser = {
        ...user!,
        first_name: firstName,
        last_name: lastName,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || user?.email || ''
      };
      
      dispatch(updateReduxProfile(updatedUser));
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await userAPI.updatePassword({
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {(user.first_name?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{user.name || user.email}</h1>
            <p className="profile-email">{user.email}</p>
            {user.role === 'admin' && (
              <span className="role-badge admin">Admin</span>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </button>
          <button
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            <FaHistory /> Bookings
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            <FaStar /> Reviews
          </button>
          <button
            className={activeTab === 'favorites' ? 'active' : ''}
            onClick={() => setActiveTab('favorites')}
          >
            <FaHeart /> Favorites
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                {!editMode ? (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    <FaEdit /> Edit
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="save-btn" onClick={handleUpdateProfile} disabled={loading}>
                      <FaSave /> Save
                    </button>
                    <button className="cancel-btn" onClick={() => {
                      setEditMode(false);
                      setFirstName(user.first_name || '');
                      setLastName(user.last_name || '');
                    }}>
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>
                    <FaUser /> First Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  ) : (
                    <p>{user.first_name || 'Not set'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FaUser /> Last Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  ) : (
                    <p>{user.last_name || 'Not set'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FaEnvelope /> Email
                  </label>
                  <p>{user.email}</p>
                </div>

                <div className="form-group">
                  <label>
                    <FaCalendar /> Member Since
                  </label>
                  <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="password-section">
                <div className="section-header">
                  <h3>Password</h3>
                  <button
                    className="change-password-btn"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                  >
                    <FaLock /> {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {showPasswordChange && (
                  <div className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button className="update-password-btn" onClick={handleChangePassword} disabled={loading}>
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="profile-section">
              <h2>My Bookings</h2>
              {loading ? (
                <p>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="empty-state">No bookings found</p>
              ) : (
                <div className="bookings-list">
                  {bookings.map((booking) => (
                    <div key={booking.booking_id || booking.id} className="booking-item">
                      <div className="booking-header">
                        <h3>{booking.hotel_name || 'Hotel'}</h3>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-details">
                        <p><FaCalendar /> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</p>
                        <p><FaMapMarkerAlt /> {booking.location || 'N/A'}</p>
                        <p><strong>Total:</strong> R{booking.total_price || booking.total_amount || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="profile-section">
              <h2>My Reviews</h2>
              {loading ? (
                <p>Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="empty-state">No reviews yet</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.review_id} className="review-item">
                      <div className="review-header">
                        <h3>{review.hotel_name || 'Hotel'}</h3>
                        <div className="review-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < review.rating ? 'filled' : 'empty'}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p>{review.comment}</p>}
                      <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="profile-section">
              <h2>Favorite Hotels</h2>
              {loading ? (
                <p>Loading favorites...</p>
              ) : favorites.length === 0 ? (
                <p className="empty-state">No favorite hotels yet</p>
              ) : (
                <div className="favorites-grid">
                  {favorites.map((fav) => {
                    const hotel = fav.hotel_id ? fav : fav.hotel;
                    return (
                      <div key={fav.favorite_id || fav.id} className="favorite-item">
                        {Array.isArray(hotel?.images) && hotel.images[0] && (
                          <img src={hotel.images[0]} alt={hotel.name} />
                        )}
                        <h3>{hotel?.name || 'Hotel'}</h3>
                        <p><FaMapMarkerAlt /> {hotel?.location || 'N/A'}</p>
                        <p>R{hotel?.price_per_night || 0}/night</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
