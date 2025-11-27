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
  ownerId: string;
  agentId?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: string; // API returns as string
  originalPrice?: string;
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
  propertyType: string;
  listingType: 'rent' | 'sale' | 'shortlet' | 'hotel';
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'sold' | 'rented' | 'rejected' | 'archived';
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
  minLeasePeriod?: string;
  maxLeasePeriod?: string;
  minStayNights?: number;
  maxStayNights?: number;
  instantBooking?: boolean;
  cancellationPolicy?: string;
  
  // Hotel-specific fields
  numberOfRooms?: number;
  roomTypes?: string[];
  maxGuestsPerRoom?: number;
  checkInTime?: string;
  checkOutTime?: string;
  starRating?: number;
  hotelAmenities?: string[];
  
  // Marketing
  featured?: boolean;
  featuredUntil?: string;
  viewCount?: number;
  favoriteCount?: number;
  contactCount?: number;
  
  // Moderation
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  
  // SEO
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  
  // Media
  media?: Array<{
    id: string;
    propertyId: string;
    mediaType: 'image' | 'video' | 'document';
    url: string;
    thumbnailUrl?: string;
    filename?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
    width?: number;
    height?: number;
    duration?: number;
    order: number;
    isPrimary?: boolean;
    isActive?: boolean;
    altText?: string;
    caption?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
  }>;
  
  // Owner
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  // Agent
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  
  // Legacy support
  location?: string;
  type?: string;
  images?: string[];
  area?: number;
  
  createdAt: string;
  updatedAt: string;
  
  // Index signature for additional properties - allows extra fields
  [key: string]: unknown;
}

export interface PropertyFilters {
  // Pagination
  page?: number;
  limit?: number;
  
  // Property filters
  propertyType?: string;
  listingType?: string;
  status?: string;
  
  // Location filters
  city?: string;
  state?: string;
  country?: string;
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Property details
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  featured?: boolean;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Search
  search?: string;
  
  // Legacy support
  location?: string;
  type?: string;
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
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  hasNextPage: false,
  hasPrevPage: false,
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (filters: PropertyFilters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      // Property filters
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.listingType) {
        console.log('📡 fetchProperties thunk - appending listingType:', filters.listingType);
        // ALWAYS append listingType - this ensures 'shortlet,hotel' is sent
        queryParams.append('listingType', filters.listingType);
        console.log('📡 fetchProperties thunk - listingType appended to URL:', filters.listingType);
      } else {
        console.log('⚠️ fetchProperties thunk - NO listingType in filters!');
      }
      if (filters.status) queryParams.append('status', filters.status);
      
      // Location filters
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.country) queryParams.append('country', filters.country);
      
      // Price filters
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      
      // Property details
      if (filters.bedrooms !== undefined) queryParams.append('bedrooms', filters.bedrooms.toString());
      if (filters.bathrooms !== undefined) queryParams.append('bathrooms', filters.bathrooms.toString());
      if (filters.furnished !== undefined) queryParams.append('furnished', filters.furnished.toString());
      if (filters.petFriendly !== undefined) queryParams.append('petFriendly', filters.petFriendly.toString());
      if (filters.featured !== undefined) queryParams.append('featured', filters.featured.toString());
      
      // Sorting
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      
      // Search
      if (filters.search) queryParams.append('search', filters.search);
      
      // Legacy support - map old filters to new ones
      if (filters.location) queryParams.append('city', filters.location);
      if (filters.type) queryParams.append('propertyType', filters.type);
      
      const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🚀 ===== fetchProperties THUNK =====');
      console.log('🚀 Filters received:', filters);
      console.log('🚀 Filters.listingType:', filters.listingType);
      console.log('🚀 Query params:', queryParams.toString());
      console.log('🚀 Final URL:', url);
      console.log('🚀 VERIFY listingType in URL:', url.includes('listingType=') ? url.split('listingType=')[1]?.split('&')[0] : 'NOT FOUND');
      
      const response = await apiService.get<{
        properties: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      }>(url);
      
      console.log('📡 API Response received:', response.data);
      console.log('📊 Properties data:', response.data);
      
      // The API response structure is { properties: [...], pagination: {...} }
      // So we need to return response.data directly
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error fetching properties:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to fetch properties';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (params: { id: string; incrementView?: boolean }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.incrementView !== undefined) {
        queryParams.append('incrementView', params.incrementView.toString());
      }
      
      const url = `/properties/${params.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔍 fetchPropertyById - Making API call to:', url);
      const response = await apiService.get<{
        success: boolean;
        data: Property;
      }>(url);
      
      console.log('🔍 fetchPropertyById - API response:', response);
      console.log('🔍 fetchPropertyById - response.data:', response.data);
      console.log('🔍 fetchPropertyById - response.data.data:', response.data.data);
      
      // Check if the data is nested or direct
      if (response.data.data) {
        console.log('🔍 fetchPropertyById - Using nested data:', response.data.data);
        return response.data.data;
      } else {
        console.log('🔍 fetchPropertyById - Using direct data:', response.data);
        return response.data;
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to fetch property';
      return rejectWithValue(errorMessage);
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    // Use the main fetchProperties function since the main API endpoint handles all filtering
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        properties: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      }>(url);
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Search failed';
      return rejectWithValue(errorMessage);
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
        console.log('⏳ fetchProperties.pending - Setting isLoading to true');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        console.log('✅ fetchProperties.fulfilled reducer called');
        console.log('📦 Action payload:', action.payload);
        console.log('🏠 Properties in payload:', action.payload?.properties);
        
        state.isLoading = false;
        state.properties = action.payload?.properties || [];
        state.filteredProperties = action.payload?.properties || [];
        state.totalPages = action.payload?.pagination?.pages || 0;
        state.currentPage = action.payload?.pagination?.page || 1;
        state.total = action.payload?.pagination?.total || 0;
        state.hasNextPage = (action.payload?.pagination?.page || 1) < (action.payload?.pagination?.pages || 0);
        state.hasPrevPage = (action.payload?.pagination?.page || 1) > 1;
        
        console.log('🔄 State updated:', {
          propertiesCount: state.properties.length,
          isLoading: state.isLoading,
          total: state.total
        });
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        console.log('❌ fetchProperties.rejected - Error:', action.payload);
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
        console.log('✅ fetchPropertyById.fulfilled - Action payload:', action.payload);
        state.isLoading = false;
        // Handle both nested and direct response structures
        const propertyData = (action.payload as any)?.data || action.payload;
        state.currentProperty = propertyData as Property;
        console.log('✅ fetchPropertyById.fulfilled - State updated, currentProperty:', state.currentProperty);
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
        state.filteredProperties = action.payload?.properties || [];
        state.totalPages = action.payload?.pagination?.pages || 0;
        state.currentPage = action.payload?.pagination?.page || 1;
        state.total = action.payload?.pagination?.total || 0;
        state.hasNextPage = (action.payload?.pagination?.page || 1) < (action.payload?.pagination?.pages || 0);
        state.hasPrevPage = (action.payload?.pagination?.page || 1) > 1;
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

// Helper action creators for common operations
export const fetchPropertiesWithFilters = (filters: PropertyFilters) => 
  fetchProperties({ 
    page: 1, 
    limit: 12, 
    sortBy: 'createdAt', 
    sortOrder: 'desc', 
    ...filters 
  });

export const fetchFeaturedProperties = () => 
  fetchProperties({ 
    featured: true, 
    limit: 8, 
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  });

export const fetchPropertyWithView = (id: string) =>
  fetchPropertyById({ id, incrementView: true });

export default propertySlice.reducer;
