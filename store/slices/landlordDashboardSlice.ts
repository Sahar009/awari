import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import landlordDashboardService, {
  EarningsSummaryResponse,
  PaymentLogEntry,
  BookingScheduleEntry,
  BookingRequestEntry,
  InquiryEntry,
  PaginationMeta
} from '@/services/landlordDashboardService';

interface PaginatedCollection<T> {
  items: T[];
  pagination: PaginationMeta | null;
}

interface LandlordDashboardState {
  earnings: {
    data: EarningsSummaryResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  payments: {
    collection: PaginatedCollection<PaymentLogEntry>;
    isLoading: boolean;
    error: string | null;
    filters: Record<string, unknown>;
  };
  inspectionSchedule: {
    collection: PaginatedCollection<BookingScheduleEntry>;
    isLoading: boolean;
    error: string | null;
    filters: Record<string, unknown>;
  };
  bookingRequests: {
    collection: PaginatedCollection<BookingRequestEntry>;
    isLoading: boolean;
    error: string | null;
  };
  inquiries: {
    collection: PaginatedCollection<InquiryEntry>;
    isLoading: boolean;
    error: string | null;
  };
  actionState: {
    respondingBookingId: string | null;
    archivingInquiryId: string | null;
    error: string | null;
  };
}

const emptyCollection = {
  items: [],
  pagination: null
};

const initialState: LandlordDashboardState = {
  earnings: {
    data: null,
    isLoading: false,
    error: null
  },
  payments: {
    collection: { ...emptyCollection },
    isLoading: false,
    error: null,
    filters: {}
  },
  inspectionSchedule: {
    collection: { ...emptyCollection },
    isLoading: false,
    error: null,
    filters: {}
  },
  bookingRequests: {
    collection: { ...emptyCollection },
    isLoading: false,
    error: null
  },
  inquiries: {
    collection: { ...emptyCollection },
    isLoading: false,
    error: null
  },
  actionState: {
    respondingBookingId: null,
    archivingInquiryId: null,
    error: null
  }
};

export const fetchLandlordEarnings = createAsyncThunk(
  'landlordDashboard/fetchEarnings',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await landlordDashboardService.getEarningsSummary(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch earnings summary');
    }
  }
);

export const fetchLandlordPaymentLogs = createAsyncThunk(
  'landlordDashboard/fetchPaymentLogs',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await landlordDashboardService.getPaymentLogs(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch payment logs');
    }
  }
);

export const fetchLandlordInspectionSchedule = createAsyncThunk(
  'landlordDashboard/fetchInspectionSchedule',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await landlordDashboardService.getInspectionSchedule(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch inspection schedule');
    }
  }
);

export const fetchLandlordBookingRequests = createAsyncThunk(
  'landlordDashboard/fetchBookingRequests',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await landlordDashboardService.getBookingRequests(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch booking requests');
    }
  }
);

export const respondLandlordBookingRequest = createAsyncThunk(
  'landlordDashboard/respondBookingRequest',
  async (
    { bookingId, action, ownerNotes }: { bookingId: string; action: 'approve' | 'reject'; ownerNotes?: string },
    { rejectWithValue }
  ) => {
    try {
      await landlordDashboardService.respondToBookingRequest(bookingId, action, ownerNotes);
      return { bookingId, action };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to respond to booking request');
    }
  }
);

export const fetchLandlordInquiries = createAsyncThunk(
  'landlordDashboard/fetchInquiries',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await landlordDashboardService.getClientInquiries(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch client inquiries');
    }
  }
);

export const archiveLandlordInquiry = createAsyncThunk(
  'landlordDashboard/archiveInquiry',
  async (messageId: string, { rejectWithValue }) => {
    try {
      const updated = await landlordDashboardService.archiveInquiry(messageId);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to archive inquiry');
    }
  }
);

const landlordDashboardSlice = createSlice({
  name: 'landlordDashboard',
  initialState,
  reducers: {
    setPaymentFilters(state, action: PayloadAction<Record<string, unknown>>) {
      state.payments.filters = action.payload;
    },
    setInspectionFilters(state, action: PayloadAction<Record<string, unknown>>) {
      state.inspectionSchedule.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandlordEarnings.pending, (state) => {
        state.earnings.isLoading = true;
        state.earnings.error = null;
      })
      .addCase(fetchLandlordEarnings.fulfilled, (state, action) => {
        state.earnings.isLoading = false;
        state.earnings.data = action.payload || null;
      })
      .addCase(fetchLandlordEarnings.rejected, (state, action) => {
        state.earnings.isLoading = false;
        state.earnings.error = action.payload as string;
      });

    builder
      .addCase(fetchLandlordPaymentLogs.pending, (state) => {
        state.payments.isLoading = true;
        state.payments.error = null;
      })
      .addCase(fetchLandlordPaymentLogs.fulfilled, (state, action) => {
        state.payments.isLoading = false;
        state.payments.collection = {
          items: action.payload?.payments ?? [],
          pagination: action.payload?.pagination ?? null
        };
      })
      .addCase(fetchLandlordPaymentLogs.rejected, (state, action) => {
        state.payments.isLoading = false;
        state.payments.error = action.payload as string;
      });

    builder
      .addCase(fetchLandlordInspectionSchedule.pending, (state) => {
        state.inspectionSchedule.isLoading = true;
        state.inspectionSchedule.error = null;
      })
      .addCase(fetchLandlordInspectionSchedule.fulfilled, (state, action) => {
        state.inspectionSchedule.isLoading = false;
        state.inspectionSchedule.collection = {
          items: action.payload?.bookings ?? [],
          pagination: action.payload?.pagination ?? null
        };
      })
      .addCase(fetchLandlordInspectionSchedule.rejected, (state, action) => {
        state.inspectionSchedule.isLoading = false;
        state.inspectionSchedule.error = action.payload as string;
      });

    builder
      .addCase(fetchLandlordBookingRequests.pending, (state) => {
        state.bookingRequests.isLoading = true;
        state.bookingRequests.error = null;
      })
      .addCase(fetchLandlordBookingRequests.fulfilled, (state, action) => {
        state.bookingRequests.isLoading = false;
        state.bookingRequests.collection = {
          items: action.payload?.bookingRequests ?? [],
          pagination: action.payload?.pagination ?? null
        };
      })
      .addCase(fetchLandlordBookingRequests.rejected, (state, action) => {
        state.bookingRequests.isLoading = false;
        state.bookingRequests.error = action.payload as string;
      });

    builder
      .addCase(respondLandlordBookingRequest.pending, (state, action) => {
        state.actionState.respondingBookingId = action.meta.arg.bookingId;
        state.actionState.error = null;
      })
      .addCase(respondLandlordBookingRequest.fulfilled, (state, action) => {
        state.actionState.respondingBookingId = null;
        const { bookingId, action: responseAction } = action.payload;
        state.bookingRequests.collection.items = state.bookingRequests.collection.items.filter(
          (booking) => booking.id !== bookingId
        );

        if (responseAction === 'approve') {
          state.inspectionSchedule.collection.items = state.inspectionSchedule.collection.items.map((booking) =>
            booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
          );
        }
      })
      .addCase(respondLandlordBookingRequest.rejected, (state, action) => {
        state.actionState.respondingBookingId = null;
        state.actionState.error = action.payload as string;
      });

    builder
      .addCase(fetchLandlordInquiries.pending, (state) => {
        state.inquiries.isLoading = true;
        state.inquiries.error = null;
      })
      .addCase(fetchLandlordInquiries.fulfilled, (state, action) => {
        state.inquiries.isLoading = false;
        state.inquiries.collection = {
          items: action.payload?.inquiries ?? [],
          pagination: action.payload?.pagination ?? null
        };
      })
      .addCase(fetchLandlordInquiries.rejected, (state, action) => {
        state.inquiries.isLoading = false;
        state.inquiries.error = action.payload as string;
      });

    builder
      .addCase(archiveLandlordInquiry.pending, (state, action) => {
        state.actionState.archivingInquiryId = action.meta.arg;
        state.actionState.error = null;
      })
      .addCase(archiveLandlordInquiry.fulfilled, (state, action) => {
        state.actionState.archivingInquiryId = null;
        state.inquiries.collection.items = state.inquiries.collection.items.map((inquiry) =>
          inquiry.id === action.payload.id ? { ...inquiry, ...action.payload } : inquiry
        );
      })
      .addCase(archiveLandlordInquiry.rejected, (state, action) => {
        state.actionState.archivingInquiryId = null;
        state.actionState.error = action.payload as string;
      });
  }
});

export const { setPaymentFilters, setInspectionFilters } = landlordDashboardSlice.actions;

export default landlordDashboardSlice.reducer;




