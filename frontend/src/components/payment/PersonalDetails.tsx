import React, { useState } from 'react';
import { FaPhone } from 'react-icons/fa';

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

interface PersonalDetailsProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
}

interface PersonalInfo {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onPrevious, 
  currentStep 
}) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    country: 'South Africa',
    phoneCode: '+27',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState<Partial<PersonalInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalInfo> = {};

    if (!personalInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!personalInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (personalInfo.email !== personalInfo.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      // Store personal info in booking data
      updateBookingData({
        personalInfo: personalInfo as any
      });
      onNext();
    }
  };

  const countries = [
    'South Africa', 'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Italy', 'Spain', 'Netherlands'
  ];

  const phoneCodes = [
    { code: '+27', country: 'South Africa' },
    { code: '+1', country: 'United States' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+61', country: 'Australia' },
    { code: '+49', country: 'Germany' }
  ];

  return (
    <div className="personal-details">
      <div className="step-header">
        <h2>Personal details</h2>
        <p>Enter your Details</p>
      </div>

      <form className="personal-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <select
            id="title"
            value={personalInfo.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="form-select"
          >
            <option value="">Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            value={personalInfo.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            value={personalInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`form-input ${errors.lastName ? 'error' : ''}`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmEmail">Confirm Email Address</label>
          <input
            type="email"
            id="confirmEmail"
            value={personalInfo.confirmEmail}
            onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
            className={`form-input ${errors.confirmEmail ? 'error' : ''}`}
            placeholder="Confirm your email"
          />
          {errors.confirmEmail && <span className="error-message">{errors.confirmEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="country">Country/Region</label>
          <select
            id="country"
            value={personalInfo.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="form-select"
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone number</label>
          <div className="phone-input-group">
            <select
              value={personalInfo.phoneCode}
              onChange={(e) => handleInputChange('phoneCode', e.target.value)}
              className="phone-code-select"
            >
              {phoneCodes.map(({ code, country }) => (
                <option key={code} value={code}>{code} {country}</option>
              ))}
            </select>
            <input
              type="tel"
              id="phone"
              value={personalInfo.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="phone-number-input"
              placeholder="Phone number"
            />
          </div>
        </div>

        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" onClick={onPrevious} className="btn btn-secondary">
              Previous
            </button>
          )}
          <button type="button" onClick={handleNext} className="btn btn-primary">
            Next Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
