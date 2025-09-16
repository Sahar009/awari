import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'booking' | 'payment' | 'property' | 'message' | 'system' | 'reminder';
  type: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  readAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  status?: 'unread' | 'read' | 'archived';
  category?: 'booking' | 'payment' | 'property' | 'message' | 'system' | 'reminder';
  type?: string;
  unreadOnly?: boolean;
  includeArchived?: boolean;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byCategory: {
    booking: number;
    payment: number;
    property: number;
    message: number;
    system: number;
    reminder: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface NotificationState {
  notifications: Notification[];
  currentNotification: Notification | null;
  stats: NotificationStats | null;
  pagination: NotificationPagination | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  currentNotification: null,
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
};

// Async Thunks
export const fetchUserNotifications = createAsyncThunk<
  { notifications: Notification[]; pagination: NotificationPagination },
  { userId: string; filters?: NotificationFilters },
  { rejectValue: string }
>(
  'notifications/fetchUserNotifications',
  async ({ userId, filters = {} }, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching user notifications:', { userId, filters });
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const url = `/notifications/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<{
        success: boolean;
        data: {
          notifications: Notification[];
          pagination: NotificationPagination;
        };
      }>(url);

      console.log('✅ Notifications fetched successfully:', response.data);
      console.log('🔍 Raw response structure:', {
        hasSuccess: 'success' in response.data,
        success: response.data.success,
        hasData: 'data' in response.data,
        hasNotifications: 'notifications' in response.data,
        hasPagination: 'pagination' in response.data,
        responseKeys: Object.keys(response.data)
      });
      
      // Handle both response structures
      if (response.data.success && response.data.data) {
        console.log('📦 Using nested data structure');
        return response.data.data;
      } else if ((response.data as any).notifications) {
        console.log('📦 Using direct structure');
        // Fallback for direct structure
        return response.data as any;
      } else {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response structure');
      }
    } catch (error: unknown) {
      console.error('❌ Fetch notifications error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      return rejectWithValue(errorMessage);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk<
  { notificationId: string },
  string,
  { rejectValue: string }
>(
  'notifications/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Marking notification as read:', notificationId);
      
      await apiService.patch(`/notifications/${notificationId}/read`);
      
      console.log('✅ Notification marked as read successfully');
      return { notificationId };
    } catch (error: unknown) {
      console.error('❌ Mark notification as read error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
      return rejectWithValue(errorMessage);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk<
  { count: number },
  void,
  { rejectValue: string }
>(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Marking all notifications as read');
      
      const response = await apiService.patch<{ count: number }>('/notifications/read-all');
      
      console.log('✅ All notifications marked as read:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Mark all notifications as read error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
      return rejectWithValue(errorMessage);
    }
  }
);

export const archiveNotification = createAsyncThunk<
  { notificationId: string },
  string,
  { rejectValue: string }
>(
  'notifications/archiveNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Archiving notification:', notificationId);
      
      await apiService.patch(`/notifications/${notificationId}/archive`);
      
      console.log('✅ Notification archived successfully');
      return { notificationId };
    } catch (error: unknown) {
      console.error('❌ Archive notification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive notification';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteNotification = createAsyncThunk<
  { notificationId: string },
  string,
  { rejectValue: string }
>(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Deleting notification:', notificationId);
      
      await apiService.delete(`/notifications/${notificationId}`);
      
      console.log('✅ Notification deleted successfully');
      return { notificationId };
    } catch (error: unknown) {
      console.error('❌ Delete notification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchNotificationStats = createAsyncThunk<
  NotificationStats,
  string,
  { rejectValue: string }
>(
  'notifications/fetchNotificationStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching notification stats:', userId);
      
      const response = await apiService.get<{
        success: boolean;
        data: NotificationStats;
      }>(`/notifications/stats/${userId}`);
      
      console.log('✅ Notification stats fetched successfully:', response.data);
      
      // Handle both response structures
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        // Fallback for direct structure
        return response.data as any;
      }
    } catch (error: unknown) {
      console.error('❌ Fetch notification stats error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notification stats';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = null;
    },
    setCurrentNotification: (state, action: PayloadAction<Notification | null>) => {
      state.currentNotification = action.payload;
    },
    updateNotificationInList: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
    removeNotificationFromList: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Notifications
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        // If it's page 1, replace notifications. Otherwise, append new ones
        if (action.payload.pagination.page === 1) {
          state.notifications = action.payload.notifications;
        } else {
          // Append new notifications, avoiding duplicates
          const existingIds = new Set(state.notifications.map(n => n.id));
          const newNotifications = action.payload.notifications.filter(n => !existingIds.has(n.id));
          state.notifications = [...state.notifications, ...newNotifications];
        }
        state.pagination = action.payload.pagination;
        state.error = null;
        
        // Update unread count based on all notifications
        const unreadCount = state.notifications.filter(n => n.status === 'unread').length;
        state.unreadCount = unreadCount;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark Notification as Read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.notificationId);
        if (notification) {
          notification.status = 'read';
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          
          // Update unread count
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        if (state.currentNotification?.id === action.payload.notificationId) {
          state.currentNotification.status = 'read';
          state.currentNotification.isRead = true;
          state.currentNotification.readAt = new Date().toISOString();
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark All Notifications as Read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.notifications.forEach(notification => {
          notification.status = 'read';
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        });
        
        if (state.currentNotification) {
          state.currentNotification.status = 'read';
          state.currentNotification.isRead = true;
          state.currentNotification.readAt = new Date().toISOString();
        }
        
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Archive Notification
    builder
      .addCase(archiveNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(archiveNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.notificationId);
        if (notification) {
          notification.status = 'archived';
          notification.isArchived = true;
          notification.archivedAt = new Date().toISOString();
          
          // Update unread count if it was unread
          if (notification.isRead === false) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
        
        if (state.currentNotification?.id === action.payload.notificationId) {
          state.currentNotification.status = 'archived';
          state.currentNotification.isArchived = true;
          state.currentNotification.archivedAt = new Date().toISOString();
        }
      })
      .addCase(archiveNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.notificationId);
        
        // Update unread count if it was unread
        if (notification && notification.isRead === false) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        state.notifications = state.notifications.filter(n => n.id !== action.payload.notificationId);
        
        if (state.currentNotification?.id === action.payload.notificationId) {
          state.currentNotification = null;
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Notification Stats
    builder
      .addCase(fetchNotificationStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.unreadCount = action.payload.unread;
      })
      .addCase(fetchNotificationStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearNotifications,
  setCurrentNotification,
  updateNotificationInList,
  removeNotificationFromList,
  setUnreadCount,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications;
export const selectCurrentNotification = (state: { notifications: NotificationState }) => state.notifications.currentNotification;
export const selectNotificationStats = (state: { notifications: NotificationState }) => state.notifications.stats;
export const selectNotificationPagination = (state: { notifications: NotificationState }) => state.notifications.pagination;
export const selectNotificationLoading = (state: { notifications: NotificationState }) => state.notifications.isLoading;
export const selectNotificationError = (state: { notifications: NotificationState }) => state.notifications.error;
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount;

// Derived selectors
export const selectUnreadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter(n => n.status === 'unread');

export const selectNotificationsByCategory = (state: { notifications: NotificationState }, category: string) =>
  state.notifications.notifications.filter(n => n.category === category);

export const selectNotificationsByStatus = (state: { notifications: NotificationState }, status: string) =>
  state.notifications.notifications.filter(n => n.status === status);

export const selectHighPriorityNotifications = (state: { notifications: NotificationState }) =>
  state.notifications.notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');

export default notificationSlice.reducer;
