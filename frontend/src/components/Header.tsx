import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { FaBars, FaTimes, FaSearch, FaMoon, FaSun} from 'react-icons/fa';
import HotelIcon from '../assets/HotelIcon.png';
import FavoriteIcon from '../assets/Favourite.png';
import LoginIcon from '../assets/Login.png';
import LogoutIcon from '../assets/Log-out.png';
import UserIcon from '../assets/User.png';
import NotificationBell from './NotificationBell';
import './Header.css';
import './NotificationBell.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hotels?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleTheme = () => {
    dispatch({ type: 'ui/setTheme', payload: theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <header className={`header ${theme}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" style={{textDecoration: "none"}}>
            <h1>HotelEase</h1>
          </Link>

          {/* Search Bar */}
          <div className={`search-container ${isSearchOpen ? 'active' : ''}`}>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search hotels, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Navigation */}
          <nav id="main-navigation" className={`nav ${isMenuOpen ? 'active' : ''}`}>

            <button 
                className="close-btn" 
                onClick={() => setIsMenuOpen(false)} // <--- Set state directly to false
                aria-label="Close Menu"
            >
                &times; {/* HTML entity for 'X' or an icon like FaTimes */}
            </button>

            <Link to="/hotels" className="nav-link">
              <img src={HotelIcon} alt="HotelIcon" width={20} />
              Hotels
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link profile-link">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || "Profile"}
                      className="profile-avatar"
                      width={32}
                      height={32}
                      style={{ borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
                    />
                  ) : (
                    <span className="profile-avatar initials">
                      {user?.name
                        ? user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : <img src={UserIcon} alt="user icon" width={32} />}
                    </span>
                  )}
                  Profile
                </Link>

                <Link to="/favorites" className="nav-link">
                  <img src={FavoriteIcon} alt="favorite icon" width={20} />
                  Favorites
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-link logout-btn">
                  <img src={LogoutIcon} alt="logout icon" width={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/favorites" className='nav-link'>
                  <img src={FavoriteIcon} alt="favorite icon" width={20} />
                  Favorites
                </Link>
                <Link to="/login" className="nav-link">
                <img src={LoginIcon} alt="login icon" width={20} />
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                <img src={UserIcon} alt="user icon" width={20} />
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="header-actions">
            {isAuthenticated && (
              <NotificationBell />
            )}
            {/* <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="action-btn search-toggle"
            >
              <FaSearch />
            </button> */}
            
            <button onClick={toggleTheme} className="action-btn theme-toggle">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="action-btn menu-toggle" 
              aria-expanded={isMenuOpen}
              aria-controls="main-navigation"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

