import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth selectors
export const useAuth = () => useAppSelector((state) => state.auth);

export const useAuthError = () => useAppSelector((state) => state.auth.error);

export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);

export const useUser = () => useAppSelector((state) => state.auth.user);

export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);

// Property selectors
export const useProperties = () => [];

export const useFilteredProperties = () => [];

export const useCurrentProperty = () => null;

export const usePropertyFilters = () => ({});

export const usePropertyLoading = () => false;

export const usePropertyError = () => null;

export const usePropertyPagination = () => ({
  currentPage: 1,
  totalPages: 1,
});

// UI selectors
export const useUI = () => ({
  notifications: [],
  modals: {},
  sidebarOpen: false,
  searchOpen: false,
  theme: 'light',
  loadingStates: {}
});

export const useNotifications = () => [];

export const useModals = () => ({});

export const useSidebarOpen = () => false;

export const useSearchOpen = () => false;

export const useTheme = () => 'light';

export const useLoadingState = (key: string) => false;

// Utility selectors
export const useIsAnyLoading = () => false;

export const useHasErrors = () => false;

// Custom selectors for derived state
export const usePropertyStats = () => ({
  total: 0,
  forRent: 0,
  forSale: 0,
  shortlets: 0,
  averagePrice: 0,
});

export const usePropertyTypes = () => [];

export const usePropertyLocations = () => [];
