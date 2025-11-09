import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Show error toast
      if (error.response.status >= 400) {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data: { first_name?: string; last_name?: string; phone?: string; avatar_url?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Hotels API
export const hotelsAPI = {
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    city?: string;
    country?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    search?: string;
  }) => {
    const response = await api.get('/hotels', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/hotels', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/hotels/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },
  
  addImages: async (hotelId: string, images: string[]) => {
    const response = await api.post(`/hotels/${hotelId}/images`, { images });
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (data: any) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },
  
  getMyBookings: async (filters?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/bookings/my-bookings', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  cancel: async (id: string, reason?: string) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
  
  createPaymentIntent: async (bookingId: string) => {
    const response = await api.post('/bookings/payment-intent', { bookingId });
    return response.data;
  },
  
  confirmPayment: async (paymentIntentId: string, bookingId: string) => {
    const response = await api.post('/bookings/confirm-payment', { paymentIntentId, bookingId });
    return response.data;
  },
};

// User Features API
export const userAPI = {
  addFavorite: async (hotelId: string) => {
    const response = await api.post('/users/favorites', { hotelId });
    return response.data;
  },
  
  removeFavorite: async (hotelId: string) => {
    const response = await api.delete(`/users/favorites/${hotelId}`);
    return response.data;
  },
  
  getFavorites: async (page?: number, limit?: number) => {
    const response = await api.get('/users/favorites', { params: { page, limit } });
    return response.data;
  },
  
  checkFavorite: async (hotelId: string) => {
    const response = await api.get(`/users/favorites/check/${hotelId}`);
    return response.data;
  },
  
  createReview: async (hotelId: string, data: { rating: number; title?: string; comment?: string; booking_id?: string }) => {
    const response = await api.post(`/users/hotels/${hotelId}/reviews`, data);
    return response.data;
  },
  
  getHotelReviews: async (hotelId: string, page?: number, limit?: number) => {
    const response = await api.get(`/users/hotels/${hotelId}/reviews`, { params: { page, limit } });
    return response.data;
  },
  
  getNotifications: async (unreadOnly?: boolean, page?: number, limit?: number) => {
    const response = await api.get('/users/notifications', { params: { unreadOnly, page, limit } });
    return response.data;
  },
  
  markNotificationRead: async (id: string) => {
    const response = await api.put(`/users/notifications/${id}/read`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  
  getAllUsers: async (page?: number, limit?: number) => {
    const response = await api.get('/admin/users', { params: { page, limit } });
    return response.data;
  },
  
  getAllHotels: async (filters?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/hotels', { params: filters });
    return response.data;
  },
  
  updateHotel: async (id: string, data: any) => {
    const response = await api.put(`/admin/hotels/${id}`, data);
    return response.data;
  },
  
  deleteHotel: async (id: string) => {
    const response = await api.delete(`/admin/hotels/${id}`);
    return response.data;
  },
  
  getAllBookings: async (filters?: { status?: string; hotel_id?: string; user_id?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/bookings', { params: filters });
    return response.data;
  },
  
  updateBookingStatus: async (id: string, status: string, cancellation_reason?: string) => {
    const response = await api.put(`/admin/bookings/${id}/status`, { status, cancellation_reason });
    return response.data;
  },
  
  approveReview: async (id: string) => {
    const response = await api.put(`/admin/reviews/${id}/approve`);
    return response.data;
  },
  
  processRefund: async (bookingId: string, amount?: number, reason?: string) => {
    const response = await api.post(`/admin/refunds/${bookingId}`, { amount, reason });
    return response.data;
  },
};

export default api;

