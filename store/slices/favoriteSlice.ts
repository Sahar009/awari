import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types
export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    propertyType: string;
    listingType: 'rent' | 'sale' | 'shortlet';
    status: string;
    price: string;
    originalPrice?: string;
    currency: string;
    pricePeriod?: string;
    negotiable: boolean;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
    landmark?: string;
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
    features?: string[];
    amenities?: string[];
    petFriendly: boolean;
    smokingAllowed: boolean;
    furnished: boolean;
    availableFrom?: string;
    availableUntil?: string;
    minLeasePeriod?: string;
    maxLeasePeriod?: string;
    minStayNights?: number;
    maxStayNights?: number;
    instantBooking: boolean;
    cancellationPolicy?: string;
    featured: boolean;
    featuredUntil?: string;
    viewCount: number;
    favoriteCount: number;
    contactCount: number;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      avatarUrl?: string;
    };
    agent?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      avatarUrl?: string;
    };
    media: Array<{
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
      isPrimary: boolean;
      isActive: boolean;
      altText?: string;
      caption?: string;
      metadata?: any;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

export interface FavoriteStatus {
  isFavorited: boolean;
  favoriteId?: string;
  notes?: string;
}

export interface FavoriteFilters {
  page?: number;
  limit?: number;
  propertyType?: string;
  listingType?: 'rent' | 'sale' | 'shortlet';
  status?: string;
}

export interface FavoritePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FavoriteState {
  favorites: Favorite[];
  favoriteStatus: Record<string, FavoriteStatus>; // propertyId -> status
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: FavoriteFilters;
}

const initialState: FavoriteState = {
  favorites: [],
  favoriteStatus: {},
  isLoading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  filters: {
    page: 1,
    limit: 10,
  },
};

// Async Thunks
export const fetchFavorites = createAsyncThunk<
  { success: boolean; message: string; data: { favorites: Favorite[]; pagination: FavoritePagination } },
  FavoriteFilters,
  { rejectValue: string }
>(
  'favorites/fetchFavorites',
  async (filters: FavoriteFilters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.listingType) queryParams.append('listingType', filters.listingType);
      if (filters.status) queryParams.append('status', filters.status);

      const url = `/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🔍 fetchFavorites - Making API call to:', url);
      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: {
          favorites: Favorite[];
          pagination: FavoritePagination;
        };
      }>(url);

      console.log('🔍 fetchFavorites - API response:', response);
      return response.data;
    } catch (error: any) {
      console.error('❌ fetchFavorites error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async ({ propertyId, notes }: { propertyId: string; notes?: string }, { rejectWithValue }) => {
    try {
      console.log('🔍 addToFavorites - Adding property to favorites:', propertyId);
      const response = await apiService.post<{
        success: boolean;
        data: Favorite;
      }>(`/favorites/${propertyId}`, { notes });

      console.log('🔍 addToFavorites - API response:', response);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ addToFavorites error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      console.log('🔍 removeFromFavorites - Removing property from favorites:', propertyId);
      const response = await apiService.delete<{
        success: boolean;
        message: string;
      }>(`/favorites/${propertyId}`);

      console.log('🔍 removeFromFavorites - API response:', response);
      return { propertyId, message: response.data.message };
    } catch (error: any) {
      console.error('❌ removeFromFavorites error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites');
    }
  }
);

export const checkFavoriteStatus = createAsyncThunk(
  'favorites/checkFavoriteStatus',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      console.log('🔍 checkFavoriteStatus - Checking status for property:', propertyId);
      const response = await apiService.get<FavoriteStatus>(`/favorites/${propertyId}/status`);

      console.log('🔍 checkFavoriteStatus - API response:', response);
      return { propertyId, status: response.data };
    } catch (error: any) {
      console.error('❌ checkFavoriteStatus error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to check favorite status');
    }
  }
);

export const updateFavoriteNotes = createAsyncThunk(
  'favorites/updateFavoriteNotes',
  async ({ propertyId, notes }: { propertyId: string; notes: string }, { rejectWithValue }) => {
    try {
      console.log('🔍 updateFavoriteNotes - Updating notes for property:', propertyId);
      const response = await apiService.put<{
        success: boolean;
        data: Favorite;
      }>(`/favorites/${propertyId}/notes`, { notes });

      console.log('🔍 updateFavoriteNotes - API response:', response);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ updateFavoriteNotes error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update favorite notes');
    }
  }
);

export const clearAllFavorites = createAsyncThunk(
  'favorites/clearAllFavorites',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 clearAllFavorites - Clearing all favorites');
      const response = await apiService.delete<{
        success: boolean;
        message: string;
        data: { clearedCount: number };
      }>('/favorites/clear');

      console.log('🔍 clearAllFavorites - API response:', response);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ clearAllFavorites error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to clear all favorites');
    }
  }
);

// Slice
const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FavoriteFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
      };
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      state.filters.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateFavoriteStatus: (state, action: PayloadAction<{ propertyId: string; status: FavoriteStatus }>) => {
      state.favoriteStatus[action.payload.propertyId] = action.payload.status;
    },
    removeFavoriteStatus: (state, action: PayloadAction<string>) => {
      delete state.favoriteStatus[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch Favorites
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        console.log('✅ fetchFavorites.fulfilled - Action payload:', action.payload);
        state.isLoading = false;
        state.favorites = action.payload.data.favorites;
        state.total = action.payload.data.pagination.totalItems;
        state.currentPage = action.payload.data.pagination.currentPage;
        state.totalPages = action.payload.data.pagination.totalPages;
        state.hasNextPage = action.payload.data.pagination.hasNextPage;
        state.hasPrevPage = action.payload.data.pagination.hasPrevPage;
        // Sync status map with fetched favorites
        for (const fav of action.payload.data.favorites) {
          state.favoriteStatus[fav.propertyId] = {
            isFavorited: true,
            favoriteId: fav.id,
            notes: fav.notes,
          };
        }
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        console.log('❌ fetchFavorites.rejected - Error:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to Favorites
    builder
      .addCase(addToFavorites.pending, (state) => {
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        console.log('✅ addToFavorites.fulfilled - Action payload:', action.payload);
        // Add to favorites list if not already present
        const existingIndex = state.favorites.findIndex(fav => fav.id === action.payload.id);
        if (existingIndex === -1) {
          state.favorites.unshift(action.payload);
        }
        
        // Update favorite status
        state.favoriteStatus[action.payload.propertyId] = {
          isFavorited: true,
          favoriteId: action.payload.id,
          notes: action.payload.notes,
        };
        
        state.error = null;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        console.log('❌ addToFavorites.rejected - Error:', action.payload);
        state.error = action.payload as string;
      });

    // Remove from Favorites
    builder
      .addCase(removeFromFavorites.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        console.log('✅ removeFromFavorites.fulfilled - Action payload:', action.payload);
        // Remove from favorites list
        state.favorites = state.favorites.filter(fav => fav.propertyId !== action.payload.propertyId);
        
        // Update favorite status
        state.favoriteStatus[action.payload.propertyId] = {
          isFavorited: false,
          favoriteId: undefined,
          notes: undefined,
        };
        
        state.error = null;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        console.log('❌ removeFromFavorites.rejected - Error:', action.payload);
        state.error = action.payload as string;
      });

    // Check Favorite Status
    builder
      .addCase(checkFavoriteStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(checkFavoriteStatus.fulfilled, (state, action) => {
        console.log('✅ checkFavoriteStatus.fulfilled - Action payload:', action.payload);
        state.favoriteStatus[action.payload.propertyId] = action.payload.status;
        state.error = null;
      })
      .addCase(checkFavoriteStatus.rejected, (state, action) => {
        console.log('❌ checkFavoriteStatus.rejected - Error:', action.payload);
        state.error = action.payload as string;
      });

    // Update Favorite Notes
    builder
      .addCase(updateFavoriteNotes.pending, (state) => {
        state.error = null;
      })
      .addCase(updateFavoriteNotes.fulfilled, (state, action) => {
        console.log('✅ updateFavoriteNotes.fulfilled - Action payload:', action.payload);
        // Update in favorites list
        const index = state.favorites.findIndex(fav => fav.id === action.payload.id);
        if (index !== -1) {
          state.favorites[index] = action.payload;
        }
        
        // Update favorite status
        state.favoriteStatus[action.payload.propertyId] = {
          isFavorited: true,
          favoriteId: action.payload.id,
          notes: action.payload.notes,
        };
        
        state.error = null;
      })
      .addCase(updateFavoriteNotes.rejected, (state, action) => {
        console.log('❌ updateFavoriteNotes.rejected - Error:', action.payload);
        state.error = action.payload as string;
      });

    // Clear All Favorites
    builder
      .addCase(clearAllFavorites.pending, (state) => {
        state.error = null;
      })
      .addCase(clearAllFavorites.fulfilled, (state, action) => {
        console.log('✅ clearAllFavorites.fulfilled - Action payload:', action.payload);
        state.favorites = [];
        state.favoriteStatus = {};
        state.total = 0;
        state.currentPage = 1;
        state.totalPages = 0;
        state.hasNextPage = false;
        state.hasPrevPage = false;
        state.error = null;
      })
      .addCase(clearAllFavorites.rejected, (state, action) => {
        console.log('❌ clearAllFavorites.rejected - Error:', action.payload);
        state.error = action.payload as string;
      });
  },
});

// Action Creators
export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  clearError,
  updateFavoriteStatus,
  removeFavoriteStatus,
} = favoriteSlice.actions;

// Selectors
export const selectFavorites = (state: { favorite: FavoriteState }) => state.favorite.favorites;
export const selectFavoriteStatus = (state: { favorite: FavoriteState }) => state.favorite.favoriteStatus;
export const selectIsLoading = (state: { favorite: FavoriteState }) => state.favorite.isLoading;
export const selectError = (state: { favorite: FavoriteState }) => state.favorite.error;
export const selectTotal = (state: { favorite: FavoriteState }) => state.favorite.total;
export const selectCurrentPage = (state: { favorite: FavoriteState }) => state.favorite.currentPage;
export const selectTotalPages = (state: { favorite: FavoriteState }) => state.favorite.totalPages;
export const selectHasNextPage = (state: { favorite: FavoriteState }) => state.favorite.hasNextPage;
export const selectHasPrevPage = (state: { favorite: FavoriteState }) => state.favorite.hasPrevPage;
export const selectFilters = (state: { favorite: FavoriteState }) => state.favorite.filters;

// Helper selectors
export const selectIsPropertyFavorited = (propertyId: string) => (state: { favorite: FavoriteState }) => 
  state.favorite.favoriteStatus[propertyId]?.isFavorited || false;

export const selectFavoriteNotes = (propertyId: string) => (state: { favorite: FavoriteState }) => 
  state.favorite.favoriteStatus[propertyId]?.notes || '';

export default favoriteSlice.reducer;

