import React from 'react';
import './LandingPage.css';
import landingPageImage from '../assets/Image.png';
import landingPageImage1 from '../assets/Image-1.png';
import landingPageImage2 from '../assets/Image-2.png';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Smart Hotel Booking Made Simple</h1>
            <p className="hero-description">
              Experience a seamless way to discover, book, and manage hotel stays. 
              Our Hotel Management System connects users with the best hotels.
            </p>
          </div>
          <div className="hero-image">
            <img src={landingPageImage} alt="Luxury hotel room with ocean view" />
          </div>
        </section>

        {/* Feature Description Section */}
        <section className="feature-section">
          <div className="feature-content">
            <p className="feature-text">
              Browse through available hotels, compare prices, view room details, 
              and confirm bookings instantly — all from one platform.
            {/* </p>
            <p className="feature-text"> */}
              Our platform ensures smooth navigation, secure account management, 
              and an intuitive interface for guests.
            </p>
          </div>
        </section>

        {/* Supporting Images Section */}
        <section className="images-section">
          <div className="image-container">
            <img src={landingPageImage1} alt="City street view" className="supporting-image" />
            <img src={landingPageImage2} alt="Hotel neon sign" className="supporting-image" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
