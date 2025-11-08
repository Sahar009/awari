import { apiService } from './api';

export interface EarningsTotals {
  totalEarnings: number;
  pendingPayouts: number;
  totalCompletedPayments: number;
}

export interface EarningsMetrics {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  activeListings: number;
}

export interface EarningsMonthlyEntry {
  period: string;
  totalAmount: number;
  completedPayments: number;
}

export interface EarningsPropertyEntry {
  propertyId: string;
  title: string;
  listingType: string;
  city?: string;
  state?: string;
  totalAmount: number;
  transactionCount: number;
}

export interface EarningsTransactionEntry {
  id: string;
  amount: number;
  currency: string;
  paymentType: string;
  paymentMethod: string;
  status: string;
  payoutStatus?: string;
  createdAt: string;
  property?: Record<string, unknown>;
  booking?: Record<string, unknown>;
}

export interface EarningsSummaryResponse {
  totals: EarningsTotals;
  metrics: EarningsMetrics;
  monthlyBreakdown: EarningsMonthlyEntry[];
  topProperties: EarningsPropertyEntry[];
  recentTransactions: EarningsTransactionEntry[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaymentLogEntry {
  id: string;
  amount: number;
  currency: string;
  paymentType: string;
  paymentMethod: string;
  status: string;
  payoutStatus?: string;
  payoutAmount?: number;
  createdAt: string;
  property?: Record<string, unknown>;
  booking?: Record<string, unknown>;
  user?: Record<string, unknown>;
}

export interface BookingScheduleEntry {
  id: string;
  propertyId: string;
  ownerId: string;
  userId: string;
  bookingType: string;
  status: string;
  checkInDate?: string;
  checkOutDate?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  createdAt: string;
  property?: Record<string, unknown>;
  user?: Record<string, unknown>;
}

export interface BookingRequestEntry extends BookingScheduleEntry {}

export interface InquiryEntry {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  bookingId?: string;
  messageType: string;
  subject?: string;
  content: string;
  status: string;
  readAt?: string;
  createdAt: string;
  sender?: Record<string, unknown>;
  property?: Record<string, unknown>;
  booking?: Record<string, unknown>;
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

export const landlordDashboardService = {
  async getEarningsSummary(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: EarningsSummaryResponse;
    }>(`/landlord/dashboard/earnings${buildQueryString(params)}`);

    return response.data.data;
  },

  async getPaymentLogs(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: {
        payments: PaymentLogEntry[];
        pagination: PaginationMeta;
      };
    }>(`/landlord/dashboard/payments${buildQueryString(params)}`);

    return response.data.data;
  },

  async getInspectionSchedule(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: {
        bookings: BookingScheduleEntry[];
        pagination: PaginationMeta;
      };
    }>(`/landlord/dashboard/inspection-schedule${buildQueryString(params)}`);

    return response.data.data;
  },

  async getBookingRequests(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: {
        bookingRequests: BookingRequestEntry[];
        pagination: PaginationMeta;
      };
    }>(`/landlord/dashboard/booking-requests${buildQueryString(params)}`);

    return response.data.data;
  },

  async respondToBookingRequest(bookingId: string, action: 'approve' | 'reject', ownerNotes?: string) {
    const response = await apiService.put<{
      success: boolean;
      data: unknown;
    }>(`/landlord/dashboard/booking-requests/${bookingId}/respond`, {
      action,
      ownerNotes
    });

    return response.data;
  },

  async getClientInquiries(params?: Record<string, unknown>) {
    const response = await apiService.get<{
      success: boolean;
      data: {
        inquiries: InquiryEntry[];
        pagination: PaginationMeta;
      };
    }>(`/landlord/dashboard/inquiries${buildQueryString(params)}`);

    return response.data.data;
  },

  async archiveInquiry(messageId: string) {
    const response = await apiService.put<{
      success: boolean;
      data: InquiryEntry;
    }>(`/landlord/dashboard/inquiries/${messageId}/archive`, {});

    return response.data.data;
  }
};

export default landlordDashboardService;


