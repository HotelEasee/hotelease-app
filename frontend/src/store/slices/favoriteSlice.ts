import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the state
interface FavoritesState {
  favoriteIds: string[]; // Stores the IDs of all favorited hotels
}

// Initial state for the slice
const initialState: FavoritesState = {
  favoriteIds: [],
};

// Create the slice
export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // This is the function you asked for, now completed!
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const hotelId = action.payload;
      
      // 1. Check if the ID is already in the array
      const index = state.favoriteIds.indexOf(hotelId);

      if (index === -1) {
        // 2. If the ID is NOT found, add it to the array (Add to Favorites)
        state.favoriteIds.push(hotelId);
      } else {
        // 3. If the ID IS found, remove it from the array (Remove from Favorites)
        state.favoriteIds.splice(index, 1);
      }
      
      // Note: Redux Toolkit (using Immer) allows you to directly mutate the state 
      // like this, making the logic much cleaner than regular Redux.
    },
  },
});

// Export the action creator for use in your components (e.g., HotelsPage.tsx)
export const { toggleFavorite } = favoritesSlice.actions;

// Export the reducer for inclusion in your store configuration
export default favoritesSlice.reducer;