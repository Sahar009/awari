'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { handlePaystackCallback } from '@/services/paymentService';
import { useToast } from '@/components/ui/useToast';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!searchParams) {
          setStatus('error');
          setMessage('Invalid payment callback. Please contact support.');
          return;
        }

        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');

        // Use reference or trxref (Paystack uses both)
        const paymentReference = reference || trxref;

        if (!paymentReference) {
          setStatus('error');
          setMessage('Payment reference not found. Please contact support.');
          return;
        }

        console.log('🔍 Verifying payment with reference:', paymentReference);

        // Verify payment
        const result = await handlePaystackCallback(paymentReference);

        if (result.success && result.data.status === 'success') {
          setStatus('success');
          setMessage('Payment verified successfully! Your booking has been confirmed.');
          toast.success('Payment Successful!', 'Your booking has been confirmed.');
          
          // Redirect to bookings page after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/bookings');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Payment verification failed. Please contact support.');
          toast.error('Payment Failed', result.message || 'Payment verification failed.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Payment verification failed. Please contact support.';
        setMessage(errorMessage);
        toast.error('Payment Error', errorMessage);
      }
    };

    verifyPayment();
  }, [searchParams, router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Bookings
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing payment verification...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

