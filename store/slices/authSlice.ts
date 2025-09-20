import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types based on backend schema - Updated with all User fields
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
  phoneVerified?: boolean;
  kycVerified: boolean;
  profileCompleted?: boolean;
  language?: string;
  loginCount?: number;
  emailVerificationExpires?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
  lastLogin?: string;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
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

export const forgotPassword = createAsyncThunk(
  'auth/forgotpassword',
  async (credentials: ForgotPasswordRequest, { rejectWithValue }) => {
    try{
     const response = await apiService.post<AuthResponse>('/auth/forgot-password', credentials);
     return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'forgot password failed')
    }
  }
)

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationData: VerifyEmailRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/verify-email', verificationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (emailData: ResendVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/resend-verification', emailData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post<VerificationResponse>('/auth/reset-password', resetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
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

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<User>('/auth/profile');
      return response.data;
    } catch (error: unknown) {
      console.error('Get profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get profile';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.put<User>('/auth/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      // Handle validation errors from API
      if (error.response?.data?.success === false && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
        return rejectWithValue({
          type: 'validation',
          message: error.response.data.message || 'Validation failed',
          errors: validationErrors,
          formattedMessage: errorMessages
        });
      }
      
      // Handle other API errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      return rejectWithValue({
        type: 'general',
        message: errorMessage
      });
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
          // Note: User data will be fetched by getProfile thunk
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
        console.log('DEBUG: Full registration payload:', action.payload);
        console.log('DEBUG: Payload type:', typeof action.payload);
        console.log('DEBUG: Payload keys:', Object.keys(action.payload || {}));
        console.log('DEBUG: Payload.user:', action.payload?.user);
        
        // Handle the actual API response structure: { user, token, message }
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = false; // Don't set as authenticated until email is verified
          state.error = null;
          console.log('Registration successful - storing token:', action.payload.token);
          localStorage.setItem('token', action.payload.token);
          console.log('Token stored in localStorage');
          console.log('Registration message:', action.payload.message);
        } else {
          console.error('Invalid payload structure:', action.payload);
          state.error = 'Invalid response from server';
        }
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
        console.log('DEBUG: Login payload:', action.payload);
        
        // Handle the actual API response structure: { user, token, message }
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
          console.log('Login successful - storing token:', action.payload.token);
          localStorage.setItem('token', action.payload.token);
          console.log('Token stored in localStorage');
        } else {
          console.error('Invalid login payload structure:', action.payload);
          state.error = 'Invalid response from server';
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


      //forgot password
      builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        // Forgot password usually just returns a message, not user data
        state.error = null;
        console.log('forgot password email sent succesfully');
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Email verification
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (state.user) {
          state.user.emailVerified = true;
          state.user.status = 'active';
        }
        state.isAuthenticated = true; // Set as authenticated after email verification
        console.log('Email verification successful:', action.payload?.message || 'Email verified');
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Resend verification email
    builder
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        console.log('Verification email resent successfully:', action.payload?.message || 'Email resent');
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        console.log('Password reset successful:', action.payload.message);
      })
      .addCase(resetPassword.rejected, (state, action) => {
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
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
          localStorage.setItem('token', action.payload.token);
        } else {
          console.error('Invalid Google sign-in payload structure:', action.payload);
          state.error = 'Invalid response from server';
        }
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

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        console.log('Profile loaded successfully:', action.payload);
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        localStorage.removeItem('token');
        console.error('Failed to load profile:', action.payload);
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        console.log('Profile updated successfully:', action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error('Failed to update profile:', action.payload);
      });
  },
});

export const { clearError, updateUser, hydrate } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
