import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

// Types
export interface PropertyAvailability {
  id: string;
  propertyId: string;
  date: string;
  reason: 'booking' | 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable';
  bookingId?: string;
  notes?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  date: string;
  available: boolean;
  reason?: string;
  notes?: string;
}

export interface AvailabilityCalendar {
  property: {
    id: string;
    title: string;
    address: string;
  };
  calendar: CalendarDay[];
}

export interface UnavailableDatesResponse {
  propertyId: string;
  unavailableDates: string[];
  unavailableDateDetails?: Array<{
    date: string;
    reason: 'booking' | 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable';
    notes?: string;
  }>;
  totalCount: number;
}

export interface AvailableDatesResponse {
  propertyId: string;
  availableDates: string[];
  totalCount: number;
}

export interface AvailabilityCheckRequest {
  checkInDate: string;
  checkOutDate: string;
}

export interface AvailabilityCheckResponse {
  isAvailable: boolean;
  unavailableDates: string[];
  conflicts: Array<{
    date: string;
    reason: string;
    notes?: string;
  }>;
}

export interface BlockDateRequest {
  date: string;
  reason: 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable';
  notes?: string;
}

export interface BlockMultipleDatesRequest {
  dates: string[];
  reason: 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable';
  notes?: string;
}

export interface UnblockMultipleDatesRequest {
  dates: string[];
}

export interface AvailabilityRecordsOptions {
  page?: number;
  limit?: number;
  reason?: string;
  startDate?: string;
  endDate?: string;
  includeInactive?: boolean;
}

export interface AvailabilityRecordsResponse {
  records: PropertyAvailability[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

export interface AvailabilityState {
  // Calendar data
  calendar: AvailabilityCalendar | null;
  calendarLoading: boolean;
  calendarError: string | null;

  // Unavailable dates
  unavailableDates: UnavailableDatesResponse | null;
  unavailableDatesLoading: boolean;
  unavailableDatesError: string | null;

  // Available dates
  availableDates: AvailableDatesResponse | null;
  availableDatesLoading: boolean;
  availableDatesError: string | null;

  // Availability check
  availabilityCheck: AvailabilityCheckResponse | null;
  availabilityCheckLoading: boolean;
  availabilityCheckError: string | null;

  // Block operations
  blockLoading: boolean;
  blockError: string | null;

  // Unblock operations
  unblockLoading: boolean;
  unblockError: string | null;

  // Block multiple operations
  blockMultipleLoading: boolean;
  blockMultipleError: string | null;

  // Unblock multiple operations
  unblockMultipleLoading: boolean;
  unblockMultipleError: string | null;

  // Records
  records: AvailabilityRecordsResponse | null;
  recordsLoading: boolean;
  recordsError: string | null;
}

const initialState: AvailabilityState = {
  calendar: null,
  calendarLoading: false,
  calendarError: null,

  unavailableDates: null,
  unavailableDatesLoading: false,
  unavailableDatesError: null,

  availableDates: null,
  availableDatesLoading: false,
  availableDatesError: null,

  availabilityCheck: null,
  availabilityCheckLoading: false,
  availabilityCheckError: null,

  blockLoading: false,
  blockError: null,

  unblockLoading: false,
  unblockError: null,

  blockMultipleLoading: false,
  blockMultipleError: null,

  unblockMultipleLoading: false,
  unblockMultipleError: null,

  records: null,
  recordsLoading: false,
  recordsError: null,
};

// Async Thunks
export const getAvailabilityCalendar = createAsyncThunk(
  'availability/getCalendar',
  async (
    { propertyId, startDate, endDate }: { propertyId: string; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.get(`/availability/calendar/${propertyId}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get availability calendar';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getUnavailableDates = createAsyncThunk(
  'availability/getUnavailableDates',
  async (
    { propertyId, startDate, endDate }: { propertyId: string; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.get(`/availability/unavailable/${propertyId}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get unavailable dates';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAvailableDates = createAsyncThunk(
  'availability/getAvailableDates',
  async (
    { propertyId, startDate, endDate }: { propertyId: string; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.get(`/availability/available/${propertyId}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get available dates';
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkDateRangeAvailability = createAsyncThunk(
  'availability/checkAvailability',
  async (
    { propertyId, checkInDate, checkOutDate }: { propertyId: string } & AvailabilityCheckRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post(`/availability/check/${propertyId}`, {
        checkInDate,
        checkOutDate
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check availability';
      return rejectWithValue(errorMessage);
    }
  }
);

export const blockDate = createAsyncThunk(
  'availability/blockDate',
  async (
    { propertyId, ...blockData }: { propertyId: string } & BlockDateRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post(`/availability/block/${propertyId}`, blockData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to block date';
      return rejectWithValue(errorMessage);
    }
  }
);

export const unblockDate = createAsyncThunk(
  'availability/unblockDate',
  async (
    { propertyId, date }: { propertyId: string; date: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.delete(`/availability/unblock/${propertyId}`, {
        params: { date }
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unblock date';
      return rejectWithValue(errorMessage);
    }
  }
);

export const blockMultipleDates = createAsyncThunk(
  'availability/blockMultipleDates',
  async (
    { propertyId, ...blockData }: { propertyId: string } & BlockMultipleDatesRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post(`/availability/block-multiple/${propertyId}`, blockData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to block multiple dates';
      return rejectWithValue(errorMessage);
    }
  }
);

export const unblockMultipleDates = createAsyncThunk(
  'availability/unblockMultipleDates',
  async (
    { propertyId, dates }: { propertyId: string } & UnblockMultipleDatesRequest,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.delete(`/availability/unblock-multiple/${propertyId}`, {
        data: { dates }
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unblock multiple dates';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getPropertyAvailabilityRecords = createAsyncThunk(
  'availability/getRecords',
  async (
    { propertyId, options }: { propertyId: string; options?: AvailabilityRecordsOptions },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.get(`/availability/records/${propertyId}`, {
        params: options
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get availability records';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    clearCalendar: (state) => {
      state.calendar = null;
      state.calendarError = null;
    },
    clearUnavailableDates: (state) => {
      state.unavailableDates = null;
      state.unavailableDatesError = null;
    },
    clearAvailableDates: (state) => {
      state.availableDates = null;
      state.availableDatesError = null;
    },
    clearAvailabilityCheck: (state) => {
      state.availabilityCheck = null;
      state.availabilityCheckError = null;
    },
    clearRecords: (state) => {
      state.records = null;
      state.recordsError = null;
    },
    clearAllErrors: (state) => {
      state.calendarError = null;
      state.unavailableDatesError = null;
      state.availableDatesError = null;
      state.availabilityCheckError = null;
      state.blockError = null;
      state.unblockError = null;
      state.blockMultipleError = null;
      state.unblockMultipleError = null;
      state.recordsError = null;
    },
    resetAvailabilityState: () => initialState,
  },
  extraReducers: (builder) => {
    // Get availability calendar
    builder
      .addCase(getAvailabilityCalendar.pending, (state) => {
        state.calendarLoading = true;
        state.calendarError = null;
      })
      .addCase(getAvailabilityCalendar.fulfilled, (state, action) => {
        state.calendarLoading = false;
        state.calendar = action.payload as AvailabilityCalendar;
      })
      .addCase(getAvailabilityCalendar.rejected, (state, action) => {
        state.calendarLoading = false;
        state.calendarError = action.payload as string;
      });

    // Get unavailable dates
    builder
      .addCase(getUnavailableDates.pending, (state) => {
        state.unavailableDatesLoading = true;
        state.unavailableDatesError = null;
      })
      .addCase(getUnavailableDates.fulfilled, (state, action) => {
        state.unavailableDatesLoading = false;
        state.unavailableDates = action.payload as UnavailableDatesResponse;
      })
      .addCase(getUnavailableDates.rejected, (state, action) => {
        state.unavailableDatesLoading = false;
        state.unavailableDatesError = action.payload as string;
      });

    // Get available dates
    builder
      .addCase(getAvailableDates.pending, (state) => {
        state.availableDatesLoading = true;
        state.availableDatesError = null;
      })
      .addCase(getAvailableDates.fulfilled, (state, action) => {
        state.availableDatesLoading = false;
        state.availableDates = action.payload as AvailableDatesResponse;
      })
      .addCase(getAvailableDates.rejected, (state, action) => {
        state.availableDatesLoading = false;
        state.availableDatesError = action.payload as string;
      });

    // Check date range availability
    builder
      .addCase(checkDateRangeAvailability.pending, (state) => {
        state.availabilityCheckLoading = true;
        state.availabilityCheckError = null;
      })
      .addCase(checkDateRangeAvailability.fulfilled, (state, action) => {
        state.availabilityCheckLoading = false;
        state.availabilityCheck = action.payload as AvailabilityCheckResponse;
      })
      .addCase(checkDateRangeAvailability.rejected, (state, action) => {
        state.availabilityCheckLoading = false;
        state.availabilityCheckError = action.payload as string;
      });

    // Block date
    builder
      .addCase(blockDate.pending, (state) => {
        state.blockLoading = true;
        state.blockError = null;
      })
      .addCase(blockDate.fulfilled, (state) => {
        state.blockLoading = false;
        // Refresh calendar data if it exists
        if (state.calendar) {
          // Optionally refresh calendar data here
        }
      })
      .addCase(blockDate.rejected, (state, action) => {
        state.blockLoading = false;
        state.blockError = action.payload as string;
      });

    // Unblock date
    builder
      .addCase(unblockDate.pending, (state) => {
        state.unblockLoading = true;
        state.unblockError = null;
      })
      .addCase(unblockDate.fulfilled, (state) => {
        state.unblockLoading = false;
        // Refresh calendar data if it exists
        if (state.calendar) {
          // Optionally refresh calendar data here
        }
      })
      .addCase(unblockDate.rejected, (state, action) => {
        state.unblockLoading = false;
        state.unblockError = action.payload as string;
      });

    // Block multiple dates
    builder
      .addCase(blockMultipleDates.pending, (state) => {
        state.blockMultipleLoading = true;
        state.blockMultipleError = null;
      })
      .addCase(blockMultipleDates.fulfilled, (state) => {
        state.blockMultipleLoading = false;
        // Refresh calendar data if it exists
        if (state.calendar) {
          // Optionally refresh calendar data here
        }
      })
      .addCase(blockMultipleDates.rejected, (state, action) => {
        state.blockMultipleLoading = false;
        state.blockMultipleError = action.payload as string;
      });

    // Unblock multiple dates
    builder
      .addCase(unblockMultipleDates.pending, (state) => {
        state.unblockMultipleLoading = true;
        state.unblockMultipleError = null;
      })
      .addCase(unblockMultipleDates.fulfilled, (state) => {
        state.unblockMultipleLoading = false;
        // Refresh calendar data if it exists
        if (state.calendar) {
          // Optionally refresh calendar data here
        }
      })
      .addCase(unblockMultipleDates.rejected, (state, action) => {
        state.unblockMultipleLoading = false;
        state.unblockMultipleError = action.payload as string;
      });

    // Get property availability records
    builder
      .addCase(getPropertyAvailabilityRecords.pending, (state) => {
        state.recordsLoading = true;
        state.recordsError = null;
      })
      .addCase(getPropertyAvailabilityRecords.fulfilled, (state, action) => {
        state.recordsLoading = false;
        state.records = action.payload as AvailabilityRecordsResponse;
      })
      .addCase(getPropertyAvailabilityRecords.rejected, (state, action) => {
        state.recordsLoading = false;
        state.recordsError = action.payload as string;
      });
  },
});

export const {
  clearCalendar,
  clearUnavailableDates,
  clearAvailableDates,
  clearAvailabilityCheck,
  clearRecords,
  clearAllErrors,
  resetAvailabilityState,
} = availabilitySlice.actions;

// Selectors
export const selectAvailabilityState = (state: { availability: AvailabilityState }) => state.availability;

export const selectCalendar = (state: { availability: AvailabilityState }) => state.availability.calendar;
export const selectCalendarLoading = (state: { availability: AvailabilityState }) => state.availability.calendarLoading;
export const selectCalendarError = (state: { availability: AvailabilityState }) => state.availability.calendarError;

export const selectUnavailableDates = (state: { availability: AvailabilityState }) => state.availability.unavailableDates;
export const selectUnavailableDatesLoading = (state: { availability: AvailabilityState }) => state.availability.unavailableDatesLoading;
export const selectUnavailableDatesError = (state: { availability: AvailabilityState }) => state.availability.unavailableDatesError;

export const selectAvailableDates = (state: { availability: AvailabilityState }) => state.availability.availableDates;
export const selectAvailableDatesLoading = (state: { availability: AvailabilityState }) => state.availability.availableDatesLoading;
export const selectAvailableDatesError = (state: { availability: AvailabilityState }) => state.availability.availableDatesError;

export const selectAvailabilityCheck = (state: { availability: AvailabilityState }) => state.availability.availabilityCheck;
export const selectAvailabilityCheckLoading = (state: { availability: AvailabilityState }) => state.availability.availabilityCheckLoading;
export const selectAvailabilityCheckError = (state: { availability: AvailabilityState }) => state.availability.availabilityCheckError;

export const selectBlockLoading = (state: { availability: AvailabilityState }) => state.availability.blockLoading;
export const selectBlockError = (state: { availability: AvailabilityState }) => state.availability.blockError;

export const selectUnblockLoading = (state: { availability: AvailabilityState }) => state.availability.unblockLoading;
export const selectUnblockError = (state: { availability: AvailabilityState }) => state.availability.unblockError;

export const selectBlockMultipleLoading = (state: { availability: AvailabilityState }) => state.availability.blockMultipleLoading;
export const selectBlockMultipleError = (state: { availability: AvailabilityState }) => state.availability.blockMultipleError;

export const selectUnblockMultipleLoading = (state: { availability: AvailabilityState }) => state.availability.unblockMultipleLoading;
export const selectUnblockMultipleError = (state: { availability: AvailabilityState }) => state.availability.unblockMultipleError;

export const selectRecords = (state: { availability: AvailabilityState }) => state.availability.records;
export const selectRecordsLoading = (state: { availability: AvailabilityState }) => state.availability.recordsLoading;
export const selectRecordsError = (state: { availability: AvailabilityState }) => state.availability.recordsError;

export const selectIsAnyLoading = (state: { availability: AvailabilityState }) => {
  const { availability } = state;
  return availability.calendarLoading ||
         availability.unavailableDatesLoading ||
         availability.availableDatesLoading ||
         availability.availabilityCheckLoading ||
         availability.blockLoading ||
         availability.unblockLoading ||
         availability.blockMultipleLoading ||
         availability.unblockMultipleLoading ||
         availability.recordsLoading;
};

export const selectHasAnyError = (state: { availability: AvailabilityState }) => {
  const { availability } = state;
  return !!(availability.calendarError ||
           availability.unavailableDatesError ||
           availability.availableDatesError ||
           availability.availabilityCheckError ||
           availability.blockError ||
           availability.unblockError ||
           availability.blockMultipleError ||
           availability.unblockMultipleError ||
           availability.recordsError);
};

export default availabilitySlice.reducer;
