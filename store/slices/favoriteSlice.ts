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
      console.log('🔍 fetchFavorites - Response structure check:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        hasDataData: !!response?.data?.data,
        hasFavorites: !!response?.data?.data?.favorites,
        favoritesLength: response?.data?.data?.favorites?.length,
        responseKeys: response?.data ? Object.keys(response.data) : [],
        dataKeys: response?.data?.data ? Object.keys(response.data.data) : []
      });
      
      // Check if response has the expected structure
      if (!response?.data?.data?.favorites) {
        console.error('❌ Invalid response structure:', response);
        
        // Try alternative response structures
        if ((response?.data as any)?.favorites) {
          console.log('🔄 Trying alternative response structure (data.favorites)');
          // Response structure: { success, message, favorites, pagination }
          const transformedFavorites = (response.data as any).favorites.map((apiFavorite: any, index: number) => {
            console.log(`🔍 Transforming favorite ${index} (alt structure):`, apiFavorite);
            
            if (!apiFavorite.id || !apiFavorite.property?.id) {
              console.error(`❌ Invalid favorite at index ${index}:`, apiFavorite);
              throw new Error(`Invalid favorite data at index ${index}: missing required fields`);
            }
            
            return {
              id: apiFavorite.id,
              userId: 'current-user',
              propertyId: apiFavorite.property.id,
              notes: apiFavorite.notes,
              createdAt: apiFavorite.createdAt,
              updatedAt: apiFavorite.createdAt,
              property: {
                ...apiFavorite.property,
                media: apiFavorite.property.media || []
              }
            };
          });
          
          return {
            success: response.data.success,
            message: response.data.message,
            data: {
              favorites: transformedFavorites,
              pagination: (response.data as any).pagination || {
                currentPage: 1,
                totalPages: 1,
                totalItems: transformedFavorites.length,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPrevPage: false
              }
            }
          };
        }
        
        throw new Error('Invalid response structure: missing favorites data');
      }
      
      // Transform the API response to match the expected Favorite interface
      const transformedFavorites = response.data.data.favorites.map((apiFavorite: any, index: number) => {
        console.log(`🔍 Transforming favorite ${index}:`, apiFavorite);
        
        // Validate required fields
        if (!apiFavorite.id || !apiFavorite.property?.id) {
          console.error(`❌ Invalid favorite at index ${index}:`, apiFavorite);
          throw new Error(`Invalid favorite data at index ${index}: missing required fields`);
        }
        
        return {
          id: apiFavorite.id,
          userId: 'current-user', // We'll need to get this from auth state
          propertyId: apiFavorite.property.id,
          notes: apiFavorite.notes,
          createdAt: apiFavorite.createdAt,
          updatedAt: apiFavorite.createdAt, // Use createdAt as fallback for updatedAt
          property: {
            ...apiFavorite.property,
            media: apiFavorite.property.media || [] // Ensure media is always an array
          }
        };
      });
      
      const transformedResponse = {
        ...response.data,
        data: {
          ...response.data.data,
          favorites: transformedFavorites
        }
      };
      
      console.log('🔍 fetchFavorites - Transformed response:', transformedResponse);
      return transformedResponse;
    } catch (error: any) {
      console.error('❌ fetchFavorites error:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fullError: error
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch favorites';
      
      if (error.message && error.message !== 'Failed to fetch favorites') {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Please log in to view your favorites';
            break;
          case 403:
            errorMessage = 'You do not have permission to view favorites';
            break;
          case 404:
            errorMessage = 'Favorites endpoint not found';
            break;
          case 500:
            errorMessage = 'Server error while fetching favorites';
            break;
          default:
            errorMessage = `Failed to fetch favorites (${error.response.status})`;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Helper function to try different request formats
const tryAddToFavoritesWithFallback = async (propertyId: string, notes?: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Try different request body formats
  const requestFormats = [
    // Format 1: With notes if provided, empty object if not
    notes && notes.trim() ? { notes: notes.trim() } : {},
    // Format 2: Always include notes field, even if empty
    { notes: notes || '' },
    // Format 3: Send null for notes if not provided
    { notes: notes || null },
    // Format 4: Don't send notes field at all if not provided
    ...(notes && notes.trim() ? [{ notes: notes.trim() }] : [{}])
  ];

  for (let i = 0; i < requestFormats.length; i++) {
    const requestBody = requestFormats[i];
    
    try {
      console.log(`🔍 Trying request format ${i + 1}:`, requestBody);
      
      const response = await apiService.post<{
        success: boolean;
        data: Favorite;
        message?: string;
      }>(`/favorites/${propertyId}`, requestBody);

      console.log(`✅ Request format ${i + 1} succeeded:`, response);
      return response;
    } catch (error: any) {
      console.log(`❌ Request format ${i + 1} failed:`, {
        format: i + 1,
        body: requestBody,
        error: error.response?.data,
        status: error.response?.status
      });
      
      // If it's not a validation error, don't try other formats
      if (error.response?.status !== 500 || error.response?.data?.error !== 'Validation error') {
        throw error;
      }
      
      // If this is the last format, throw the error
      if (i === requestFormats.length - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('All request formats failed');
};

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async ({ propertyId, notes }: { propertyId: string; notes?: string }, { rejectWithValue }) => {
    try {
      console.log('🔍 addToFavorites - Adding property to favorites:', propertyId, 'with notes:', notes);
      
      // Validate propertyId
      if (!propertyId || typeof propertyId !== 'string') {
        throw new Error('Invalid property ID');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(propertyId)) {
        console.warn('⚠️ Property ID does not match UUID format:', propertyId);
        // Don't throw error, just warn - some backends might accept non-UUID formats
      }

      console.log('🔍 Request details:', {
        url: `/favorites/${propertyId}`,
        method: 'POST',
        propertyId,
        notes,
        isUUID: uuidRegex.test(propertyId)
      });
      
      const response = await tryAddToFavoritesWithFallback(propertyId, notes);

      console.log('🔍 addToFavorites - API response:', response);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ addToFavorites error:', {
        propertyId,
        notes,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      // Handle duplicate entry error specifically
      if (error.response?.status === 500 && 
          (error.response?.data?.message?.includes('Duplicate entry') || 
           error.response?.data?.sqlMessage?.includes('Duplicate entry'))) {
        console.log('✅ Property already in favorites - treating as success');
        // Return a mock favorite object to indicate it's already favorited
        const mockFavorite = {
          id: `existing-${propertyId}`,
          userId: 'current-user',
          propertyId: propertyId,
          notes: notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          property: {} as any // We'll fetch this separately if needed
        };
        return { action: 'added', result: mockFavorite };
      }
      
      // Provide more specific error messages based on status codes
      let errorMessage = 'Failed to add to favorites';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to add properties to favorites';
      } else if (error.response?.status === 404) {
        errorMessage = 'Property not found';
      } else if (error.response?.status === 409) {
        errorMessage = 'Property is already in your favorites';
      } else if (error.response?.status === 500) {
        // Check if it's a validation error
        if (error.response?.data?.error === 'Validation error') {
          errorMessage = 'Invalid property data. Please try again.';
        } else {
          errorMessage = 'Server error. Please try again later';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
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
    const checkId = Math.random().toString(36).substr(2, 9);
    try {
      console.log(`🔍 [${checkId}] checkFavoriteStatus - Checking status for property:`, propertyId);
      const response = await apiService.get<FavoriteStatus>(`/favorites/${propertyId}/status`);

      console.log(`🔍 [${checkId}] checkFavoriteStatus - API response:`, response);
      return { propertyId, status: response.data };
    } catch (error: any) {
      console.error(`❌ [${checkId}] checkFavoriteStatus error:`, error);
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
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🔍 clearAllFavorites - Clearing all favorites');
      
      // First, try the bulk clear endpoint
      try {
        const response = await apiService.delete<{
          success: boolean;
          message: string;
          data: { clearedCount: number };
        }>('/favorites/bulk/clear');

        console.log('🔍 clearAllFavorites - Bulk clear API response:', response);
        return response.data.data;
      } catch (bulkError: any) {
        console.log('⚠️ Bulk clear failed, trying individual removal:', bulkError);
        
        // Fallback: Get current favorites and remove them individually
        const state = getState() as any;
        const currentFavorites = state.favorite.favorites;
        
        if (currentFavorites && currentFavorites.length > 0) {
          console.log(`🔄 Clearing ${currentFavorites.length} favorites individually`);
          
          const removePromises = currentFavorites.map((favorite: any) => 
            apiService.delete(`/favorites/${favorite.propertyId}`)
          );
          
          await Promise.all(removePromises);
          
          console.log('✅ All favorites cleared individually');
          return { clearedCount: currentFavorites.length };
        } else {
          console.log('ℹ️ No favorites to clear');
          return { clearedCount: 0 };
        }
      }
    } catch (error: any) {
      console.error('❌ clearAllFavorites error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to clear all favorites');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async ({ propertyId, notes }: { propertyId: string; notes?: string }, { rejectWithValue, getState }) => {
    const startTime = Date.now();
    const actionId = Math.random().toString(36).substr(2, 9);
    
    try {
      console.log(`🔄 [${actionId}] toggleFavorite START - Property: ${propertyId} at ${new Date().toISOString()}`);
      
      // Get current state to check if we already know the status
      const state = getState() as any;
      const favoriteState = state.favorite;
      const currentStatus = favoriteState?.favoriteStatus?.[propertyId];
      
      console.log(`🔍 [${actionId}] Current state status:`, currentStatus);
      
      // First, check if the property is already in favorites
      try {
        console.log(`🔍 [${actionId}] Checking API status...`);
        const statusResponse = await apiService.get<FavoriteStatus>(`/favorites/${propertyId}/status`);
        console.log(`🔍 [${actionId}] API status response:`, statusResponse.data);
        
        if (statusResponse.data.isFavorited) {
          console.log(`✅ [${actionId}] Property is favorited - REMOVING from favorites`);
          // Property is already favorited, remove it
          const response = await apiService.delete<{
            success: boolean;
            message: string;
          }>(`/favorites/${propertyId}`);

          console.log(`🔍 [${actionId}] Remove API response:`, response);
          console.log(`🔍 [${actionId}] Remove API response.data:`, response.data);
          
          // The DELETE response structure: response.data might be undefined, check response directly
          const responseData = response.data || response;
          console.log(`🔍 [${actionId}] Remove responseData:`, responseData);
          console.log(`🔍 [${actionId}] Remove responseData.success:`, responseData?.success);
          
          // Check if the response indicates success (either success: true or status 200)
          const isSuccess = (response as any).status === 200 || responseData?.success === true;
          
          if (!isSuccess) {
            console.error(`❌ [${actionId}] Remove failed:`, { status: (response as any).status, data: responseData });
            throw new Error(responseData?.message || 'Failed to remove from favorites');
          }
          
          console.log(`✅ [${actionId}] toggleFavorite COMPLETED - REMOVED in ${Date.now() - startTime}ms`);
          return { 
            action: 'removed', 
            result: { propertyId, message: responseData?.message || 'Property removed from favorites successfully' },
            apiMessage: responseData?.message || 'Property removed from favorites successfully',
            actionId
          };
        } else {
          console.log(`➕ [${actionId}] Property is NOT favorited - ADDING to favorites`);
          // Property is not favorited, add it
          const response = await apiService.post<{
            success: boolean;
            message: string;
            data: {
              id: string;
              userId: string;
              propertyId: string;
              notes: string | null;
              isActive: boolean;
              updatedAt: string;
              createdAt: string;
            };
          }>(`/favorites/${propertyId}`, notes ? { notes } : {});

          console.log(`🔍 [${actionId}] Add API response:`, response);
          console.log(`🔍 [${actionId}] Add API response.data:`, response.data);
          
          // The POST response structure: response.data contains the actual response
          const responseData = response.data;
          console.log(`🔍 [${actionId}] Add responseData:`, responseData);
          console.log(`🔍 [${actionId}] Add responseData.success:`, responseData?.success);
          
          // Check if the response indicates success (either success: true or status 201)
          // For POST, we also check if the data has the expected structure (id, userId, propertyId)
          const hasSuccessField = responseData?.success === true;
          const hasDataField = responseData?.data && typeof responseData.data === 'object';
          const hasDirectDataStructure = (responseData as any)?.id && (responseData as any)?.userId && (responseData as any)?.propertyId;
          const isSuccess = (response as any).status === 201 || hasSuccessField || hasDataField || hasDirectDataStructure;
          
          if (!isSuccess) {
            console.error(`❌ [${actionId}] Add failed:`, { status: (response as any).status, data: responseData });
            throw new Error(responseData?.message || 'Failed to add to favorites');
          }
          
          // Transform the API response to match Favorite interface
          // Handle both nested (responseData.data) and direct (responseData) structures
          const favoriteData = responseData.data || responseData;
          const transformedFavorite: Favorite = {
            id: favoriteData.id,
            userId: favoriteData.userId,
            propertyId: favoriteData.propertyId,
            notes: favoriteData.notes || '',
            createdAt: favoriteData.createdAt,
            updatedAt: favoriteData.updatedAt,
            property: {} as any // We'll fetch this separately if needed
          };
          
          console.log(`✅ [${actionId}] toggleFavorite COMPLETED - ADDED in ${Date.now() - startTime}ms`);
          return { 
            action: 'added', 
            result: transformedFavorite,
            apiMessage: responseData?.message || 'Property added to favorites successfully',
            actionId
          };
        }
      } catch (statusError) {
        console.log(`⚠️ [${actionId}] Could not check status, attempting to add directly:`, statusError);
        // If we can't check status, try to add directly
        try {
          const response = await apiService.post<{
            success: boolean;
            message: string;
            data: {
              id: string;
              userId: string;
              propertyId: string;
              notes: string | null;
              isActive: boolean;
              updatedAt: string;
              createdAt: string;
            };
          }>(`/favorites/${propertyId}`, notes ? { notes } : {});

          console.log(`🔍 [${actionId}] Direct add API response:`, response);
          console.log(`🔍 [${actionId}] Direct add API response.data:`, response.data);
          
          // The POST response structure: response.data contains the actual response
          const responseData = response.data;
          console.log(`🔍 [${actionId}] Direct add responseData:`, responseData);
          console.log(`🔍 [${actionId}] Direct add responseData.success:`, responseData?.success);
          
          // Check if the response indicates success (either success: true or status 201)
          // For POST, we also check if the data has the expected structure (id, userId, propertyId)
          const hasSuccessField = responseData?.success === true;
          const hasDataField = responseData?.data && typeof responseData.data === 'object';
          const hasDirectDataStructure = (responseData as any)?.id && (responseData as any)?.userId && (responseData as any)?.propertyId;
          const isSuccess = (response as any).status === 201 || hasSuccessField || hasDataField || hasDirectDataStructure;
          
          if (!isSuccess) {
            console.error(`❌ [${actionId}] Direct add failed:`, { status: (response as any).status, data: responseData });
            throw new Error(responseData?.message || 'Failed to add to favorites');
          }
          
          // Transform the API response to match Favorite interface
          // Handle both nested (responseData.data) and direct (responseData) structures
          const favoriteData = responseData.data || responseData;
          const transformedFavorite: Favorite = {
            id: favoriteData.id,
            userId: favoriteData.userId,
            propertyId: favoriteData.propertyId,
            notes: favoriteData.notes || '',
            createdAt: favoriteData.createdAt,
            updatedAt: favoriteData.updatedAt,
            property: {} as any
          };
          
          console.log(`✅ [${actionId}] toggleFavorite COMPLETED - DIRECT ADD in ${Date.now() - startTime}ms`);
          return { 
            action: 'added', 
            result: transformedFavorite,
            apiMessage: responseData?.message || 'Property added to favorites successfully',
            actionId
          };
        } catch (addError: any) {
          // Handle duplicate entry error specifically
          if (addError.response?.status === 500 && 
              (addError.response?.data?.message?.includes('Duplicate entry') || 
               addError.response?.data?.sqlMessage?.includes('Duplicate entry'))) {
            console.log(`✅ [${actionId}] Property already in favorites - treating as success`);
            // Return a mock favorite object to indicate it's already favorited
            const mockFavorite = {
              id: `existing-${propertyId}`,
              userId: 'current-user',
              propertyId: propertyId,
              notes: notes || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              property: {} as any
            };
            console.log(`✅ [${actionId}] toggleFavorite COMPLETED - DUPLICATE HANDLED in ${Date.now() - startTime}ms`);
            return { 
              action: 'added', 
              result: mockFavorite,
              apiMessage: 'Property already in favorites',
              actionId
            };
          }
          throw addError;
        }
      }
    } catch (error: any) {
      console.error(`❌ [${actionId}] toggleFavorite ERROR in ${Date.now() - startTime}ms:`, error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to toggle favorite');
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
        const favorite = action.payload as Favorite;
        const existingIndex = state.favorites.findIndex(fav => fav.id === favorite.id);
        if (existingIndex === -1) {
          state.favorites.unshift(favorite);
        }
        
        // Update favorite status
        state.favoriteStatus[favorite.propertyId] = {
          isFavorited: true,
          favoriteId: favorite.id,
          notes: favorite.notes,
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

    // Toggle Favorite
    builder
      .addCase(toggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { action: actionType, result, apiMessage, actionId } = action.payload;
        console.log(`✅ [${actionId}] toggleFavorite.fulfilled - Action payload:`, action.payload);
        
        if (actionType === 'added') {
          // Add to favorites list if not already present and result is a Favorite
          if ('id' in result && 'propertyId' in result) {
            const favoriteResult = result as Favorite;
            const existingIndex = state.favorites.findIndex(fav => fav.id === favoriteResult.id);
            if (existingIndex === -1) {
              state.favorites.unshift(favoriteResult);
              console.log(`✅ [${actionId}] Added to favorites list:`, favoriteResult.id);
            } else {
              console.log(`⚠️ [${actionId}] Favorite already in list, skipping add`);
            }
            
            // Update favorite status
            state.favoriteStatus[favoriteResult.propertyId] = {
              isFavorited: true,
              favoriteId: favoriteResult.id,
              notes: favoriteResult.notes || '',
            };
            console.log(`✅ [${actionId}] Updated favoriteStatus to true for:`, favoriteResult.propertyId);
          }
        } else if (actionType === 'removed') {
          // Remove from favorites list
          if ('propertyId' in result) {
            const removeResult = result as { propertyId: string; message: string };
            const beforeCount = state.favorites.length;
            state.favorites = state.favorites.filter(fav => fav.propertyId !== removeResult.propertyId);
            const afterCount = state.favorites.length;
            console.log(`✅ [${actionId}] Removed from favorites list: ${beforeCount} -> ${afterCount} items`);
            
            // Update favorite status
            state.favoriteStatus[removeResult.propertyId] = {
              isFavorited: false,
              favoriteId: undefined,
              notes: undefined,
            };
            console.log(`✅ [${actionId}] Updated favoriteStatus to false for:`, removeResult.propertyId);
          }
        }
        
        state.error = null;
        console.log(`✅ [${actionId}] toggleFavorite state updated:`, { actionType, apiMessage });
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        console.log('❌ toggleFavorite.rejected - Error:', action.payload);
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

