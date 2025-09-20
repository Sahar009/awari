import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// Types
export interface Review {
  id: string;
  reviewerId: string;
  propertyId?: string;
  ownerId?: string;
  bookingId?: string;
  reviewType: 'property' | 'owner' | 'guest' | 'platform';
  rating: number;
  title?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  cleanliness?: number;
  communication?: number;
  checkIn?: number;
  accuracy?: number;
  location?: number;
  value?: number;
  helpfulCount: number;
  reportCount: number;
  isVerified: boolean;
  ownerResponse?: string;
  ownerResponseAt?: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  property?: {
    id: string;
    title: string;
    address: string;
    images?: string[];
  };
}

export interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  hiddenReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number;
  };
}

export interface PropertyRatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    [key: string]: number;
  };
  categoryRatings: {
    cleanliness?: number;
    communication?: number;
    checkIn?: number;
    accuracy?: number;
    location?: number;
    value?: number;
  };
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  propertyId?: string;
  ownerId?: string;
  reviewerId?: string;
  reviewType?: 'property' | 'owner' | 'guest' | 'platform';
  status?: 'pending' | 'approved' | 'rejected' | 'hidden';
  rating?: number;
  minRating?: number;
  maxRating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateReviewRequest {
  propertyId?: string;
  bookingId?: string;
  reviewType: 'property' | 'owner' | 'guest' | 'platform';
  rating: number;
  title?: string;
  content: string;
  cleanliness?: number;
  communication?: number;
  checkIn?: number;
  accuracy?: number;
  location?: number;
  value?: number;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
  cleanliness?: number;
  communication?: number;
  checkIn?: number;
  accuracy?: number;
  location?: number;
  value?: number;
}

export interface OwnerResponseRequest {
  response: string;
}

export interface ReportReviewRequest {
  reason: string;
  description?: string;
}

// State interface
interface ReviewsState {
  reviews: Review[];
  currentReview: Review | null;
  stats: ReviewStats | null;
  propertySummary: PropertyRatingSummary | null;
  userReviews: Review[];
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  markingHelpful: boolean;
  reporting: boolean;
  addingResponse: boolean;
  statsLoading: boolean;
  summaryLoading: boolean;
  userReviewsLoading: boolean;
  
  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  helpfulError: string | null;
  reportError: string | null;
  responseError: string | null;
  statsError: string | null;
  summaryError: string | null;
  userReviewsError: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  
  userReviewsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

// Initial state
const initialState: ReviewsState = {
  reviews: [],
  currentReview: null,
  stats: null,
  propertySummary: null,
  userReviews: [],
  
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  markingHelpful: false,
  reporting: false,
  addingResponse: false,
  statsLoading: false,
  summaryLoading: false,
  userReviewsLoading: false,
  
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  helpfulError: null,
  reportError: null,
  responseError: null,
  statsError: null,
  summaryError: null,
  userReviewsError: null,
  
  pagination: null,
  userReviewsPagination: null,
};

// Async thunks
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData: CreateReviewRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReviews = createAsyncThunk(
  'reviews/getReviews',
  async (filters: ReviewFilters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reviews', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReviewById = createAsyncThunk(
  'reviews/getReviewById',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, updateData }: { reviewId: string; updateData: UpdateReviewRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addOwnerResponse = createAsyncThunk(
  'reviews/addOwnerResponse',
  async ({ reviewId, response }: { reviewId: string; response: string }, { rejectWithValue }) => {
    try {
      const responseData = await api.post(`/reviews/${reviewId}/response`, { response });
      return responseData.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'reviews/markReviewHelpful',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const reportReview = createAsyncThunk(
  'reviews/reportReview',
  async ({ reviewId, reportData }: { reviewId: string; reportData: ReportReviewRequest }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, reportData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReviewStats = createAsyncThunk(
  'reviews/getReviewStats',
  async (filters: Partial<ReviewFilters> = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reviews/stats', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPropertyRatingSummary = createAsyncThunk(
  'reviews/getPropertyRatingSummary',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/property/${propertyId}/summary`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUserReviewHistory = createAsyncThunk(
  'reviews/getUserReviewHistory',
  async ({ userId, filters }: { userId: string; filters?: Partial<ReviewFilters> }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/user/${userId}`, { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.helpfulError = null;
      state.reportError = null;
      state.responseError = null;
      state.statsError = null;
      state.summaryError = null;
      state.userReviewsError = null;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    clearPropertySummary: (state) => {
      state.propertySummary = null;
    },
    clearUserReviews: (state) => {
      state.userReviews = [];
      state.userReviewsPagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create review
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.creating = false;
        state.reviews.unshift(action.payload.data);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
      
      // Get reviews
      .addCase(getReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload as any;
        if (response.data) {
          state.reviews = response.data.reviews || [];
          state.pagination = response.data.pagination || null;
        }
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get review by ID
      .addCase(getReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload as any;
        if (response.data) {
          state.currentReview = response.data;
        }
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.updating = false;
        const response = action.payload as any;
        if (response.data) {
          const updatedReview = response.data;
          const index = state.reviews.findIndex(review => review.id === updatedReview.id);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === updatedReview.id) {
            state.currentReview = updatedReview;
          }
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload as string;
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleting = false;
        const reviewId = action.meta.arg;
        state.reviews = state.reviews.filter(review => review.id !== reviewId);
        if (state.currentReview?.id === reviewId) {
          state.currentReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload as string;
      })
      
      // Add owner response
      .addCase(addOwnerResponse.pending, (state) => {
        state.addingResponse = true;
        state.responseError = null;
      })
      .addCase(addOwnerResponse.fulfilled, (state, action) => {
        state.addingResponse = false;
        const response = action.payload as any;
        if (response.data) {
          const updatedReview = response.data;
          const index = state.reviews.findIndex(review => review.id === updatedReview.id);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview?.id === updatedReview.id) {
            state.currentReview = updatedReview;
          }
        }
      })
      .addCase(addOwnerResponse.rejected, (state, action) => {
        state.addingResponse = false;
        state.responseError = action.payload as string;
      })
      
      // Mark review helpful
      .addCase(markReviewHelpful.pending, (state) => {
        state.markingHelpful = true;
        state.helpfulError = null;
      })
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        state.markingHelpful = false;
        const response = action.payload as any;
        if (response.data) {
          const { helpfulCount } = response.data;
          const reviewId = action.meta.arg;
          const index = state.reviews.findIndex(review => review.id === reviewId);
          if (index !== -1) {
            state.reviews[index].helpfulCount = helpfulCount;
          }
          if (state.currentReview?.id === reviewId) {
            state.currentReview.helpfulCount = helpfulCount;
          }
        }
      })
      .addCase(markReviewHelpful.rejected, (state, action) => {
        state.markingHelpful = false;
        state.helpfulError = action.payload as string;
      })
      
      // Report review
      .addCase(reportReview.pending, (state) => {
        state.reporting = true;
        state.reportError = null;
      })
      .addCase(reportReview.fulfilled, (state) => {
        state.reporting = false;
      })
      .addCase(reportReview.rejected, (state, action) => {
        state.reporting = false;
        state.reportError = action.payload as string;
      })
      
      // Get review stats
      .addCase(getReviewStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getReviewStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        const response = action.payload as any;
        if (response.data) {
          state.stats = response.data;
        }
      })
      .addCase(getReviewStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      })
      
      // Get property rating summary
      .addCase(getPropertyRatingSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(getPropertyRatingSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        const response = action.payload as any;
        if (response.data) {
          state.propertySummary = response.data;
        }
      })
      .addCase(getPropertyRatingSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload as string;
      })
      
      // Get user review history
      .addCase(getUserReviewHistory.pending, (state) => {
        state.userReviewsLoading = true;
        state.userReviewsError = null;
      })
      .addCase(getUserReviewHistory.fulfilled, (state, action) => {
        state.userReviewsLoading = false;
        const response = action.payload as any;
        if (response.data) {
          const { reviews, pagination } = response.data;
          if (pagination.page === 1) {
            state.userReviews = reviews;
          } else {
            state.userReviews = [...state.userReviews, ...reviews];
          }
          state.userReviewsPagination = pagination;
        }
      })
      .addCase(getUserReviewHistory.rejected, (state, action) => {
        state.userReviewsLoading = false;
        state.userReviewsError = action.payload as string;
      });
  },
});

// Actions
export const {
  clearError,
  clearCurrentReview,
  clearStats,
  clearPropertySummary,
  clearUserReviews,
} = reviewsSlice.actions;

// Selectors
export const selectReviews = (state: { reviews: ReviewsState }) => state.reviews.reviews;
export const selectCurrentReview = (state: { reviews: ReviewsState }) => state.reviews.currentReview;
export const selectReviewStats = (state: { reviews: ReviewsState }) => state.reviews.stats;
export const selectPropertySummary = (state: { reviews: ReviewsState }) => state.reviews.propertySummary;
export const selectUserReviews = (state: { reviews: ReviewsState }) => state.reviews.userReviews;
export const selectReviewsPagination = (state: { reviews: ReviewsState }) => state.reviews.pagination;
export const selectUserReviewsPagination = (state: { reviews: ReviewsState }) => state.reviews.userReviewsPagination;

export const selectReviewsLoading = (state: { reviews: ReviewsState }) => state.reviews.loading;
export const selectCreatingReview = (state: { reviews: ReviewsState }) => state.reviews.creating;
export const selectUpdatingReview = (state: { reviews: ReviewsState }) => state.reviews.updating;
export const selectDeletingReview = (state: { reviews: ReviewsState }) => state.reviews.deleting;
export const selectMarkingHelpful = (state: { reviews: ReviewsState }) => state.reviews.markingHelpful;
export const selectReportingReview = (state: { reviews: ReviewsState }) => state.reviews.reporting;
export const selectAddingResponse = (state: { reviews: ReviewsState }) => state.reviews.addingResponse;
export const selectStatsLoading = (state: { reviews: ReviewsState }) => state.reviews.statsLoading;
export const selectSummaryLoading = (state: { reviews: ReviewsState }) => state.reviews.summaryLoading;
export const selectUserReviewsLoading = (state: { reviews: ReviewsState }) => state.reviews.userReviewsLoading;

export const selectReviewsError = (state: { reviews: ReviewsState }) => state.reviews.error;
export const selectCreateReviewError = (state: { reviews: ReviewsState }) => state.reviews.createError;
export const selectUpdateReviewError = (state: { reviews: ReviewsState }) => state.reviews.updateError;
export const selectDeleteReviewError = (state: { reviews: ReviewsState }) => state.reviews.deleteError;
export const selectHelpfulError = (state: { reviews: ReviewsState }) => state.reviews.helpfulError;
export const selectReportError = (state: { reviews: ReviewsState }) => state.reviews.reportError;
export const selectResponseError = (state: { reviews: ReviewsState }) => state.reviews.responseError;
export const selectStatsError = (state: { reviews: ReviewsState }) => state.reviews.statsError;
export const selectSummaryError = (state: { reviews: ReviewsState }) => state.reviews.summaryError;
export const selectUserReviewsError = (state: { reviews: ReviewsState }) => state.reviews.userReviewsError;

export default reviewsSlice.reducer;
