import { apiService, ApiResponse } from './api';
import { Property, PropertyFilters } from '../store/slices/propertySlice';

// Property service interfaces
export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'apartment' | 'duplex' | 'office' | 'villa' | 'bungalow';
  status: 'for-rent' | 'for-sale' | 'shortlet';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: File[];
  amenities: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  features: {
    parking: boolean;
    garden: boolean;
    pool: boolean;
    security: boolean;
    furnished: boolean;
  };
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string;
}

export interface PropertySearchParams {
  page?: number;
  limit?: number;
  filters?: PropertyFilters;
  sortBy?: 'price' | 'date' | 'area';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FavoritePropertyData {
  propertyId: string;
  userId: string;
}

// Property service
export const propertyService = {
  // Get all properties with pagination and filters
  getProperties: async (params: PropertySearchParams = {}): Promise<ApiResponse<PropertyResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PropertyResponse>(url);
  },

  // Get property by ID
  getPropertyById: async (id: string): Promise<ApiResponse<Property>> => {
    return apiService.get<Property>(`/properties/${id}`);
  },

  // Search properties
  searchProperties: async (filters: PropertyFilters, params: Omit<PropertySearchParams, 'filters'> = {}): Promise<ApiResponse<PropertyResponse>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/properties/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PropertyResponse>(url);
  },

  // Get featured properties
  getFeaturedProperties: async (limit: number = 6): Promise<ApiResponse<Property[]>> => {
    return apiService.get<Property[]>(`/properties/featured?limit=${limit}`);
  },

  // Get properties by type
  getPropertiesByType: async (type: string, params: Omit<PropertySearchParams, 'filters'> = {}): Promise<ApiResponse<PropertyResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/properties/type/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PropertyResponse>(url);
  },

  // Get properties by location
  getPropertiesByLocation: async (location: string, params: Omit<PropertySearchParams, 'filters'> = {}): Promise<ApiResponse<PropertyResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/properties/location/${encodeURIComponent(location)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PropertyResponse>(url);
  },

  // Create new property
  createProperty: async (data: CreatePropertyData): Promise<ApiResponse<Property>> => {
    const formData = new FormData();
    
    // Append basic data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') {
        (value as File[]).forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } else if (key === 'amenities') {
        (value as string[]).forEach((amenity, index) => {
          formData.append(`amenities[${index}]`, amenity);
        });
      } else if (key === 'address') {
        Object.entries(value as Record<string, string>).forEach(([addrKey, addrValue]) => {
          formData.append(`address[${addrKey}]`, addrValue);
        });
      } else if (key === 'features') {
        Object.entries(value as Record<string, boolean>).forEach(([featureKey, featureValue]) => {
          formData.append(`features[${featureKey}]`, featureValue.toString());
        });
      } else {
        formData.append(key, value.toString());
      }
    });
    
    return apiService.upload<Property>('/properties', formData);
  },

  // Update property
  updateProperty: async (data: UpdatePropertyData): Promise<ApiResponse<Property>> => {
    const { id, ...updateData } = data;
    
    if (updateData.images || updateData.amenities || updateData.address || updateData.features) {
      const formData = new FormData();
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'images') {
            (value as File[]).forEach((file, index) => {
              formData.append(`images[${index}]`, file);
            });
          } else if (key === 'amenities') {
            (value as string[]).forEach((amenity, index) => {
              formData.append(`amenities[${index}]`, amenity);
            });
          } else if (key === 'address') {
            Object.entries(value as Record<string, string>).forEach(([addrKey, addrValue]) => {
              formData.append(`address[${addrKey}]`, addrValue);
            });
          } else if (key === 'features') {
            Object.entries(value as Record<string, boolean>).forEach(([featureKey, featureValue]) => {
              formData.append(`features[${featureKey}]`, featureValue.toString());
            });
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      return apiService.upload<Property>(`/properties/${id}`, formData);
    } else {
      return apiService.put<Property>(`/properties/${id}`, updateData);
    }
  },

  // Delete property
  deleteProperty: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete<{ message: string }>(`/properties/${id}`);
  },

  // Toggle favorite property
  toggleFavorite: async (data: FavoritePropertyData): Promise<ApiResponse<{ message: string; isFavorite: boolean }>> => {
    return apiService.post<{ message: string; isFavorite: boolean }>('/properties/favorite', data);
  },

  // Get user's favorite properties
  getFavoriteProperties: async (userId: string, params: Omit<PropertySearchParams, 'filters'> = {}): Promise<ApiResponse<PropertyResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/users/${userId}/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<PropertyResponse>(url);
  },

  // Get similar properties
  getSimilarProperties: async (propertyId: string, limit: number = 4): Promise<ApiResponse<Property[]>> => {
    return apiService.get<Property[]>(`/properties/${propertyId}/similar?limit=${limit}`);
  },

  // Get property statistics
  getPropertyStats: async (): Promise<ApiResponse<{
    totalProperties: number;
    totalRentals: number;
    totalSales: number;
    totalShortlets: number;
    averagePrice: number;
    propertiesByType: Record<string, number>;
    propertiesByLocation: Record<string, number>;
  }>> => {
    return apiService.get('/properties/stats');
  },
};

export default propertyService;

