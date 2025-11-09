// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './store/'
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FavoritesPage from './pages/FavoritesPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ProtectedRoute from './middleware/ProtectedRoute';
import './App.css';
import PaymentMethodPage from './pages/PaymentMethodPage';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="hotels" element={<HotelsPage />} />
                  <Route path="hotels/:hotelId" element={<HotelDetailsPage />} />
                  <Route path="booking/:hotelId" element={<BookingPage />} />
                  <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                  <Route path='payment/:hotelId' element={<ProtectedRoute><PaymentMethodPage /></ProtectedRoute>} />
                  <Route path="booking-confirmation" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="admin/*" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;

