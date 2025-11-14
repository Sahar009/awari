import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds default (increased from 10s)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Request interceptor - Token attached:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ Request interceptor - No token found');
    }
    
    // If FormData, remove Content-Type header and extend timeout for Cloudinary uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // Extend timeout for file uploads (Cloudinary can take time)
      if (!config.timeout || config.timeout < 120000) {
        config.timeout = 120000; // 2 minutes for file uploads
        console.log('📤 FormData detected - Extended timeout to 120s for Cloudinary upload');
      }
    }
    
    console.log('🌐 Making request to:', (config.baseURL || '') + (config.url || ''), 'Method:', config.method?.toUpperCase(), 'Timeout:', config.timeout + 'ms');
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('🔒 Unauthorized access - clearing token and redirecting to login');
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('🚨 Internal Server Error - Backend issue:', error.response?.data);
      error.message = error.response?.data?.message || 'Internal server error. Please try again later.';
    }

    // Handle other errors
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API methods
export const apiService = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    // If FormData and no timeout specified, use longer timeout for file uploads
    const finalConfig = { ...config };
    if (data instanceof FormData && !finalConfig.timeout) {
      finalConfig.timeout = 120000; // 2 minutes for file uploads
      console.log('📤 FormData detected - using extended timeout (120s)');
    }
    const response = await api.post(url, data, finalConfig);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // Upload file
  upload: async <T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    // Don't set Content-Type - browser will set it automatically with boundary
    const headers = config?.headers ? { ...config.headers } : {};
    if (headers && typeof headers === 'object' && 'Content-Type' in headers) {
      delete (headers as Record<string, unknown>)['Content-Type'];
    }
    
    const response = await api.post(url, formData, {
      ...config,
      timeout: 60000, // 60 seconds for file uploads
      headers: headers as AxiosRequestConfig['headers'],
    });
    return response.data;
  },
};

export default api;













