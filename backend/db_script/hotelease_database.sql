-- HotelEase Database Script for PostgreSQL
-- Comprehensive database for HotelEase hotel booking application
-- Supports all features: OAuth, CRUD operations, payments, admin panel, reviews, notifications
-- Real South African hotels included

-- Create database (run this separately in pgAdmin)
-- CREATE DATABASE hotelease;

-- Connect to the database
-- \c hotelease;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- USER AUTHENTICATION TABLES
-- ==============================================

-- Create Users table (enhanced for OAuth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    nationality VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth providers table
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'google', 'facebook', 'github', etc.
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User OAuth accounts table
CREATE TABLE user_oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES oauth_providers(id),
    provider_user_id VARCHAR(255) NOT NULL, -- External provider's user ID
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, provider_user_id)
);

-- ==============================================
-- HOTEL MANAGEMENT TABLES
-- ==============================================

-- Create Hotels table (enhanced)
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly name
    description TEXT,
    short_description VARCHAR(500),
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'South Africa',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    star_rating INTEGER DEFAULT 3 CHECK (star_rating >= 1 AND star_rating <= 5),
    price_per_night DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    total_rooms INTEGER NOT NULL DEFAULT 0,
    available_rooms INTEGER NOT NULL DEFAULT 0,
    check_in_time TIME DEFAULT '15:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    cancellation_policy TEXT,
    pet_policy TEXT,
    age_restriction TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Images table (enhanced)
CREATE TABLE hotel_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Amenities table (enhanced)
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    category VARCHAR(50) DEFAULT 'general', -- 'general', 'room', 'dining', 'recreation', 'business', 'accessibility'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Amenities junction table
CREATE TABLE hotel_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    is_complimentary BOOLEAN DEFAULT true,
    additional_cost DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id, amenity_id)
);

-- Room Types table (enhanced)
CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    max_occupancy INTEGER NOT NULL DEFAULT 2,
    max_adults INTEGER NOT NULL DEFAULT 2,
    max_children INTEGER DEFAULT 0,
    base_price DECIMAL(10, 2) NOT NULL,
    size_sqm INTEGER,
    bed_type VARCHAR(50),
    bed_count INTEGER DEFAULT 1,
    has_balcony BOOLEAN DEFAULT false,
    has_kitchen BOOLEAN DEFAULT false,
    has_wifi BOOLEAN DEFAULT true,
    has_tv BOOLEAN DEFAULT true,
    has_ac BOOLEAN DEFAULT false,
    has_minibar BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id, slug)
);

-- Room Images table
CREATE TABLE room_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- BOOKING MANAGEMENT TABLES
-- ==============================================

-- Bookings table (enhanced)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL, -- Human-readable booking ref
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    user_id UUID NOT NULL REFERENCES users(id),
    room_type_id UUID REFERENCES room_types(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    rooms INTEGER NOT NULL DEFAULT 1,
    base_price DECIMAL(10, 2) NOT NULL,
    taxes DECIMAL(10, 2) DEFAULT 0.00,
    fees DECIMAL(10, 2) DEFAULT 0.00,
    discounts DECIMAL(10, 2) DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    special_requests TEXT,
    guest_notes TEXT,
    internal_notes TEXT, -- Admin notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Guests table (for multiple guests)
CREATE TABLE booking_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    is_primary_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- PAYMENT MANAGEMENT TABLES
-- ==============================================

-- Payment Methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    processing_fee_percentage DECIMAL(5, 4) DEFAULT 0.0000,
    processing_fee_fixed DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    transaction_id VARCHAR(255), -- External payment processor ID
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    gateway_response TEXT, -- JSON response from payment gateway
    failure_reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refunds table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    stripe_refund_id VARCHAR(255),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- REVIEWS AND RATINGS TABLES
-- ==============================================

-- Reviews table (enhanced)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    pros TEXT,
    cons TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    response_from_hotel TEXT,
    response_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id, user_id, booking_id)
);

-- Review Images table
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- USER INTERACTION TABLES
-- ==============================================

-- Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hotel_id)
);

-- Notifications table (enhanced)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'booking', 'payment', 'promotion')),
    category VARCHAR(50) DEFAULT 'general', -- 'booking', 'payment', 'promotion', 'system'
    is_read BOOLEAN DEFAULT false,
    is_email_sent BOOLEAN DEFAULT false,
    is_sms_sent BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB, -- Additional data for the notification
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Search History table
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(500),
    location VARCHAR(255),
    check_in_date DATE,
    check_out_date DATE,
    adults INTEGER,
    children INTEGER,
    rooms INTEGER,
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    amenities TEXT[], -- Array of amenity IDs
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ADMIN MANAGEMENT TABLES
-- ==============================================

-- Admin Actions Log table
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL, -- 'create_hotel', 'update_booking', 'cancel_booking', etc.
    target_type VARCHAR(50), -- 'hotel', 'booking', 'user', etc.
    target_id UUID,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Availability table (for managing room availability)
CREATE TABLE hotel_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_rooms INTEGER NOT NULL DEFAULT 0,
    price_override DECIMAL(10, 2), -- Override base price for specific dates
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id, room_type_id, date)
);

-- ==============================================
-- SYSTEM TABLES
-- ==============================================

-- System Settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_key VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB, -- Available template variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INSERT INITIAL DATA
-- ==============================================

-- Insert OAuth Providers
INSERT INTO oauth_providers (name, display_name) VALUES
('google', 'Google'),
('facebook', 'Facebook'),
('github', 'GitHub'),
('microsoft', 'Microsoft');

-- Insert Payment Methods
INSERT INTO payment_methods (name, display_name, processing_fee_percentage) VALUES
('stripe_card', 'Credit/Debit Card', 0.0290),
('stripe_bank_transfer', 'Bank Transfer', 0.0080),
('paypal', 'PayPal', 0.0340),
('eft', 'EFT (South Africa)', 0.0000);

-- Insert Amenities
INSERT INTO amenities (name, icon, description, category) VALUES
-- General Amenities
('Free WiFi', 'wifi', 'Complimentary high-speed internet access', 'general'),
('Parking', 'parking', 'Free parking for guests', 'general'),
('Airport Shuttle', 'shuttle', 'Complimentary airport transportation', 'general'),
('Concierge', 'concierge', 'Personal concierge services', 'general'),
('24-Hour Front Desk', 'front-desk', 'Round-the-clock front desk service', 'general'),
('Luggage Storage', 'luggage', 'Secure luggage storage facilities', 'general'),
('Laundry Service', 'laundry', 'Professional laundry and dry cleaning', 'general'),

-- Room Amenities
('Air Conditioning', 'ac', 'Climate control in all rooms', 'room'),
('Mini Bar', 'minibar', 'In-room mini bar and refrigerator', 'room'),
('Room Service', 'room-service', '24-hour room service available', 'room'),
('Safe', 'safe', 'In-room safety deposit box', 'room'),
('Balcony', 'balcony', 'Private balcony or terrace', 'room'),
('Kitchenette', 'kitchen', 'Small kitchenette with basic appliances', 'room'),

-- Recreation Amenities
('Swimming Pool', 'pool', 'Outdoor or indoor swimming pool', 'recreation'),
('Spa', 'spa', 'Full-service spa and wellness center', 'recreation'),
('Fitness Center', 'fitness', '24/7 fitness and gym facilities', 'recreation'),
('Tennis Court', 'tennis', 'Tennis courts available', 'recreation'),
('Golf Course', 'golf', 'On-site golf course', 'recreation'),
('Beach Access', 'beach', 'Direct beach access', 'recreation'),
('Kids Club', 'kids', 'Children''s activities and club', 'recreation'),

-- Dining Amenities
('Restaurant', 'restaurant', 'On-site restaurant and dining', 'dining'),
('Bar', 'bar', 'Full-service bar and lounge', 'dining'),
('Breakfast Included', 'breakfast', 'Complimentary breakfast', 'dining'),
('Coffee Shop', 'coffee', 'Coffee shop and café', 'dining'),

-- Business Amenities
('Business Center', 'business', 'Business services and meeting rooms', 'business'),
('Meeting Rooms', 'meeting', 'Conference and meeting facilities', 'business'),
('Event Space', 'events', 'Wedding and event venues', 'business'),

-- Accessibility Amenities
('Wheelchair Accessible', 'wheelchair', 'Fully accessible for wheelchair users', 'accessibility'),
('Elevator', 'elevator', 'Elevator access to all floors', 'accessibility'),
('Assistive Listening', 'hearing', 'Assistive listening devices available', 'accessibility'),

-- Pet Amenities
('Pet Friendly', 'pets', 'Pet-friendly accommodations', 'general');

-- Insert Real South African Hotels
INSERT INTO hotels (name, slug, description, short_description, location, address, city, province, postal_code, latitude, longitude, star_rating, price_per_night, rating, review_count, total_rooms, available_rooms, contact_phone, contact_email, website_url) VALUES
('The Table Bay Hotel', 'table-bay-hotel', 'Luxury waterfront hotel with stunning views of Table Mountain and the Atlantic Ocean. Located in the heart of Cape Town''s V&A Waterfront, this iconic hotel offers world-class service and exceptional amenities.', 'Luxury waterfront hotel with Table Mountain views', 'Cape Town', 'Quay 6, V&A Waterfront, Cape Town, 8001', 'Cape Town', 'Western Cape', '8001', -33.9048, 18.4207, 5, 4500.00, 4.8, 1247, 329, 45, '+27214060000', 'info@tablebayhotel.co.za', 'https://www.tablebayhotel.co.za'),
('Saxon Hotel, Villas & Spa', 'saxon-hotel-villas-spa', 'Ultra-luxury boutique hotel in Sandhurst, Johannesburg. Features world-class spa facilities, exceptional service, and exclusive villas with private pools.', 'Ultra-luxury boutique hotel with spa', 'Johannesburg', '36 Saxon Road, Sandhurst, Sandton, 2196', 'Sandton', 'Gauteng', '2196', -26.1025, 28.0436, 5, 8500.00, 4.9, 892, 53, 8, '+27118060000', 'reservations@saxon.co.za', 'https://www.saxon.co.za'),
('One&Only Cape Town', 'one-only-cape-town', 'Exclusive island resort in the heart of Cape Town''s V&A Waterfront, offering unparalleled luxury and service with breathtaking harbor views.', 'Exclusive island resort with harbor views', 'Cape Town', 'Dock Road, V&A Waterfront, Cape Town, 8001', 'Cape Town', 'Western Cape', '8001', -33.9048, 18.4207, 5, 12000.00, 4.9, 756, 131, 12, '+27214030000', 'reservations@oneandonlycapetown.com', 'https://www.oneandonlyresorts.com'),
('The Oyster Box', 'oyster-box-hotel', 'Iconic beachfront hotel in Umhlanga with breathtaking Indian Ocean views and colonial charm. A landmark destination on the KwaZulu-Natal coast.', 'Iconic beachfront hotel with ocean views', 'Durban', '2 Lighthouse Road, Umhlanga Rocks, 4320', 'Umhlanga', 'KwaZulu-Natal', '4320', -29.7314, 31.0889, 5, 3200.00, 4.7, 1089, 86, 15, '+27315610000', 'reservations@oysterboxhotel.co.za', 'https://www.oysterboxhotel.co.za'),
('Mount Nelson Hotel', 'mount-nelson-hotel', 'Historic pink palace hotel at the foot of Table Mountain, offering timeless elegance and luxury. A Cape Town institution since 1899.', 'Historic pink palace at Table Mountain', 'Cape Town', '76 Orange Street, Gardens, Cape Town, 8001', 'Cape Town', 'Western Cape', '8001', -33.9308, 18.4158, 5, 3800.00, 4.6, 1456, 201, 28, '+27214830000', 'reservations@mountnelson.co.za', 'https://www.mountnelson.co.za'),
('The Palace of the Lost City', 'palace-lost-city', 'Fantasy-themed luxury resort in Sun City with world-class golf courses, entertainment, and the famous Valley of Waves water park.', 'Fantasy-themed luxury resort with golf', 'Sun City', 'Sun City Resort, North West Province, 0316', 'Sun City', 'North West', '0316', -25.3307, 27.0938, 5, 2800.00, 4.5, 2034, 338, 42, '+27148150000', 'reservations@suninternational.com', 'https://www.suninternational.com'),
('The Twelve Apostles Hotel', 'twelve-apostles-hotel', 'Boutique luxury hotel on the Atlantic seaboard with dramatic mountain and ocean views. Perfect for romantic getaways and special occasions.', 'Boutique luxury with mountain views', 'Cape Town', 'Victoria Road, Camps Bay, Cape Town, 8005', 'Camps Bay', 'Western Cape', '8005', -33.9508, 18.3758, 5, 4200.00, 4.7, 678, 70, 9, '+27214370000', 'reservations@12apostles.co.za', 'https://www.12apostles.co.za'),
('The Michelangelo Hotel', 'michelangelo-hotel', 'Sophisticated luxury hotel in Sandton with panoramic city views and exceptional dining. The heart of Johannesburg''s business district.', 'Sophisticated luxury in Sandton', 'Johannesburg', '135 Rivonia Road, Sandton, 2196', 'Sandton', 'Gauteng', '2196', -26.1025, 28.0436, 5, 2800.00, 4.4, 1123, 242, 35, '+27118020000', 'reservations@michelangelo.co.za', 'https://www.michelangelo.co.za'),
('The Silo Hotel', 'silo-hotel', 'Contemporary luxury hotel in Cape Town''s historic grain silo with stunning harbor views. A masterpiece of modern architecture.', 'Contemporary luxury in historic silo', 'Cape Town', 'Silo Square, V&A Waterfront, Cape Town, 8001', 'Cape Town', 'Western Cape', '8001', -33.9048, 18.4207, 5, 15000.00, 4.9, 445, 28, 3, '+27214060000', 'reservations@thesilo.co.za', 'https://www.thesilo.co.za'),
('The Westcliff Hotel', 'westcliff-hotel', 'Historic luxury hotel in Johannesburg with panoramic city views and elegant colonial architecture. A landmark of sophistication.', 'Historic luxury with city views', 'Johannesburg', '67 Jan Smuts Avenue, Westcliff, 2193', 'Westcliff', 'Gauteng', '2193', -26.1808, 28.0306, 5, 3200.00, 4.5, 789, 117, 18, '+27114840000', 'reservations@westcliff.co.za', 'https://www.westcliff.co.za'),
('The Cellars-Hohenort', 'cellars-hohenort', 'Boutique country house hotel in Constantia with beautiful gardens and award-winning restaurants. A peaceful retreat in wine country.', 'Boutique country house in wine country', 'Cape Town', '93 Brommersvlei Road, Constantia, Cape Town, 7806', 'Constantia', 'Western Cape', '7806', -34.0208, 18.4158, 5, 2800.00, 4.6, 567, 51, 7, '+27217940000', 'reservations@cellars-hohenort.co.za', 'https://www.cellars-hohenort.co.za'),
('The Plettenberg Hotel', 'plettenberg-hotel', 'Luxury beachfront hotel in Plettenberg Bay with pristine beaches and whale watching opportunities. Perfect for nature lovers.', 'Luxury beachfront with whale watching', 'Plettenberg Bay', '40 Church Street, Plettenberg Bay, 6600', 'Plettenberg Bay', 'Western Cape', '6600', -34.0528, 23.3714, 5, 2500.00, 4.5, 423, 37, 5, '+27445710000', 'reservations@plettenberg.co.za', 'https://www.plettenberg.co.za'),
('The Royal Hotel', 'royal-hotel', 'Historic luxury hotel in Riebeek-Kasteel with authentic Cape Dutch architecture and fine dining. A journey through South African history.', 'Historic luxury with Cape Dutch charm', 'Riebeek-Kasteel', '8 Church Street, Riebeek-Kasteel, 7307', 'Riebeek-Kasteel', 'Western Cape', '7307', -33.3908, 18.8986, 4, 1800.00, 4.3, 234, 24, 4, '+27225020000', 'reservations@royalhotel.co.za', 'https://www.royalhotel.co.za'),
('The Marine Hotel', 'marine-hotel', 'Elegant beachfront hotel in Hermanus with spectacular whale watching and coastal views. The whale watching capital of South Africa.', 'Elegant beachfront with whale watching', 'Hermanus', 'Marine Drive, Hermanus, 7200', 'Hermanus', 'Western Cape', '7200', -34.4208, 19.2408, 4, 2200.00, 4.4, 345, 42, 6, '+27283010000', 'reservations@marinehotel.co.za', 'https://www.marinehotel.co.za'),
('The Garden Route Game Lodge', 'garden-route-game-lodge', 'Luxury safari lodge in the Garden Route with Big Five game viewing and eco-friendly practices. Where luxury meets wilderness.', 'Luxury safari lodge with Big Five', 'Garden Route', 'N2 Highway, Knysna, 6571', 'Knysna', 'Western Cape', '6571', -34.0358, 23.0486, 5, 3500.00, 4.7, 189, 18, 2, '+27443810000', 'reservations@gardenroutegamelodge.co.za', 'https://www.gardenroutegamelodge.co.za');

-- Insert Hotel Images (sample images for each hotel)
INSERT INTO hotel_images (hotel_id, image_url, alt_text, caption, is_primary, display_order) VALUES
-- The Table Bay Hotel
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'Table Bay Hotel exterior with Table Mountain view', 'Iconic waterfront location', true, 1),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', 'Table Bay Hotel luxury room', 'Elegant accommodation', false, 2),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b', 'Table Bay Hotel restaurant', 'Fine dining experience', false, 3),

-- Saxon Hotel
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), 'https://images.unsplash.com/photo-1564501049412-61c2a3083791', 'Saxon Hotel luxury villa exterior', 'Exclusive villa accommodation', true, 1),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461', 'Saxon Hotel spa facilities', 'World-class spa services', false, 2),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061', 'Saxon Hotel presidential suite', 'Ultimate luxury', false, 3),

-- One&Only Cape Town
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9', 'One&Only Cape Town waterfront view', 'Exclusive island resort', true, 1),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061', 'One&Only Cape Town luxury suite', 'Unparalleled luxury', false, 2),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b', 'One&Only Cape Town dining', 'Exceptional dining', false, 3);

-- Insert Hotel Amenities (assigning amenities to hotels)
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
-- The Table Bay Hotel
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Free WiFi')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Swimming Pool')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Spa')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Restaurant')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Parking')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Fitness Center')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = 'Concierge')),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM amenities WHERE name = '24-Hour Front Desk')),

-- Saxon Hotel
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Free WiFi')),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Spa')),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Restaurant')),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Parking')),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Fitness Center')),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Concierge')),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), (SELECT id FROM amenities WHERE name = 'Airport Shuttle')),

-- One&Only Cape Town
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Free WiFi')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Swimming Pool')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Spa')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Restaurant')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Parking')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Fitness Center')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = 'Concierge')),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), (SELECT id FROM amenities WHERE name = '24-Hour Front Desk'));

-- Insert Room Types for sample hotels
INSERT INTO room_types (hotel_id, name, slug, description, max_occupancy, max_adults, max_children, base_price, size_sqm, bed_type, bed_count) VALUES
-- The Table Bay Hotel
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), 'Deluxe Room', 'deluxe-room', 'Spacious room with Table Mountain views and modern amenities', 2, 2, 0, 4500.00, 35, 'King', 1),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), 'Executive Suite', 'executive-suite', 'Luxury suite with separate living area and harbor views', 4, 3, 1, 7500.00, 65, 'King', 1),
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), 'Presidential Suite', 'presidential-suite', 'Ultimate luxury with panoramic views and butler service', 6, 4, 2, 15000.00, 120, 'King', 1),

-- Saxon Hotel
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), 'Garden Villa', 'garden-villa', 'Private villa with garden access and luxury amenities', 2, 2, 0, 8500.00, 45, 'King', 1),
((SELECT id FROM hotels WHERE name = 'Saxon Hotel, Villas & Spa'), 'Presidential Villa', 'presidential-villa', 'Ultimate luxury villa with private pool and personal butler', 4, 3, 1, 18000.00, 150, 'King', 2),

-- One&Only Cape Town
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), 'Island Room', 'island-room', 'Exclusive island accommodation with harbor views', 2, 2, 0, 12000.00, 40, 'King', 1),
((SELECT id FROM hotels WHERE name = 'One&Only Cape Town'), 'Island Suite', 'island-suite', 'Luxury suite with harbor views and private terrace', 4, 3, 1, 20000.00, 80, 'King', 1);

-- Insert sample admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, email_verified_at) VALUES
('admin@hotelease.co.za', '$2b$10$rQZ8K9mN2pL3oI4uY5vW6eR7tY8uI9oP0aS1dF2gH3jK4lM5nB6cV7xZ8', 'Admin', 'User', 'admin', true, CURRENT_TIMESTAMP);

-- Insert sample regular users
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_verified, email_verified_at) VALUES
('john.doe@email.com', '$2b$10$rQZ8K9mN2pL3oI4uY5vW6eR7tY8uI9oP0aS1dF2gH3jK4lM5nB6cV7xZ8', 'John', 'Doe', '+27123456789', true, CURRENT_TIMESTAMP),
('jane.smith@email.com', '$2b$10$rQZ8K9mN2pL3oI4uY5vW6eR7tY8uI9oP0aS1dF2gH3jK4lM5nB6cV7xZ8', 'Jane', 'Smith', '+27987654321', true, CURRENT_TIMESTAMP),
('mike.wilson@email.com', '$2b$10$rQZ8K9mN2pL3oI4uY5vW6eR7tY8uI9oP0aS1dF2gH3jK4lM5nB6cV7xZ8', 'Mike', 'Wilson', '+27555666777', true, CURRENT_TIMESTAMP);

-- Insert sample bookings
INSERT INTO bookings (booking_reference, hotel_id, user_id, room_type_id, check_in_date, check_out_date, nights, adults, children, rooms, base_price, taxes, total_price, status, payment_status) VALUES
('TBH2024001', (SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM users WHERE email = 'john.doe@email.com'), 
 (SELECT id FROM room_types WHERE name = 'Deluxe Room' AND hotel_id = (SELECT id FROM hotels WHERE name = 'The Table Bay Hotel')),
 '2024-02-15', '2024-02-18', 3, 2, 0, 1, 13500.00, 2025.00, 15525.00, 'confirmed', 'paid'),

('OBH2024001', (SELECT id FROM hotels WHERE name = 'The Oyster Box'), (SELECT id FROM users WHERE email = 'jane.smith@email.com'),
 (SELECT id FROM room_types WHERE name = 'Ocean View Room' AND hotel_id = (SELECT id FROM hotels WHERE name = 'The Oyster Box')),
 '2024-03-01', '2024-03-05', 4, 2, 0, 1, 12800.00, 1920.00, 14720.00, 'confirmed', 'paid'),

('MNH2024001', (SELECT id FROM hotels WHERE name = 'Mount Nelson Hotel'), (SELECT id FROM users WHERE email = 'mike.wilson@email.com'),
 (SELECT id FROM room_types WHERE name = 'Classic Room' AND hotel_id = (SELECT id FROM hotels WHERE name = 'Mount Nelson Hotel')),
 '2024-03-10', '2024-03-12', 2, 1, 0, 1, 7600.00, 1140.00, 8740.00, 'pending', 'pending');

-- Insert sample reviews
INSERT INTO reviews (hotel_id, user_id, booking_id, overall_rating, cleanliness_rating, service_rating, location_rating, value_rating, title, comment, is_verified) VALUES
((SELECT id FROM hotels WHERE name = 'The Table Bay Hotel'), (SELECT id FROM users WHERE email = 'john.doe@email.com'),
 (SELECT id FROM bookings WHERE booking_reference = 'TBH2024001'),
 5, 5, 5, 5, 4, 'Absolutely Amazing!', 'The Table Bay Hotel exceeded all our expectations. The views of Table Mountain are breathtaking and the service is impeccable. The room was spotless and the staff went above and beyond.', true),

((SELECT id FROM hotels WHERE name = 'The Oyster Box'), (SELECT id FROM users WHERE email = 'jane.smith@email.com'),
 (SELECT id FROM bookings WHERE booking_reference = 'OBH2024001'),
 5, 5, 4, 5, 4, 'Perfect Beachfront Location', 'The Oyster Box is a true gem. The beachfront location is perfect and the colonial charm is authentic. The breakfast was outstanding and the room was very comfortable.', true);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, category, action_url) VALUES
((SELECT id FROM users WHERE email = 'john.doe@email.com'), 'Booking Confirmed', 'Your booking at The Table Bay Hotel has been confirmed!', 'success', 'booking', '/bookings/TBH2024001'),
((SELECT id FROM users WHERE email = 'jane.smith@email.com'), 'Payment Successful', 'Your payment for The Oyster Box has been processed successfully.', 'success', 'payment', '/bookings/OBH2024001'),
((SELECT id FROM users WHERE email = 'mike.wilson@email.com'), 'Booking Pending', 'Your booking at Mount Nelson Hotel is pending payment confirmation.', 'warning', 'booking', '/bookings/MNH2024001');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'HotelEase', 'string', 'Application name', true),
('app_version', '1.0.0', 'string', 'Application version', true),
('default_currency', 'ZAR', 'string', 'Default currency', true),
('vat_rate', '0.15', 'number', 'VAT rate (15%)', false),
('booking_cancellation_hours', '24', 'number', 'Hours before check-in for free cancellation', true),
('max_booking_days', '365', 'number', 'Maximum days in advance for booking', true),
('min_booking_days', '0', 'number', 'Minimum days in advance for booking', true),
('stripe_publishable_key', 'pk_test_...', 'string', 'Stripe publishable key', false),
('stripe_secret_key', 'sk_test_...', 'string', 'Stripe secret key', false);

-- ==============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_verified ON users(is_verified);

-- Hotel indexes
CREATE INDEX idx_hotels_location ON hotels(location);
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_province ON hotels(province);
CREATE INDEX idx_hotels_price ON hotels(price_per_night);
CREATE INDEX idx_hotels_rating ON hotels(rating);
CREATE INDEX idx_hotels_active ON hotels(is_active);
CREATE INDEX idx_hotels_featured ON hotels(is_featured);
CREATE INDEX idx_hotels_slug ON hotels(slug);
CREATE INDEX idx_hotels_coordinates ON hotels(latitude, longitude);

-- Booking indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Review indexes
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);
CREATE INDEX idx_reviews_verified ON reviews(is_verified);
CREATE INDEX idx_reviews_public ON reviews(is_public);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Search indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_location ON search_history(location);
CREATE INDEX idx_search_history_dates ON search_history(check_in_date, check_out_date);

-- Full-text search indexes
CREATE INDEX idx_hotels_name_search ON hotels USING gin(to_tsvector('english', name));
CREATE INDEX idx_hotels_description_search ON hotels USING gin(to_tsvector('english', description));
CREATE INDEX idx_hotels_location_search ON hotels USING gin(to_tsvector('english', location));

-- ==============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    hotel_code VARCHAR(3);
    year_code VARCHAR(2);
    sequence_num INTEGER;
    new_reference VARCHAR(20);
BEGIN
    -- Get hotel code (first 3 letters of hotel name)
    SELECT UPPER(LEFT(name, 3)) INTO hotel_code FROM hotels WHERE id = NEW.hotel_id;
    
    -- Get year code (last 2 digits)
    year_code := RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2);
    
    -- Get next sequence number for this hotel and year
    SELECT COALESCE(MAX(CAST(RIGHT(booking_reference, 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM bookings 
    WHERE hotel_id = NEW.hotel_id 
    AND booking_reference LIKE hotel_code || year_code || '%';
    
    -- Generate new reference
    new_reference := hotel_code || year_code || LPAD(sequence_num::TEXT, 3, '0');
    
    NEW.booking_reference := new_reference;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for booking reference generation
CREATE TRIGGER trigger_generate_booking_reference
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_reference();

-- Function to update hotel review statistics
CREATE OR REPLACE FUNCTION update_hotel_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE hotels 
        SET 
            rating = (SELECT AVG(overall_rating) FROM reviews WHERE hotel_id = NEW.hotel_id AND is_public = true),
            review_count = (SELECT COUNT(*) FROM reviews WHERE hotel_id = NEW.hotel_id AND is_public = true)
        WHERE id = NEW.hotel_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hotels 
        SET 
            rating = (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE hotel_id = OLD.hotel_id AND is_public = true),
            review_count = (SELECT COUNT(*) FROM reviews WHERE hotel_id = OLD.hotel_id AND is_public = true)
        WHERE id = OLD.hotel_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating hotel review stats
CREATE TRIGGER trigger_update_hotel_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_hotel_review_stats();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON room_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotel_availability_updated_at BEFORE UPDATE ON hotel_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ==============================================

-- Hotel summary view
CREATE VIEW hotel_summary AS
SELECT 
    h.id,
    h.name,
    h.slug,
    h.location,
    h.city,
    h.province,
    h.price_per_night,
    h.currency,
    h.star_rating,
    h.rating,
    h.review_count,
    h.total_rooms,
    h.available_rooms,
    h.is_active,
    h.is_featured,
    h.latitude,
    h.longitude,
    (SELECT image_url FROM hotel_images WHERE hotel_id = h.id AND is_primary = true LIMIT 1) as primary_image,
    (SELECT COUNT(*) FROM hotel_images WHERE hotel_id = h.id) as image_count
FROM hotels h
WHERE h.is_active = true;

-- Booking summary view
CREATE VIEW booking_summary AS
SELECT 
    b.id,
    b.booking_reference,
    b.check_in_date,
    b.check_out_date,
    b.nights,
    b.adults,
    b.children,
    b.rooms,
    b.total_price,
    b.currency,
    b.status,
    b.payment_status,
    b.created_at,
    h.name as hotel_name,
    h.location as hotel_location,
    h.slug as hotel_slug,
    rt.name as room_type_name,
    u.first_name,
    u.last_name,
    u.email as user_email
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
LEFT JOIN room_types rt ON b.room_type_id = rt.id
JOIN users u ON b.user_id = u.id;

-- User dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
    COUNT(DISTINCT f.id) as favorite_hotels,
    COUNT(DISTINCT r.id) as reviews_written,
    COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications,
    u.last_login_at,
    u.created_at
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN reviews r ON u.id = r.user_id
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, u.last_login_at, u.created_at;

-- ==============================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ==============================================

-- Create application user (uncomment and modify as needed)
-- CREATE USER hotelease_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE hotelease TO hotelease_app;
-- GRANT USAGE ON SCHEMA public TO hotelease_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hotelease_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hotelease_app;

COMMIT;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify data was inserted correctly
SELECT 'Hotels' as table_name, COUNT(*) as record_count FROM hotels
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Amenities', COUNT(*) FROM amenities
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- Show sample data
SELECT 'Sample Hotels:' as info;
SELECT name, location, star_rating, price_per_night, rating FROM hotels LIMIT 5;

SELECT 'Sample Bookings:' as info;
SELECT booking_reference, hotel_id, check_in_date, check_out_date, total_price, status FROM bookings LIMIT 3;