import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types and Interfaces
export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  ownerId: string;
  bookingType: 'shortlet' | 'rental' | 'sale_inspection';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';
  checkInDate?: string;
  checkOutDate?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  numberOfNights?: number;
  numberOfGuests?: number;
  basePrice: number;
  totalPrice: number;
  currency: string;
  serviceFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  ownerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  property?: {
    id: string;
    title: string;
    address: string;
    images: string[];
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface BookingPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BookingStatistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  totalRevenue: number;
  successRate: number;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  status?: string;
  bookingType?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  propertyId?: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  bookingType: 'shortlet' | 'rental' | 'sale_inspection';
  checkInDate?: string;
  checkOutDate?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  numberOfNights?: number;
  numberOfGuests?: number;
  basePrice: number;
  totalPrice: number;
  currency?: string;
  serviceFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  specialRequests?: string;
}

export interface UpdateBookingRequest {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';
  checkInDate?: string;
  checkOutDate?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  numberOfNights?: number;
  numberOfGuests?: number;
  totalPrice?: number;
  serviceFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentStatus?: 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  specialRequests?: string;
  cancellationReason?: string;
  ownerNotes?: string;
  adminNotes?: string;
}

export interface CancelBookingRequest {
  cancellationReason?: string;
}

export interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  statistics: BookingStatistics | null;
  filters: BookingFilters;
  pagination: BookingPagination | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  statistics: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  lastFetch: null,
};

// Async Thunks
export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingRequest,
  { rejectValue: string }
>(
  'bookings/createBooking',
  async (bookingData: CreateBookingRequest, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating booking:', bookingData);
      const response = await apiService.post<{
        success: boolean;
        message: string;
        data: Booking;
      }>('/bookings', bookingData);

      console.log('✅ Booking created successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Create booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserBookings = createAsyncThunk<
  { bookings: Booking[]; pagination: BookingPagination },
  BookingFilters | undefined,
  { rejectValue: string }
>(
  'bookings/fetchUserBookings',
  async (filters: BookingFilters = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching user bookings with filters:', filters);
      
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.bookingType) queryParams.append('bookingType', filters.bookingType);
      if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: {
          bookings: Booking[];
          pagination: BookingPagination;
        };
      }>(`/bookings?${queryParams.toString()}`);

      console.log('✅ User bookings fetched successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Fetch user bookings error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchBookingById = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>(
  'bookings/fetchBookingById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching booking by ID:', bookingId);
      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: Booking;
      }>(`/bookings/${bookingId}`);

      console.log('✅ Booking fetched successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Fetch booking by ID error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateBooking = createAsyncThunk<
  Booking,
  { bookingId: string; updateData: UpdateBookingRequest },
  { rejectValue: string }
>(
  'bookings/updateBooking',
  async ({ bookingId, updateData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating booking:', { bookingId, updateData });
      const response = await apiService.put<{
        success: boolean;
        message: string;
        data: Booking;
      }>(`/bookings/${bookingId}`, updateData);

      console.log('✅ Booking updated successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Update booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const cancelBooking = createAsyncThunk<
  Booking,
  { bookingId: string; cancelData?: CancelBookingRequest },
  { rejectValue: string }
>(
  'bookings/cancelBooking',
  async ({ bookingId, cancelData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Cancelling booking:', { bookingId, cancelData });
      const response = await apiService.post<{
        success: boolean;
        message: string;
        data: Booking;
      }>(`/bookings/${bookingId}/cancel`, cancelData);

      console.log('✅ Booking cancelled successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Cancel booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const confirmBooking = createAsyncThunk<
  Booking,
  { bookingId: string; ownerNotes?: string },
  { rejectValue: string }
>(
  'bookings/confirmBooking',
  async ({ bookingId, ownerNotes }, { rejectWithValue }) => {
    try {
      console.log('🔄 Confirming booking:', { bookingId, ownerNotes });
      const response = await apiService.post<{
        success: boolean;
        message: string;
        data: Booking;
      }>(`/bookings/${bookingId}/confirm`, { ownerNotes });

      console.log('✅ Booking confirmed successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Confirm booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const rejectBooking = createAsyncThunk<
  Booking,
  { bookingId: string; ownerNotes?: string },
  { rejectValue: string }
>(
  'bookings/rejectBooking',
  async ({ bookingId, ownerNotes }, { rejectWithValue }) => {
    try {
      console.log('🔄 Rejecting booking:', { bookingId, ownerNotes });
      const response = await apiService.post<{
        success: boolean;
        message: string;
        data: Booking;
      }>(`/bookings/${bookingId}/reject`, { ownerNotes });

      console.log('✅ Booking rejected successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Reject booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const completeBooking = createAsyncThunk<
  Booking,
  { bookingId: string; ownerNotes?: string },
  { rejectValue: string }
>(
  'bookings/completeBooking',
  async ({ bookingId, ownerNotes }, { rejectWithValue }) => {
    try {
      console.log('🔄 Completing booking:', { bookingId, ownerNotes });
      const response = await apiService.post<{
        success: boolean;
        message: string;
        data: Booking;
      }>(`/bookings/${bookingId}/complete`, { ownerNotes });

      console.log('✅ Booking completed successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Complete booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete booking';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPropertyBookings = createAsyncThunk<
  { bookings: Booking[]; pagination: BookingPagination },
  { propertyId: string; filters?: BookingFilters },
  { rejectValue: string }
>(
  'bookings/fetchPropertyBookings',
  async ({ propertyId, filters = {} }, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching property bookings:', { propertyId, filters });
      
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.bookingType) queryParams.append('bookingType', filters.bookingType);
      if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: {
          bookings: Booking[];
          pagination: BookingPagination;
        };
      }>(`/bookings/properties/${propertyId}/bookings?${queryParams.toString()}`);

      console.log('✅ Property bookings fetched successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Fetch property bookings error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property bookings';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchBookingStatistics = createAsyncThunk<
  BookingStatistics,
  { type?: 'user' | 'owner' },
  { rejectValue: string }
>(
  'bookings/fetchBookingStatistics',
  async ({ type = 'user' }, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching booking statistics:', { type });
      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: BookingStatistics;
      }>(`/bookings/statistics?type=${type}`);

      console.log('✅ Booking statistics fetched successfully:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('❌ Fetch booking statistics error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking statistics';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookings: (state) => {
      state.bookings = [];
      state.pagination = null;
      state.currentBooking = null;
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    setFilters: (state, action: PayloadAction<Partial<BookingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBooking: (state, action: PayloadAction<Booking>) => {
      state.currentBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreating = false;
        state.bookings.unshift(action.payload);
        state.currentBooking = action.payload;
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create booking';
      });

    // Fetch User Bookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      });

    // Fetch Booking by ID
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch booking';
      });

    // Update Booking
    builder
      .addCase(updateBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to update booking';
      });

    // Cancel Booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to cancel booking';
      });

    // Confirm Booking
    builder
      .addCase(confirmBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to confirm booking';
      });

    // Reject Booking
    builder
      .addCase(rejectBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to reject booking';
      });

    // Complete Booking
    builder
      .addCase(completeBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
        state.error = null;
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to complete booking';
      });

    // Fetch Property Bookings
    builder
      .addCase(fetchPropertyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchPropertyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch property bookings';
      });

    // Fetch Booking Statistics
    builder
      .addCase(fetchBookingStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch booking statistics';
      });
  },
});

// Actions
export const {
  clearBookings,
  clearCurrentBooking,
  setFilters,
  clearFilters,
  clearError,
  setCurrentBooking,
} = bookingSlice.actions;

// Selectors
export const selectBookings = (state: { bookings: BookingState }) => state.bookings.bookings;
export const selectCurrentBooking = (state: { bookings: BookingState }) => state.bookings.currentBooking;
export const selectBookingStatistics = (state: { bookings: BookingState }) => state.bookings.statistics;
export const selectBookingFilters = (state: { bookings: BookingState }) => state.bookings.filters;
export const selectBookingPagination = (state: { bookings: BookingState }) => state.bookings.pagination;
export const selectBookingLoading = (state: { bookings: BookingState }) => state.bookings.isLoading;
export const selectBookingCreating = (state: { bookings: BookingState }) => state.bookings.isCreating;
export const selectBookingUpdating = (state: { bookings: BookingState }) => state.bookings.isUpdating;
export const selectBookingError = (state: { bookings: BookingState }) => state.bookings.error;
export const selectBookingLastFetch = (state: { bookings: BookingState }) => state.bookings.lastFetch;

// Utility selectors
export const selectBookingsByStatus = (status: string) => (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.status === status);

export const selectBookingsByType = (type: string) => (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.bookingType === type);

export const selectBookingsByProperty = (propertyId: string) => (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.propertyId === propertyId);

export const selectBookingById = (bookingId: string) => (state: { bookings: BookingState }) =>
  state.bookings.bookings.find(booking => booking.id === bookingId);

export const selectPendingBookings = (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.status === 'pending');

export const selectConfirmedBookings = (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.status === 'confirmed');

export const selectCompletedBookings = (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.status === 'completed');

export const selectCancelledBookings = (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => booking.status === 'cancelled');

export const selectTotalRevenue = (state: { bookings: BookingState }) =>
  state.bookings.bookings
    .filter(booking => booking.paymentStatus === 'completed')
    .reduce((total, booking) => total + booking.totalPrice, 0);

export const selectUpcomingBookings = (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => {
    if (!booking.checkInDate) return false;
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    return checkInDate > today && ['pending', 'confirmed'].includes(booking.status);
  });

export const selectOverdueBookings = (state: { bookings: BookingState }) =>
  state.bookings.bookings.filter(booking => {
    if (!booking.checkOutDate) return false;
    const checkOutDate = new Date(booking.checkOutDate);
    const today = new Date();
    return checkOutDate < today && ['pending', 'confirmed'].includes(booking.status);
  });

export default bookingSlice.reducer;
