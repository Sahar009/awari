import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

export interface UIState {
  notifications: Notification[];
  modals: Modal[];
  sidebarOpen: boolean;
  searchOpen: boolean;
  loadingStates: Record<string, boolean>;
  theme: 'light' | 'dark';
}

// Initial state
const initialState: UIState = {
  notifications: [],
  modals: [],
  sidebarOpen: false,
  searchOpen: false,
  loadingStates: {},
  theme: 'light',
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      const notification: Notification = {
        id,
        ...action.payload,
        duration: action.payload.duration || 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modal actions
    openModal: (state, action: PayloadAction<Omit<Modal, 'isOpen'>>) => {
      const existingModalIndex = state.modals.findIndex(
        (modal) => modal.id === action.payload.id
      );
      
      if (existingModalIndex !== -1) {
        state.modals[existingModalIndex].isOpen = true;
        state.modals[existingModalIndex].data = action.payload.data;
      } else {
        state.modals.push({
          ...action.payload,
          isOpen: true,
        });
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find((modal) => modal.id === action.payload);
      if (modal) {
        modal.isOpen = false;
      }
    },
    closeAllModals: (state) => {
      state.modals.forEach((modal) => {
        modal.isOpen = false;
      });
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Search actions
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },

    // Theme actions
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  toggleSearch,
  setSearchOpen,
  setLoading,
  clearLoading,
  toggleTheme,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
