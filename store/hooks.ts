// Temporarily disabled Redux hooks to avoid Provider context issues
// These will be re-enabled once we have the Redux Provider working properly

// Temporary mock hooks that return dummy values
export const useAuth = () => ({ 
  user: null, 
  token: null, 
  isAuthenticated: false, 
  isLoading: false, 
  error: null 
});

export const useAuthError = () => null;

export const useAuthLoading = () => false;

export const useUser = () => null;

export const useIsAuthenticated = () => false;

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
