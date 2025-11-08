import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

export interface RentalApplication {
  id: string;
  propertyId: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    primaryImage?: string;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      avatarUrl?: string;
    };
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';
  checkInDate?: string;
  checkOutDate?: string;
  totalPrice: number;
  currency: string;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInspection {
  id: string;
  propertyId: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    primaryImage?: string;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      avatarUrl?: string;
    };
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';
  inspectionDate?: string;
  inspectionTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewedProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  currency: string;
  primaryImage?: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
  viewCount: number;
  updatedAt: string;
}

export interface ShortletBooking {
  id: string;
  propertyId: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    primaryImage?: string;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      avatarUrl?: string;
    };
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';
  checkInDate?: string;
  checkOutDate?: string;
  numberOfNights?: number;
  numberOfGuests?: number;
  totalPrice: number;
  currency: string;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatement {
  id: string;
  bookingId?: string;
  booking?: {
    id: string;
    property?: {
      title: string;
      address: string;
    };
  };
  amount: number;
  currency: string;
  paymentType: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
}

export interface DashboardStats {
  rentals: {
    total: number;
    pending: number;
    confirmed: number;
  };
  purchases: {
    total: number;
    pending: number;
    completed: number;
  };
  shortlets: {
    total: number;
    upcoming: number;
    completed: number;
  };
  payments: {
    pending: number;
    totalSpent: number;
  };
}

interface UserDashboardState {
  // Rentals
  rentals: RentalApplication[];
  rentalsLoading: boolean;
  rentalsError: string | null;
  rentalsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;

  // Purchases
  inspections: PurchaseInspection[];
  viewedProperties: ViewedProperty[];
  purchasesLoading: boolean;
  purchasesError: string | null;
  purchasesPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;

  // Shortlets
  shortletBookings: ShortletBooking[];
  shortletsLoading: boolean;
  shortletsError: string | null;
  shortletsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;

  // Payment Statements
  paymentStatements: PaymentStatement[];
  statementsLoading: boolean;
  statementsError: string | null;
  statementsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  statementsSummary: {
    totalPaid: number;
    totalPending: number;
    totalTransactions: number;
  } | null;

  // Dashboard Stats
  stats: DashboardStats | null;
  statsLoading: boolean;
  statsError: string | null;
}

const initialState: UserDashboardState = {
  rentals: [],
  rentalsLoading: false,
  rentalsError: null,
  rentalsPagination: null,
  inspections: [],
  viewedProperties: [],
  purchasesLoading: false,
  purchasesError: null,
  purchasesPagination: null,
  shortletBookings: [],
  shortletsLoading: false,
  shortletsError: null,
  shortletsPagination: null,
  paymentStatements: [],
  statementsLoading: false,
  statementsError: null,
  statementsPagination: null,
  statementsSummary: null,
  stats: null,
  statsLoading: false,
  statsError: null,
};

// Async Thunks
export const fetchMyRentals = createAsyncThunk(
  'userDashboard/fetchMyRentals',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await apiService.get<{
        success: boolean;
        data: {
          bookings: RentalApplication[];
          pagination: any;
        };
      }>(`/user-dashboard/rentals?${queryParams.toString()}`);

      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        return { bookings: [], pagination: null };
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rentals');
    }
  }
);

export const fetchMyPurchases = createAsyncThunk(
  'userDashboard/fetchMyPurchases',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await apiService.get<{
        success: boolean;
        data: {
          inspections: PurchaseInspection[];
          viewedProperties: ViewedProperty[];
          pagination: any;
        };
      }>(`/user-dashboard/purchases?${queryParams.toString()}`);

      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        return { inspections: [], viewedProperties: [], pagination: null };
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchases');
    }
  }
);

export const fetchMyShortletBookings = createAsyncThunk(
  'userDashboard/fetchMyShortletBookings',
  async (params: { page?: number; limit?: number; status?: string; paymentStatus?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);

      const response = await apiService.get<{
        success: boolean;
        data: {
          bookings: ShortletBooking[];
          pagination: any;
        };
      }>(`/user-dashboard/shortlets?${queryParams.toString()}`);

      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        return { bookings: [], pagination: null };
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shortlet bookings');
    }
  }
);

export const fetchPaymentStatements = createAsyncThunk(
  'userDashboard/fetchPaymentStatements',
  async (params: { page?: number; limit?: number; startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiService.get<{
        success: boolean;
        data: {
          payments: PaymentStatement[];
          summary: {
            totalPaid: number;
            totalPending: number;
            totalTransactions: number;
          };
          pagination: any;
        };
      }>(`/user-dashboard/payment-statements?${queryParams.toString()}`);

      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        return { payments: [], summary: null, pagination: null };
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment statements');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'userDashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: DashboardStats;
      }>('/user-dashboard/stats');

      if (!response.data?.data) {
        console.error('Invalid response structure:', response.data);
        return null;
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const userDashboardSlice = createSlice({
  name: 'userDashboard',
  initialState,
  reducers: {
    clearRentals: (state) => {
      state.rentals = [];
      state.rentalsError = null;
      state.rentalsPagination = null;
    },
    clearPurchases: (state) => {
      state.inspections = [];
      state.viewedProperties = [];
      state.purchasesError = null;
      state.purchasesPagination = null;
    },
    clearShortlets: (state) => {
      state.shortletBookings = [];
      state.shortletsError = null;
      state.shortletsPagination = null;
    },
    clearStatements: (state) => {
      state.paymentStatements = [];
      state.statementsError = null;
      state.statementsPagination = null;
      state.statementsSummary = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Rentals
    builder
      .addCase(fetchMyRentals.pending, (state) => {
        state.rentalsLoading = true;
        state.rentalsError = null;
      })
      .addCase(fetchMyRentals.fulfilled, (state, action) => {
        state.rentalsLoading = false;
        state.rentals = action.payload?.bookings || [];
        state.rentalsPagination = action.payload?.pagination || null;
      })
      .addCase(fetchMyRentals.rejected, (state, action) => {
        state.rentalsLoading = false;
        state.rentalsError = action.payload as string;
      });

    // Fetch Purchases
    builder
      .addCase(fetchMyPurchases.pending, (state) => {
        state.purchasesLoading = true;
        state.purchasesError = null;
      })
      .addCase(fetchMyPurchases.fulfilled, (state, action) => {
        state.purchasesLoading = false;
        state.inspections = action.payload?.inspections || [];
        state.viewedProperties = action.payload?.viewedProperties || [];
        state.purchasesPagination = action.payload?.pagination || null;
      })
      .addCase(fetchMyPurchases.rejected, (state, action) => {
        state.purchasesLoading = false;
        state.purchasesError = action.payload as string;
      });

    // Fetch Shortlets
    builder
      .addCase(fetchMyShortletBookings.pending, (state) => {
        state.shortletsLoading = true;
        state.shortletsError = null;
      })
      .addCase(fetchMyShortletBookings.fulfilled, (state, action) => {
        state.shortletsLoading = false;
        state.shortletBookings = action.payload?.bookings || [];
        state.shortletsPagination = action.payload?.pagination || null;
      })
      .addCase(fetchMyShortletBookings.rejected, (state, action) => {
        state.shortletsLoading = false;
        state.shortletsError = action.payload as string;
      });

    // Fetch Payment Statements
    builder
      .addCase(fetchPaymentStatements.pending, (state) => {
        state.statementsLoading = true;
        state.statementsError = null;
      })
      .addCase(fetchPaymentStatements.fulfilled, (state, action) => {
        state.statementsLoading = false;
        state.paymentStatements = action.payload?.payments || [];
        state.statementsSummary = action.payload?.summary || null;
        state.statementsPagination = action.payload?.pagination || null;
      })
      .addCase(fetchPaymentStatements.rejected, (state, action) => {
        state.statementsLoading = false;
        state.statementsError = action.payload as string;
      });

    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload || null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      });
  },
});

export const { clearRentals, clearPurchases, clearShortlets, clearStatements } = userDashboardSlice.actions;
export default userDashboardSlice.reducer;

