import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types based on backend schema
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  googleId?: string;
  avatarUrl?: string;
  role: 'renter' | 'buyer' | 'landlord' | 'agent' | 'hotel_provider' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'banned' | 'deleted';
  emailVerified: boolean;
  kycVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'renter' | 'buyer' | 'landlord' | 'agent' | 'hotel_provider';
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  language?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (googleData: GoogleSignInRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<AuthResponse>('/auth/google', googleData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Google sign-in failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await apiService.post('/auth/logout');
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    hydrate: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        console.log('Hydrating auth state, token found:', !!token);
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
          console.log('Auth state hydrated with token');
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        state.error = null;
        console.log('Registration successful - storing token:', action.payload.data.token);
        localStorage.setItem('token', action.payload.data.token);
        console.log('Token stored in localStorage');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        state.error = null;
        console.log('Login successful - storing token:', action.payload.data.token);
        localStorage.setItem('token', action.payload.data.token);
        console.log('Token stored in localStorage');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Google Sign-In
    builder
      .addCase(googleSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('token', action.payload.data.token);
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('token');
      });
  },
});

export const { clearError, updateUser, hydrate } = authSlice.actions;
export default authSlice.reducer;
