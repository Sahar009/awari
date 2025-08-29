import { apiService, ApiResponse } from './api';
import { User } from '../store/slices/authSlice';

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  avatar?: File;
}

// Authentication service
export const authService = {
  // User login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  },

  // User registration
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return apiService.post<AuthResponse>('/auth/register', userData);
  },

  // User logout
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>('/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiService.get<User>('/auth/profile');
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    return apiService.upload<User>('/auth/profile', formData);
  },

  // Change password
  changePassword: async (data: PasswordUpdateData): Promise<ApiResponse<{ message: string }>> => {
    return apiService.put<{ message: string }>('/auth/password', data);
  },

  // Request password reset
  requestPasswordReset: async (data: PasswordResetData): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>('/auth/password/reset', data);
  },

  // Reset password with token
  resetPassword: async (token: string, password: string): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>('/auth/password/reset/confirm', {
      token,
      password,
      password_confirmation: password,
    });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>('/auth/email/verify', { token });
  },

  // Resend verification email
  resendVerification: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>('/auth/email/resend');
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return apiService.post<{ token: string }>('/auth/refresh');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Set token in localStorage
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Remove token from localStorage
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  // Clear all auth data
  clearAuth: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;

