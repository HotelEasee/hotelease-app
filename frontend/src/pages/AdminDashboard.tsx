import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';
import { FaUsers, FaHotel, FaBook, FaDollarSign, FaClock, FaCheckCircle } from 'react-icons/fa';

interface DashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  activeHotels: number;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  status: string;
  price_per_night: number;
  created_at: string;
}

interface Booking {
  id: string;
  user: { email: string; first_name?: string; last_name?: string };
  hotel: { name: string; city: string };
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status: string;
  payment_status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hotels' | 'bookings' | 'users'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    price_per_night: '',
    rating: '0',
    images: [] as string[],
    amenities: [] as string[],
    policies: [] as string[]
  });

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const response = await adminAPI.getDashboardStats();
        setStats(response.data);
      } else if (activeTab === 'hotels') {
        const response = await adminAPI.getAllHotels();
        setHotels(response.data.hotels || []);
      } else if (activeTab === 'bookings') {
        const response = await adminAPI.getAllBookings();
        setBookings(response.data.bookings || []);
      } else if (activeTab === 'users') {
        const response = await adminAPI.getAllUsers();
        setUsers(response.data.users || []);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;

    try {
      await adminAPI.deleteHotel(hotelId);
      toast.success('Hotel deleted successfully');
      loadDashboardData();
    } catch (error: any) {
      toast.error('Failed to delete hotel');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      toast.success('Booking status updated');
      loadDashboardData();
      setShowBookingModal(false);
    } catch (error: any) {
      toast.error('Failed to update booking status');
    }
  };

  const handleCreateHotel = () => {
    setSelectedHotel(null);
    setHotelFormData({
      name: '',
      location: '',
      address: '',
      description: '',
      price_per_night: '',
      rating: '0',
      images: [],
      amenities: [],
      policies: []
    });
    setShowHotelModal(true);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setHotelFormData({
      name: hotel.name || '',
      location: hotel.city || '',
      address: '',
      description: '',
      price_per_night: hotel.price_per_night?.toString() || '',
      rating: '0',
      images: [],
      amenities: [],
      policies: []
    });
    setShowHotelModal(true);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const hotelData = {
        name: hotelFormData.name,
        location: hotelFormData.location,
        address: hotelFormData.address,
        description: hotelFormData.description,
        price_per_night: parseFloat(hotelFormData.price_per_night),
        rating: parseFloat(hotelFormData.rating),
        images: hotelFormData.images,
        amenities: hotelFormData.amenities,
        policies: hotelFormData.policies
      };

      if (selectedHotel) {
        await adminAPI.updateHotel(selectedHotel.id, hotelData);
        toast.success('Hotel updated successfully');
      } else {
        await adminAPI.createHotel(hotelData);
        toast.success('Hotel created successfully');
      }
      
      setShowHotelModal(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save hotel');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage hotels, bookings, and users</p>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'hotels' ? 'active' : ''}
          onClick={() => setActiveTab('hotels')}
        >
          Hotels
        </button>
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaHotel />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalHotels}</h3>
                    <p>Total Hotels</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaBook />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalBookings}</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaDollarSign />
                  </div>
                  <div className="stat-info">
                    <h3>{formatCurrency(stats.totalRevenue)}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaClock />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pendingBookings}</h3>
                    <p>Pending Bookings</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.activeHotels}</h3>
                    <p>Active Hotels</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="table-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Hotels Management</h2>
                  <button className="btn-primary" onClick={handleCreateHotel}>
                    + Add New Hotel
                  </button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>City</th>
                      <th>Price/Night</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map((hotel) => (
                      <tr key={hotel.id}>
                        <td>{hotel.name}</td>
                        <td>{hotel.city}</td>
                        <td>{formatCurrency(hotel.price_per_night)}</td>
                        <td>
                          <span className={`status-badge ${hotel.status}`}>
                            {hotel.status}
                          </span>
                        </td>
                        <td>{formatDate(hotel.created_at)}</td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => handleEditHotel(hotel)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteHotel(hotel.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="table-container">
                <h2>Bookings Management</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Hotel</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          {booking.user?.first_name} {booking.user?.last_name}
                          <br />
                          <small>{booking.user?.email}</small>
                        </td>
                        <td>
                          {booking.hotel?.name}
                          <br />
                          <small>{booking.hotel?.city}</small>
                        </td>
                        <td>{formatDate(booking.check_in_date)}</td>
                        <td>{formatDate(booking.check_out_date)}</td>
                        <td>{formatCurrency(booking.total_amount)}</td>
                        <td>
                          <span className={`status-badge ${booking.booking_status}`}>
                            {booking.booking_status}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${booking.payment_status}`}>
                            {booking.payment_status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="table-container">
                <h2>Users Management</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Verified</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.first_name} {user.last_name}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.is_verified ? (
                            <FaCheckCircle className="verified" />
                          ) : (
                            <span className="not-verified">No</span>
                          )}
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showHotelModal && (
        <div className="modal-overlay" onClick={() => setShowHotelModal(false)}>
          <div className="modal-content hotel-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedHotel ? 'Edit Hotel' : 'Create New Hotel'}</h2>
            <form onSubmit={handleSaveHotel} className="hotel-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Hotel Name *</label>
                  <input
                    type="text"
                    value={hotelFormData.name}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={hotelFormData.location}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={hotelFormData.address}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={hotelFormData.description}
                  onChange={(e) => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Night (ZAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={hotelFormData.price_per_night}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, price_per_night: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={hotelFormData.rating}
                    onChange={(e) => setHotelFormData({ ...hotelFormData, rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URLs (comma separated)</label>
                <input
                  type="text"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  onChange={(e) => setHotelFormData({ 
                    ...hotelFormData, 
                    images: e.target.value.split(',').map(url => url.trim()).filter(url => url) 
                  })}
                />
              </div>

              <div className="form-group">
                <label>Amenities (comma separated)</label>
                <input
                  type="text"
                  placeholder="WiFi, Pool, Parking, Restaurant"
                  onChange={(e) => setHotelFormData({ 
                    ...hotelFormData, 
                    amenities: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                  })}
                />
              </div>

              <div className="form-group">
                <label>Policies (one per line)</label>
                <textarea
                  placeholder="Check-in: 3:00 PM&#10;Check-out: 11:00 AM&#10;Cancellation: Free cancellation up to 24 hours"
                  onChange={(e) => setHotelFormData({ 
                    ...hotelFormData, 
                    policies: e.target.value.split('\n').map(policy => policy.trim()).filter(policy => policy) 
                  })}
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowHotelModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {selectedHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Manage Booking</h2>
            <div className="booking-details">
              <p><strong>User:</strong> {selectedBooking.user?.email}</p>
              <p><strong>Hotel:</strong> {selectedBooking.hotel?.name}</p>
              <p><strong>Dates:</strong> {formatDate(selectedBooking.check_in_date)} - {formatDate(selectedBooking.check_out_date)}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedBooking.total_amount)}</p>
              <p><strong>Current Status:</strong> {selectedBooking.booking_status}</p>
            </div>
            <div className="status-actions">
              <button
                className="btn-confirm"
                onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'confirmed')}
              >
                Confirm
              </button>
              <button
                className="btn-cancel"
                onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'cancelled')}
              >
                Cancel
              </button>
            </div>
            <button className="btn-close" onClick={() => setShowBookingModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
