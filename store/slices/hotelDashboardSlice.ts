import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import hotelDashboardService, {
  HotelSummaryResponse,
  HotelRoomEntry,
  HotelBookingEntry,
  HotelAvailabilitySlot,
  PaginationMeta
} from '@/services/hotelDashboardService';

interface PaginatedCollection<T> {
  items: T[];
  pagination: PaginationMeta | null;
}

interface AvailabilityState {
  propertyId: string | null;
  calendar: HotelAvailabilitySlot[];
  isLoading: boolean;
  error: string | null;
}

interface HotelDashboardState {
  summary: {
    data: HotelSummaryResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  rooms: {
    collection: PaginatedCollection<HotelRoomEntry>;
    isLoading: boolean;
    error: string | null;
    filters: Record<string, unknown>;
  };
  bookings: {
    collection: PaginatedCollection<HotelBookingEntry>;
    isLoading: boolean;
    error: string | null;
    filters: Record<string, unknown>;
  };
  availability: AvailabilityState;
  actions: {
    updatingRoomId: string | null;
    updatingBookingId: string | null;
    error: string | null;
  };
}

const emptyCollection = {
  items: [],
  pagination: null
};

const initialState: HotelDashboardState = {
  summary: {
    data: null,
    isLoading: false,
    error: null
  },
  rooms: {
    collection: { ...emptyCollection },
    isLoading: false,
    error: null,
    filters: {}
  },
  bookings: {
    collection: { ...emptyCollection },
    isLoading: false,
    error: null,
    filters: {}
  },
  availability: {
    propertyId: null,
    calendar: [],
    isLoading: false,
    error: null
  },
  actions: {
    updatingRoomId: null,
    updatingBookingId: null,
    error: null
  }
};

export const fetchHotelSummary = createAsyncThunk(
  'hotelDashboard/fetchSummary',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await hotelDashboardService.getSummary(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  }
);

export const fetchHotelRooms = createAsyncThunk(
  'hotelDashboard/fetchRooms',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await hotelDashboardService.getRooms(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const updateHotelRoomPricing = createAsyncThunk(
  'hotelDashboard/updateRoomPricing',
  async (
    { propertyId, payload }: { propertyId: string; payload: Partial<HotelRoomEntry> },
    { rejectWithValue }
  ) => {
    try {
      const updatedRoom = await hotelDashboardService.updateRoomPricing(propertyId, payload);
      return updatedRoom;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update room pricing');
    }
  }
);

export const fetchHotelBookings = createAsyncThunk(
  'hotelDashboard/fetchBookings',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await hotelDashboardService.getBookings(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch hotel bookings');
    }
  }
);

export const respondHotelBooking = createAsyncThunk(
  'hotelDashboard/respondBooking',
  async (
    {
      bookingId,
      action,
      notes
    }: { bookingId: string; action: 'approve' | 'reject' | 'check_in' | 'check_out'; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      await hotelDashboardService.respondToBooking(bookingId, action, notes);
      return { bookingId, action };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update booking status');
    }
  }
);

export const fetchHotelAvailability = createAsyncThunk(
  'hotelDashboard/fetchAvailability',
  async (
    { propertyId, params }: { propertyId: string; params?: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const slots = await hotelDashboardService.getAvailability(propertyId, params);
      return { propertyId, slots };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch availability');
    }
  }
);

const hotelDashboardSlice = createSlice({
  name: 'hotelDashboard',
  initialState,
  reducers: {
    setRoomFilters(state, action: PayloadAction<Record<string, unknown>>) {
      state.rooms.filters = action.payload;
    },
    setBookingFilters(state, action: PayloadAction<Record<string, unknown>>) {
      state.bookings.filters = action.payload;
    },
    resetAvailability(state) {
      state.availability = { propertyId: null, calendar: [], isLoading: false, error: null };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelSummary.pending, (state) => {
        state.summary.isLoading = true;
        state.summary.error = null;
      })
      .addCase(fetchHotelSummary.fulfilled, (state, action) => {
        state.summary.isLoading = false;
        state.summary.data = action.payload || null;
      })
      .addCase(fetchHotelSummary.rejected, (state, action) => {
        state.summary.isLoading = false;
        state.summary.error = action.payload as string;
      });

    builder
      .addCase(fetchHotelRooms.pending, (state) => {
        state.rooms.isLoading = true;
        state.rooms.error = null;
      })
      .addCase(fetchHotelRooms.fulfilled, (state, action) => {
        state.rooms.isLoading = false;
        state.rooms.collection = {
          items: action.payload?.rooms ?? [],
          pagination: action.payload?.pagination ?? null
        };
      })
      .addCase(fetchHotelRooms.rejected, (state, action) => {
        state.rooms.isLoading = false;
        state.rooms.error = action.payload as string;
      });

    builder
      .addCase(updateHotelRoomPricing.pending, (state, action) => {
        state.actions.updatingRoomId = action.meta.arg.propertyId;
        state.actions.error = null;
      })
      .addCase(updateHotelRoomPricing.fulfilled, (state, action) => {
        state.actions.updatingRoomId = null;
        state.rooms.collection.items = state.rooms.collection.items.map((room) =>
          room.id === action.payload.id ? { ...room, ...action.payload } : room
        );
      })
      .addCase(updateHotelRoomPricing.rejected, (state, action) => {
        state.actions.updatingRoomId = null;
        state.actions.error = action.payload as string;
      });

    builder
      .addCase(fetchHotelBookings.pending, (state) => {
        state.bookings.isLoading = true;
        state.bookings.error = null;
      })
      .addCase(fetchHotelBookings.fulfilled, (state, action) => {
        state.bookings.isLoading = false;
        state.bookings.collection = {
          items: action.payload?.bookings ?? [],
          pagination: action.payload?.pagination ?? null
        };
      })
      .addCase(fetchHotelBookings.rejected, (state, action) => {
        state.bookings.isLoading = false;
        state.bookings.error = action.payload as string;
      });

    builder
      .addCase(respondHotelBooking.pending, (state, action) => {
        state.actions.updatingBookingId = action.meta.arg.bookingId;
        state.actions.error = null;
      })
      .addCase(respondHotelBooking.fulfilled, (state, action) => {
        state.actions.updatingBookingId = null;
        const { bookingId, action: responseAction } = action.payload;
        if (responseAction === 'reject') {
          state.bookings.collection.items = state.bookings.collection.items.filter(
            (booking) => booking.id !== bookingId
          );
        } else {
          state.bookings.collection.items = state.bookings.collection.items.map((booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status:
                    responseAction === 'approve'
                      ? 'confirmed'
                      : responseAction === 'check_in'
                      ? 'checked_in'
                      : 'completed'
                }
              : booking
          );
        }
      })
      .addCase(respondHotelBooking.rejected, (state, action) => {
        state.actions.updatingBookingId = null;
        state.actions.error = action.payload as string;
      });

    builder
      .addCase(fetchHotelAvailability.pending, (state, action) => {
        state.availability.isLoading = true;
        state.availability.error = null;
        state.availability.propertyId = action.meta.arg.propertyId;
      })
      .addCase(fetchHotelAvailability.fulfilled, (state, action) => {
        state.availability.isLoading = false;
        state.availability.calendar = action.payload?.slots ?? [];
      })
      .addCase(fetchHotelAvailability.rejected, (state, action) => {
        state.availability.isLoading = false;
        state.availability.error = action.payload as string;
      });
  }
});

export const { setRoomFilters, setBookingFilters, resetAvailability } = hotelDashboardSlice.actions;

export default hotelDashboardSlice.reducer;


