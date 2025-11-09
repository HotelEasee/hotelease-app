import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'
import hotelReducer from './slices/hotelSlice';
import bookingReducer from './slices/bookingSlice';
import favoritesReducer from './slices/favoriteSlice';
import uiReducer from './slices/uiSlice';
import registerAuthSlice from './slices/registerAuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    registerAuth: registerAuthSlice,
    hotels: hotelReducer,
    bookings: bookingReducer,
    favorites: favoritesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

