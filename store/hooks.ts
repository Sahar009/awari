import { useAppSelector, useAppDispatch } from './index';
import { RootState } from './index';

// Auth selectors
export const useAuth = () => {
  return useAppSelector((state: RootState) => state.auth);
};

export const useUser = () => {
  return useAppSelector((state: RootState) => state.auth.user);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state: RootState) => state.auth.isAuthenticated);
};

export const useAuthLoading = () => {
  return useAppSelector((state: RootState) => state.auth.isLoading);
};

export const useAuthError = () => {
  return useAppSelector((state: RootState) => state.auth.error);
};

// Property selectors
export const useProperties = () => {
  return useAppSelector((state: RootState) => state.property.properties);
};

export const useFilteredProperties = () => {
  return useAppSelector((state: RootState) => state.property.filteredProperties);
};

export const useCurrentProperty = () => {
  return useAppSelector((state: RootState) => state.property.currentProperty);
};

export const usePropertyFilters = () => {
  return useAppSelector((state: RootState) => state.property.filters);
};

export const usePropertyLoading = () => {
  return useAppSelector((state: RootState) => state.property.isLoading);
};

export const usePropertyError = () => {
  return useAppSelector((state: RootState) => state.property.error);
};

export const usePropertyPagination = () => {
  return useAppSelector((state: RootState) => ({
    currentPage: state.property.currentPage,
    totalPages: state.property.totalPages,
  }));
};

// UI selectors
export const useUI = () => {
  return useAppSelector((state: RootState) => state.ui);
};

export const useNotifications = () => {
  return useAppSelector((state: RootState) => state.ui.notifications);
};

export const useModals = () => {
  return useAppSelector((state: RootState) => state.ui.modals);
};

export const useSidebarOpen = () => {
  return useAppSelector((state: RootState) => state.ui.sidebarOpen);
};

export const useSearchOpen = () => {
  return useAppSelector((state: RootState) => state.ui.searchOpen);
};

export const useTheme = () => {
  return useAppSelector((state: RootState) => state.ui.theme);
};

export const useLoadingState = (key: string) => {
  return useAppSelector((state: RootState) => state.ui.loadingStates[key] || false);
};

// Utility selectors
export const useIsAnyLoading = () => {
  return useAppSelector((state: RootState) => 
    state.auth.isLoading || 
    state.property.isLoading || 
    Object.values(state.ui.loadingStates).some(Boolean)
  );
};

export const useHasErrors = () => {
  return useAppSelector((state: RootState) => 
    !!state.auth.error || !!state.property.error
  );
};

// Custom selectors for derived state
export const usePropertyStats = () => {
  return useAppSelector((state: RootState) => {
    const properties = state.property.properties;
    return {
      total: properties.length,
      forRent: properties.filter(p => p.status === 'for-rent').length,
      forSale: properties.filter(p => p.status === 'for-sale').length,
      shortlets: properties.filter(p => p.status === 'shortlet').length,
      averagePrice: properties.length > 0 
        ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length 
        : 0,
    };
  });
};

export const usePropertyTypes = () => {
  return useAppSelector((state: RootState) => {
    const properties = state.property.properties;
    const types = properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
    }));
  });
};

export const usePropertyLocations = () => {
  return useAppSelector((state: RootState) => {
    const properties = state.property.properties;
    const locations = properties.reduce((acc, property) => {
      acc[property.location] = (acc[property.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(locations).map(([location, count]) => ({
      location,
      count,
    }));
  });
};
