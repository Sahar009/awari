import { apiService } from './api';

export interface InitializePaymentRequest {
  amount?: number;
  currency?: string;
  email?: string;
  reference?: string;
  callbackUrl?: string;
  channels?: string[];
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    gatewayResponse?: any;
  };
}

/**
 * Initialize Paystack payment for a booking
 * @param bookingId - The booking ID
 * @param paymentData - Payment initialization data
 * @returns Payment initialization response with authorization URL
 */
export const initializeBookingPayment = async (
  bookingId: string,
  paymentData: InitializePaymentRequest = {}
): Promise<InitializePaymentResponse> => {
  try {
    console.log('💳 Initializing payment for booking:', bookingId, paymentData);
    console.log('📡 API Endpoint:', `/payments/bookings/${bookingId}/initialize`);
    
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: InitializePaymentResponse;
    }>(`/payments/bookings/${bookingId}/initialize`, paymentData);

    console.log('📥 Payment initialization response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to initialize payment');
    }

    if (!response.data.data || !response.data.data.authorizationUrl) {
      console.error('❌ Missing authorization URL in response:', response.data);
      throw new Error('Authorization URL not received from server');
    }

    console.log('✅ Payment initialized successfully:', {
      authorizationUrl: response.data.data.authorizationUrl,
      reference: response.data.data.reference,
      accessCode: response.data.data.accessCode
    });
    
    return response.data.data;
  } catch (error: unknown) {
    console.error('❌ Initialize payment error:', error);
    if (error instanceof Error) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
    throw new Error(errorMessage);
  }
};

/**
 * Verify Paystack payment
 * @param reference - Payment reference from Paystack
 * @returns Payment verification response
 */
export const verifyPayment = async (
  reference: string
): Promise<VerifyPaymentResponse> => {
  try {
    console.log('🔍 Verifying payment with reference:', reference);
    
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: VerifyPaymentResponse['data'];
    }>('/payments/verify', { reference });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to verify payment');
    }

    console.log('✅ Payment verified successfully:', response.data.data);
    return {
      success: true,
      message: response.data.message || 'Payment verified',
      data: response.data.data,
    };
  } catch (error: unknown) {
    console.error('❌ Verify payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
    throw new Error(errorMessage);
  }
};

/**
 * Open Paystack payment page
 * @param authorizationUrl - The Paystack authorization URL
 */
export const openPaystackPayment = (authorizationUrl: string): void => {
  if (!authorizationUrl) {
    throw new Error('Authorization URL is required');
  }
  
  console.log('🚀 Opening Paystack payment page:', authorizationUrl);
  window.location.href = authorizationUrl;
};

/**
 * Handle Paystack payment callback
 * This should be called when user returns from Paystack payment page
 * @param reference - Payment reference from URL query params
 * @returns Payment verification result
 */
export const handlePaystackCallback = async (
  reference: string
): Promise<VerifyPaymentResponse> => {
  if (!reference) {
    throw new Error('Payment reference is required');
  }
  
  return await verifyPayment(reference);
};

