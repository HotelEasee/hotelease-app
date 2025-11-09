import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  pricePerNight: number;
  images: string[];
  amenities: string[];
  policies: string[];
  latitude: number;
  longitude: number;
  availability: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HotelFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

interface HotelState {
  hotels: Hotel[];
  filteredHotels: Hotel[];
  currentHotel: Hotel | null;
  favorites: string[];
  filters: HotelFilters;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: HotelState = {
  hotels: [],
  filteredHotels: [],
  currentHotel: null,
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  filters: {},
  isLoading: false,
  error: null,
  searchQuery: '',
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setHotels: (state, action: PayloadAction<Hotel[]>) => {
      state.hotels = action.payload;
      state.filteredHotels = action.payload;
    },
    setCurrentHotel: (state, action: PayloadAction<Hotel>) => {
      state.currentHotel = action.payload;
    },
    setFilters: (state, action: PayloadAction<HotelFilters>) => {
      state.filters = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const hotelId = action.payload;
      const index = state.favorites.indexOf(hotelId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(hotelId);
      }
      localStorage.setItem('favorites', JSON.stringify(state.favorites));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    applyFilters: (state) => {
      let filtered = [...state.hotels];

      // Apply search query
      if (state.searchQuery) {
        filtered = filtered.filter(hotel =>
          hotel.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          hotel.city.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          hotel.country.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
      }

      // Apply price filter
      if (state.filters.minPrice !== undefined) {
        filtered = filtered.filter(hotel => hotel.pricePerNight >= state.filters.minPrice!);
      }
      if (state.filters.maxPrice !== undefined) {
        filtered = filtered.filter(hotel => hotel.pricePerNight <= state.filters.maxPrice!);
      }

      // Apply star rating filter
      if (state.filters.starRating !== undefined) {
        filtered = filtered.filter(hotel => hotel.starRating >= state.filters.starRating!);
      }

      // Apply location filter
      if (state.filters.location) {
        filtered = filtered.filter(hotel =>
          hotel.city.toLowerCase().includes(state.filters.location!.toLowerCase()) ||
          hotel.country.toLowerCase().includes(state.filters.location!.toLowerCase())
        );
      }

      // Apply amenities filter
      if (state.filters.amenities && state.filters.amenities.length > 0) {
        filtered = filtered.filter(hotel =>
          state.filters.amenities!.every(amenity => hotel.amenities.includes(amenity))
        );
      }

      state.filteredHotels = filtered;
    },
  },
});

export const {
  setHotels,
  setCurrentHotel,
  setFilters,
  setSearchQuery,
  toggleFavorite,
  setLoading,
  setError,
  clearError,
  applyFilters,
} = hotelSlice.actions;

export default hotelSlice.reducer;

