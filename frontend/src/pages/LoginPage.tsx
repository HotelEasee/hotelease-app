import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { RootState } from '@/store/index';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './LoginPage.css';
import HotelImage from '../assets/Capital.jpg'

const LoginPage: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      
      // Format user data for Redux
      const formattedUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        is_verified: user.is_verified,
      };

      dispatch(loginSuccess({ user: formattedUser, token }));
      
      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
        toast.success('Welcome Admin!');
      } else {
        navigate('/hotels');
        toast.success('Login successful!');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    }
  };



  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-form">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account</p>

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-group">
                  {/* <FaEnvelope className="input-icon" /> */}
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  {/* <FaLock className="input-icon" /> */}
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {authState.error && <p className="error-message">{authState.error}</p>}
              <button type="submit" className="login-btn" disabled={authState.isLoading}>
                {authState.isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="oauth-buttons">
              <button 
                className="oauth-btn google-btn"
                onClick={() => {
                  // OAuth implementation will be added when backend OAuth is ready
                  toast.info('Google OAuth coming soon!');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.96-2.184l-2.908-2.258c-.806.54-1.837.86-3.052.86-2.347 0-4.333-1.584-5.038-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.962 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.005-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.962 7.293C4.667 5.156 6.653 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button 
                className="oauth-btn facebook-btn"
                onClick={() => {
                  // OAuth implementation will be added when backend OAuth is ready
                  toast.info('Facebook OAuth coming soon!');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>

            <p className="signup-link">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>

          <div className="login-image">
            <img src={HotelImage} alt="Luxury hotel room" />
            <div className="image-overlay">
              <h2>Discover Amazing Hotels</h2>
              <p>Find and book the perfect accommodation for your next trip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

