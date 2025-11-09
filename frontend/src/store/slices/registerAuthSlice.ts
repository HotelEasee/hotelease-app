import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Simulated API call - replace with real API
const fakeRegisterApi = async (userData: { name: string; email: string; password: string }) => {
  return new Promise<{ user: any; token: string }>((resolve, reject) => {
    setTimeout(() => {
      if (userData.email === 'fail@example.com') {
        reject('Registration failed');
      } else {
        resolve({
          user: {
            id: '123',
            email: userData.email,
            name: userData.name,
            role: 'user',
          },
          token: 'fakeToken123',
        });
      }
    }, 1000);
  });
};

// createAsyncThunk for registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    userData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fakeRegisterApi(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationSuccess: false,
};

const registerAuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationSuccess = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationSuccess = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Registration failed';
        state.registrationSuccess = false;
      });
  },
});

export const { clearError, logout } = registerAuthSlice.actions;
export default registerAuthSlice.reducer;
