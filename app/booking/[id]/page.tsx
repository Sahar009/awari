'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Building2,
  FileText,
  Download,
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Bed,
  Bath,
  Car,
  Maximize
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUserBookings, type Booking } from '@/store/slices/bookingSlice';
import { hydrate } from '@/store/slices/authSlice';
import MainLayout from '../../mainLayout';
import Container from '@/components/Container';
import { AuthLoader } from '@/components/ui/Loader';
import Image from 'next/image';

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  
  const bookingId = params?.id as string;
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { bookings, isLoading } = useAppSelector((state) => state.bookings);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Hydrate auth state from localStorage first
  useEffect(() => {
    dispatch(hydrate());
    
    // Immediately check if we have a token in localStorage
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (localToken) {
      setAuthChecked(true);
    }
  }, [dispatch]);

  // Check authentication status when auth state changes
  useEffect(() => {
    // Skip if already checked
    if (authChecked) return;
    
    const checkAuth = () => {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const hasToken = !!token || !!localToken;
      const hasAuth = isAuthenticated || hasToken;
      
      if (!hasAuth) {
        router.push('/auth/login');
        return;
      }
      
      setAuthChecked(true);
    };
    
    // Small delay to allow hydration to complete
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, authChecked, router]);

  useEffect(() => {
    if (authChecked && (isAuthenticated || token) && bookingId) {
      // Try to find booking in existing state
      const existingBooking = bookings.find((b) => b.id === bookingId);
      if (existingBooking) {
        setBooking(existingBooking);
      } else {
        // Fetch all bookings if not found
        dispatch(fetchUserBookings({}));
      }
    }
  }, [authChecked, isAuthenticated, token, bookingId, bookings, dispatch]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500', text: 'text-white', icon: Clock, label: 'Pending' },
      confirmed: { bg: 'bg-green-500', text: 'text-white', icon: CheckCircle, label: 'Confirmed' },
      cancelled: { bg: 'bg-red-500', text: 'text-white', icon: XCircle, label: 'Cancelled' },
      completed: { bg: 'bg-blue-500', text: 'text-white', icon: CheckCircle, label: 'Completed' },
      rejected: { bg: 'bg-gray-500', text: 'text-white', icon: XCircle, label: 'Rejected' },
      expired: { bg: 'bg-gray-400', text: 'text-white', icon: AlertCircle, label: 'Expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl ${config.bg} shadow-lg`}>
        <Icon className={config.text} size={20} />
        <span className={`font-bold ${config.text}`}>{config.label}</span>
      </div>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      partial: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      refunded: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Show loader while checking auth
  if (!authChecked) {
    return <AuthLoader />;
  }

  // Redirect to login if not authenticated (this should rarely happen due to useEffect)
  if (!isAuthenticated && !token) {
    return <AuthLoader />;
  }

  if (isLoading || !booking) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
          <Container>
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading booking details...</p>
              </div>
            </div>
          </Container>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <Container>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Bookings</span>
          </button>

          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Booking Details
                </h1>
                <p className="text-sm text-gray-500">ID: {booking.id}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Information */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Home className="text-gray-600" size={20} />
                    Property Information
                  </h2>
                </div>
                <div className="p-6">
                  {booking.property?.images?.[0] && (
                    <div className="relative w-full h-64 overflow-hidden mb-4">
                      <Image
                        src={booking.property.images[0]}
                        alt={booking.property.title || 'Property'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {booking.property?.title || 'Property'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin size={16} />
                    <span className="text-sm">{booking.property?.address || 'Address not available'}</span>
                  </div>
                  
                  {/* Property Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {booking.property?.bedrooms && (
                      <div className="flex items-center gap-2 p-2 border border-gray-200">
                        <Bed className="text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Bedrooms</p>
                          <p className="text-sm font-semibold text-gray-900">{booking.property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {booking.property?.bathrooms && (
                      <div className="flex items-center gap-2 p-2 border border-gray-200">
                        <Bath className="text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Bathrooms</p>
                          <p className="text-sm font-semibold text-gray-900">{booking.property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {booking.property?.parkingSpaces && (
                      <div className="flex items-center gap-2 p-2 border border-gray-200">
                        <Car className="text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Parking</p>
                          <p className="text-sm font-semibold text-gray-900">{booking.property.parkingSpaces}</p>
                        </div>
                      </div>
                    )}
                    {booking.property?.floorArea && (
                      <div className="flex items-center gap-2 p-2 border border-gray-200">
                        <Maximize className="text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Area</p>
                          <p className="text-sm font-semibold text-gray-900">{booking.property.floorArea}m²</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Property Type & Status */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium capitalize">
                      {booking.property?.propertyType || 'Property'}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium capitalize">
                      For {booking.property?.listingType || 'Listing'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/product-details?id=${booking.propertyId}`)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Property Details
                  </button>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-gray-600" size={20} />
                    Booking Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Booking Type</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {booking.bookingType.replace('_', ' ')}
                      </p>
                    </div>

                    {booking.bookingType === 'sale_inspection' ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Inspection Date</p>
                          <p className="font-semibold text-gray-900">
                            {booking.inspectionDate ? formatDate(booking.inspectionDate) : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Inspection Time</p>
                          <p className="font-semibold text-gray-900">
                            {booking.inspectionTime ? booking.inspectionTime.substring(0, 5) : 'Not set'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Check-in Date</p>
                          <p className="font-semibold text-gray-900">
                            {booking.checkInDate ? formatDate(booking.checkInDate) : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Check-out Date</p>
                          <p className="font-semibold text-gray-900">
                            {booking.checkOutDate ? formatDate(booking.checkOutDate) : 'Not set'}
                          </p>
                        </div>
                        {booking.numberOfNights && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Number of Nights</p>
                            <p className="font-semibold text-gray-900">{booking.numberOfNights}</p>
                          </div>
                        )}
                        {booking.numberOfGuests && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Number of Guests</p>
                            <p className="font-semibold text-gray-900">{booking.numberOfGuests}</p>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Booking Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">Special Requests</p>
                      <p className="text-gray-900">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <User className="text-gray-600" size={20} />
                    Guest Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-semibold text-gray-900">{booking.guestName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{booking.guestEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{booking.guestPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Summary</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-3">
                    {/* Base Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(booking.basePrice, booking.currency)}
                      </span>
                    </div>

                    {/* Service Fee */}
                    {booking.serviceFee && booking.serviceFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Service Fee</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(booking.serviceFee, booking.currency)}
                        </span>
                      </div>
                    )}

                    {/* Tax */}
                    {booking.taxAmount && booking.taxAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tax</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(booking.taxAmount, booking.currency)}
                        </span>
                      </div>
                    )}

                    {/* Discount */}
                    {booking.discountAmount && booking.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm">Discount</span>
                        <span className="font-semibold">
                          -{formatCurrency(booking.discountAmount, booking.currency)}
                        </span>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">Total Amount</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>

                    {/* Payment Method if available */}
                    {booking.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {booking.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Owner */}
              {booking.property?.owner && (
                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Property Owner</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.property.owner.firstName} {booking.property.owner.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.property.owner.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <a
                        href={`mailto:${booking.property.owner.email}`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Mail size={16} />
                        <span>Send Email</span>
                      </a>
                      {booking.property.owner.phone && (
                        <a
                          href={`tel:${booking.property.owner.phone}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Phone size={16} />
                          <span>Call Owner</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {booking.status === 'pending' && (
                    <button 
                      onClick={async () => {
                        if (!confirm('Are you sure you want to cancel this booking?')) {
                          return;
                        }

                        const reason = prompt('Please provide a reason for cancellation (optional):');
                        
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/${booking.id}/cancel`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              cancellationReason: reason || undefined
                            })
                          });

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.message || 'Failed to cancel booking');
                          }

                          alert('Booking cancelled successfully');
                          window.location.reload();
                        } catch (error) {
                          console.error('Error cancelling booking:', error);
                          alert(error instanceof Error ? error.message : 'Failed to cancel booking. Please try again.');
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors mb-2"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/${booking.id}/download-receipt`, {
                          method: 'GET',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });

                        if (!response.ok) {
                          throw new Error('Failed to download receipt');
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `booking-receipt-${booking.id}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Error downloading receipt:', error);
                        alert('Failed to download receipt. Please try again.');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Download size={16} />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
}
