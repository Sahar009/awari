import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Property creation interface
export interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number;
  address: string;
  city: string;
  state: string;
  images: File[];
  videos: File[];
  documents: File[];
}

// Types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'apartment' | 'duplex' | 'office' | 'villa' | 'bungalow';
  status: 'for-rent' | 'for-sale' | 'shortlet';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  location?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
}

export interface PropertyState {
  properties: Property[];
  filteredProperties: Property[];
  featuredProperties: Property[];
  currentProperty: Property | null;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

// Initial state
const initialState: PropertyState = {
  properties: [],
  filteredProperties: [],
  featuredProperties: [],
  currentProperty: null,
  filters: {},
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (params: { page?: number; limit?: number; filters?: PropertyFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        properties: Property[];
        totalPages: number;
        currentPage: number;
      }>(url);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Property>(`/properties/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch property');
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `/properties/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        properties: Property[];
        totalPages: number;
        currentPage: number;
      }>(url);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: CreatePropertyRequest, { rejectWithValue }) => {
    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', propertyData.title);
      formData.append('description', propertyData.description);
      formData.append('propertyType', propertyData.propertyType);
      formData.append('listingType', propertyData.listingType);
      formData.append('price', propertyData.price.toString());
      formData.append('address', propertyData.address);
      formData.append('city', propertyData.city);
      formData.append('state', propertyData.state);
      formData.append('country', 'Nigeria'); // Default to Nigeria
      
      // Add files
      propertyData.images.forEach((file) => {
        formData.append('images', file);
      });
      
      propertyData.videos.forEach((file) => {
        formData.append('videos', file);
      });
      
      propertyData.documents.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await apiService.post<Property>('/properties/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create property');
    }
  }
);

// Slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PropertyFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProperty: (state, action: PayloadAction<Property | null>) => {
      state.currentProperty = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Properties
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload.properties;
        state.filteredProperties = action.payload.properties;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Property by ID
    builder
      .addCase(fetchPropertyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Properties
    builder
      .addCase(searchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredProperties = action.payload.properties;
        state.totalPages = action.payload.totalPages;
        state.currentPage = 1;
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Property
    builder
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties.unshift(action.payload);
        state.filteredProperties.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  setCurrentPage, 
  clearError, 
  setCurrentProperty 
} = propertySlice.actions;

export default propertySlice.reducer;
