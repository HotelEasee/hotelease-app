import React from 'react';
import './ForgotPasswordPage.css';
import PasswordImage from '../assets/Password.png'
import { FaEnvelope } from 'react-icons/fa';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-password-container">
          <div className="forgot-password-form">
            <h1 className="forgot-password-title">Forgot Password</h1>
            <p className="forgot-password-subtitle">Please enter your email address to reset your password.</p>

            <form className="form">
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="forgot-password-btn">
                Send
              </button>

            </form>
          </div>

          <div className="forgot-password-image">
            <img src={PasswordImage} alt="Luxury hotel room" />
            <div className="image-overlay">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

