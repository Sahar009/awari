import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Property creation interface
export interface CreatePropertyRequest {
  // Basic Info
  title: string;
  description: string;
  shortDescription?: string;
  propertyType: string;
  listingType: string;
  
  // Pricing
  price: number;
  originalPrice?: number;
  currency?: string;
  pricePeriod?: string;
  negotiable?: boolean;
  
  // Location
  address: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  landmark?: string;
  
  // Property Details
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parkingSpaces?: number;
  floorArea?: number;
  landArea?: number;
  floorNumber?: number;
  totalFloors?: number;
  yearBuilt?: number;
  conditionStatus?: string;
  
  // Features & Amenities
  features?: string[];
  amenities?: string[];
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  furnished?: boolean;
  
  // Availability
  availableFrom?: string;
  availableUntil?: string;
  minLeasePeriod?: number;
  maxLeasePeriod?: number;
  minStayNights?: number;
  maxStayNights?: number;
  instantBooking?: boolean;
  cancellationPolicy?: string;
  
  // SEO & Marketing
  featured?: boolean;
  featuredUntil?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Agent
  agentId?: string;
  
  // Media
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
  myProperties: Property[];
  currentProperty: Property | null;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
}

// Initial state
const initialState: PropertyState = {
  properties: [],
  filteredProperties: [],
  featuredProperties: [],
  myProperties: [],
  currentProperty: null,
  filters: {},
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,
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

export const fetchMyProperties = createAsyncThunk(
  'property/fetchMyProperties',
  async (params: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    propertyType?: string; 
    listingType?: string; 
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.propertyType) queryParams.append('propertyType', params.propertyType);
      if (params.listingType) queryParams.append('listingType', params.listingType);
      
      const url = `/properties/my-properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        properties: Property[];
        totalPages: number;
        currentPage: number;
        total: number;
      }>(url);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch my properties');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async (params: { propertyId: string; propertyData: Partial<Property> }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Property>(`/properties/${params.propertyId}`, params.propertyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/properties/${propertyId}`);
      return propertyId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const addPropertyMedia = createAsyncThunk(
  'property/addPropertyMedia',
  async (params: { propertyId: string; media: { images?: File[]; videos?: File[]; documents?: File[] } }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      if (params.media.images) {
        params.media.images.forEach((file) => {
          formData.append('images', file);
        });
      }
      
      if (params.media.videos) {
        params.media.videos.forEach((file) => {
          formData.append('videos', file);
        });
      }
      
      if (params.media.documents) {
        params.media.documents.forEach((file) => {
          formData.append('documents', file);
        });
      }

      const response = await apiService.post(`/properties/${params.propertyId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { propertyId: params.propertyId, media: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add media');
    }
  }
);

export const deletePropertyMedia = createAsyncThunk(
  'property/deletePropertyMedia',
  async (mediaId: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/properties/media/${mediaId}`);
      return mediaId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media');
    }
  }
);

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: CreatePropertyRequest, { rejectWithValue }) => {
    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Basic Info
      formData.append('title', propertyData.title);
      formData.append('description', propertyData.description);
      if (propertyData.shortDescription) formData.append('shortDescription', propertyData.shortDescription);
      formData.append('propertyType', propertyData.propertyType);
      formData.append('listingType', propertyData.listingType);
      
      // Pricing
      formData.append('price', propertyData.price.toString());
      if (propertyData.originalPrice) formData.append('originalPrice', propertyData.originalPrice.toString());
      formData.append('currency', propertyData.currency || 'NGN');
      if (propertyData.pricePeriod) formData.append('pricePeriod', propertyData.pricePeriod);
      formData.append('negotiable', (propertyData.negotiable || false).toString());
      
      // Location
      formData.append('address', propertyData.address);
      formData.append('city', propertyData.city);
      formData.append('state', propertyData.state);
      formData.append('country', propertyData.country || 'Nigeria');
      if (propertyData.postalCode) formData.append('postalCode', propertyData.postalCode);
      if (propertyData.latitude) formData.append('latitude', propertyData.latitude.toString());
      if (propertyData.longitude) formData.append('longitude', propertyData.longitude.toString());
      if (propertyData.neighborhood) formData.append('neighborhood', propertyData.neighborhood);
      if (propertyData.landmark) formData.append('landmark', propertyData.landmark);
      
      // Property Details
      if (propertyData.bedrooms) formData.append('bedrooms', propertyData.bedrooms.toString());
      if (propertyData.bathrooms) formData.append('bathrooms', propertyData.bathrooms.toString());
      if (propertyData.toilets) formData.append('toilets', propertyData.toilets.toString());
      if (propertyData.parkingSpaces) formData.append('parkingSpaces', propertyData.parkingSpaces.toString());
      if (propertyData.floorArea) formData.append('floorArea', propertyData.floorArea.toString());
      if (propertyData.landArea) formData.append('landArea', propertyData.landArea.toString());
      if (propertyData.floorNumber) formData.append('floorNumber', propertyData.floorNumber.toString());
      if (propertyData.totalFloors) formData.append('totalFloors', propertyData.totalFloors.toString());
      if (propertyData.yearBuilt) formData.append('yearBuilt', propertyData.yearBuilt.toString());
      if (propertyData.conditionStatus) formData.append('conditionStatus', propertyData.conditionStatus);
      
      // Features & Amenities (arrays as JSON strings)
      if (propertyData.features && propertyData.features.length > 0) {
        formData.append('features', JSON.stringify(propertyData.features));
      }
      if (propertyData.amenities && propertyData.amenities.length > 0) {
        formData.append('amenities', JSON.stringify(propertyData.amenities));
      }
      formData.append('petFriendly', (propertyData.petFriendly || false).toString());
      formData.append('smokingAllowed', (propertyData.smokingAllowed || false).toString());
      formData.append('furnished', (propertyData.furnished || false).toString());
      
      // Availability
      if (propertyData.availableFrom) formData.append('availableFrom', propertyData.availableFrom);
      if (propertyData.availableUntil) formData.append('availableUntil', propertyData.availableUntil);
      if (propertyData.minLeasePeriod) formData.append('minLeasePeriod', propertyData.minLeasePeriod.toString());
      if (propertyData.maxLeasePeriod) formData.append('maxLeasePeriod', propertyData.maxLeasePeriod.toString());
      formData.append('minStayNights', (propertyData.minStayNights || 1).toString());
      if (propertyData.maxStayNights) formData.append('maxStayNights', propertyData.maxStayNights.toString());
      formData.append('instantBooking', (propertyData.instantBooking || false).toString());
      formData.append('cancellationPolicy', propertyData.cancellationPolicy || 'moderate');
      
      // SEO & Marketing
      formData.append('featured', (propertyData.featured || false).toString());
      if (propertyData.featuredUntil) formData.append('featuredUntil', propertyData.featuredUntil);
      if (propertyData.tags && propertyData.tags.length > 0) {
        formData.append('tags', JSON.stringify(propertyData.tags));
      }
      if (propertyData.seoTitle) formData.append('seoTitle', propertyData.seoTitle);
      if (propertyData.seoDescription) formData.append('seoDescription', propertyData.seoDescription);
      if (propertyData.seoKeywords && propertyData.seoKeywords.length > 0) {
        formData.append('seoKeywords', JSON.stringify(propertyData.seoKeywords));
      }
      
      // Agent
      if (propertyData.agentId) formData.append('agentId', propertyData.agentId);
      
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
        state.myProperties.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Properties
    builder
      .addCase(fetchMyProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProperties = action.payload.properties;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Property
    builder
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedProperty = action.payload;
        // Update in all relevant arrays
        const updateInArray = (arr: Property[]) => {
          const index = arr.findIndex(p => p.id === updatedProperty.id);
          if (index !== -1) arr[index] = updatedProperty;
        };
        updateInArray(state.properties);
        updateInArray(state.filteredProperties);
        updateInArray(state.myProperties);
        if (state.currentProperty?.id === updatedProperty.id) {
          state.currentProperty = updatedProperty;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Property
    builder
      .addCase(deleteProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        const propertyId = action.payload;
        // Remove from all arrays
        state.properties = state.properties.filter(p => p.id !== propertyId);
        state.filteredProperties = state.filteredProperties.filter(p => p.id !== propertyId);
        state.myProperties = state.myProperties.filter(p => p.id !== propertyId);
        if (state.currentProperty?.id === propertyId) {
          state.currentProperty = null;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Property Media
    builder
      .addCase(addPropertyMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPropertyMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update property with new media in all arrays
        const { propertyId } = action.payload;
        const updatePropertyMedia = (arr: Property[]) => {
          const property = arr.find(p => p.id === propertyId);
          if (property) {
            // This would need to be updated based on actual media structure
            // property.images = [...property.images, ...action.payload.media.images];
          }
        };
        updatePropertyMedia(state.properties);
        updatePropertyMedia(state.filteredProperties);
        updatePropertyMedia(state.myProperties);
      })
      .addCase(addPropertyMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Property Media
    builder
      .addCase(deletePropertyMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePropertyMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove media from properties - implementation depends on media structure
      })
      .addCase(deletePropertyMedia.rejected, (state, action) => {
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
