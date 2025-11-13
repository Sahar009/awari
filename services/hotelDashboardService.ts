import { apiService } from './api';

export interface HotelMetrics {
  totalRooms: number;
  activeRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  upcomingCheckins: number;
  occupancyRate: number;
  totalRevenue: number;
}

export interface HotelMonthlyRevenue {
  period: string;
  totalAmount: number;
  transactions: number;
}

export interface HotelPopularRoom {
  propertyId: string;
  bookingCount: number;
  property?: Record<string, unknown>;
}

export interface HotelSummaryResponse {
  metrics: HotelMetrics;
  monthlyRevenue: HotelMonthlyRevenue[];
  popularRooms: HotelPopularRoom[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface HotelRoomEntry {
  id: string;
  title: string;
  status: string;
  city?: string;
  state?: string;
  price: number;
  originalPrice?: number;
  pricePeriod?: string;
  negotiable?: boolean;
  upcomingBookings: Array<{
    id: string;
    checkInDate?: string;
    checkOutDate?: string;
    status: string;
  }>;
  occupancy: number;
}

export interface HotelBookingEntry {
  id: string;
  propertyId: string;
  bookingType: string;
  status: string;
  checkInDate?: string;
  checkOutDate?: string;
  createdAt: string;
  property?: Record<string, unknown>;
  user?: Record<string, unknown>;
}

export interface HotelAvailabilitySlot {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export const hotelDashboardService = {
  async getSummary(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: HotelSummaryResponse;
    }>(`/hotel/dashboard/summary${buildQueryString(params)}`);

    return response.data.data;
  },

  async getRooms(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: {
        rooms: HotelRoomEntry[];
        pagination: PaginationMeta;
      };
    }>(`/hotel/dashboard/rooms${buildQueryString(params)}`);

    return response.data.data;
  },

  async updateRoomPricing(propertyId: string, payload: Partial<HotelRoomEntry>) {
    const response = await apiService.put<{
      success: boolean;
      data: HotelRoomEntry;
    }>(`/hotel/dashboard/rooms/${propertyId}/pricing`, payload);

    return response.data.data;
  },

  async getBookings(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: {
        bookings: HotelBookingEntry[];
        pagination: PaginationMeta;
      };
    }>(`/hotel/dashboard/bookings${buildQueryString(params)}`);

    return response.data.data;
  },

  async respondToBooking(bookingId: string, action: 'approve' | 'reject' | 'check_in' | 'check_out', notes?: string) {
    const response = await apiService.put<{
      success: boolean;
      data: unknown;
    }>(`/hotel/dashboard/bookings/${bookingId}/respond`, {
      action,
      notes
    });

    return response.data;
  },

  async getAvailability(propertyId: string, params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: HotelAvailabilitySlot[];
    }>(`/hotel/dashboard/rooms/${propertyId}/availability${buildQueryString(params)}`);

    return response.data.data;
  },

  async getAnalytics(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: HotelSummaryResponse;
    }>(`/hotel/dashboard/analytics${buildQueryString(params)}`);

    return response.data.data;
  }
};

export default hotelDashboardService;



