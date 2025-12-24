'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Filter,
  Search,
  ChevronDown,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Building2,
  Hotel,
  FileText,
  Download
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUserBookings, setBookings, type Booking, type BookingFilters, type BookingPagination } from '@/store/slices/bookingSlice';
import { hydrate } from '@/store/slices/authSlice';
import apiService from '@/services/api';
import MainLayout from '../mainLayout';
import Container from '@/components/Container';
import { AuthLoader } from '@/components/ui/Loader';
import Image from 'next/image';

type BookingTab = 'all' | 'shortlet' | 'rental' | 'inspection';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export default function MyBookingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const { bookings, isLoading, pagination } = useAppSelector((state) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Redux State - Bookings:', {
      bookingsCount: state.bookings.bookings.length,
      isLoading: state.bookings.isLoading,
      error: state.bookings.error,
      pagination: state.bookings.pagination,
      actualBookings: state.bookings.bookings
    });
    console.log('📋 First booking:', state.bookings.bookings[0]);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return state.bookings;
  });
  
  const [activeTab, setActiveTab] = useState<BookingTab>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Hydrate auth state from localStorage first
  useEffect(() => {
    console.log('🔄 STEP 1: Hydrating auth state from localStorage');
    dispatch(hydrate());
    
    // Immediately check if we have a token in localStorage
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('🔑 STEP 2: Checking for local token:', localToken ? 'Found' : 'Not found');
    if (localToken) {
      console.log('✅ STEP 3: Setting authChecked to true');
      setAuthChecked(true);
    } else {
      console.log('⚠️ STEP 3: No token found, waiting for auth check');
    }
  }, [dispatch]);

  // Check authentication status when auth state changes
  useEffect(() => {
    console.log('🔍 STEP 4: Auth state changed, checking authentication status');
    // Skip if already checked
    if (authChecked) return;
    
    const checkAuth = () => {
      console.log('🔍 STEP 4: checkAuth called - isAuthenticated:', isAuthenticated, 'token:', !!token);
      const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
      console.log('🔍 STEP 4: checkAuth called - isAuthenticated:', isAuthenticated, 'hasToken:', hasToken);
      
      if (!isAuthenticated && !hasToken) {
        console.log('❌ STEP 5: No auth, redirecting to login');
        router.push('/auth/login');
        return;
      }
      
      console.log('✅ STEP 5: Auth verified, setting authChecked to true');
      setAuthChecked(true);
    };
    
    // Small delay to allow hydration to complete
    const timer = setTimeout(checkAuth, 100);
    console.log('⏰ STEP 4: Delaying auth check by 100ms');
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, authChecked, router]);

  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 STEP 6: Main useEffect triggered');
    console.log('📊 Current State:', {
      authChecked,
      isAuthenticated,
      hasToken: !!token,
      activeTab,
      statusFilter,
      currentBookingsCount: bookings.length,
      isLoading,
      localLoading
    });
    
    if (authChecked && (isAuthenticated || token)) {
      console.log('✅ STEP 7: Auth conditions met, calling loadBookings()');
      setLocalLoading(true);
      loadBookings();
    } else {
      console.log('⏳ STEP 7: Waiting for auth check... authChecked:', authChecked, 'isAuthenticated:', isAuthenticated, 'token:', !!token);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [authChecked, isAuthenticated, token, activeTab, statusFilter, currentPage]);

  const loadBookings = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 STEP 8: loadBookings function called - DIRECT API CALL');
    console.log('🔍 Current localLoading state:', localLoading);
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', currentPage.toString());
    queryParams.append('limit', '20');
    queryParams.append('sortBy', 'createdAt');
    queryParams.append('sortOrder', 'DESC');

    if (activeTab !== 'all') {
      if (activeTab === 'inspection') {
        queryParams.append('bookingType', 'sale_inspection');
      } else if (activeTab === 'rental') {
        queryParams.append('bookingType', 'rental');
      } else if (activeTab === 'shortlet') {
        queryParams.append('bookingType', 'shortlet');
      }
    }

    if (statusFilter !== 'all') {
      queryParams.append('status', statusFilter);
    }

    const url = `/bookings?${queryParams.toString()}`;
    console.log('📋 STEP 9: API URL:', url);
    console.log('🌐 STEP 10: Calling API directly...');
    
    try {
      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: {
          bookings: Booking[];
          pagination: BookingPagination;
        };
      }>(url);

      console.log('✅ STEP 11: API call SUCCESS!');
      console.log('📦 Raw response:', response);
      console.log('📦 Response data:', response.data);
      console.log('📊 Bookings:', response.data.data.bookings);
      console.log('� Bookings count:', response.data.data.bookings.length);
      
      // Update Redux state manually
      dispatch(setBookings({
        bookings: response.data.data.bookings,
        pagination: response.data.data.pagination
      }));
      
      console.log('✅ Redux state updated manually with setBookings action');
    } catch (error) {
      console.error('❌ STEP 11: API call FAILED!');
      console.error('Error details:', error);
    } finally {
      console.log('🏁 STEP 12: Setting localLoading to FALSE');
      setLocalLoading(false);
      console.log('✅ STEP 12a: localLoading set to false');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      rejected: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      expired: { bg: 'bg-gray-100', text: 'text-gray-600', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'shortlet':
        return <Home className="w-5 h-5 text-blue-600" />;
      case 'rental':
        return <Building2 className="w-5 h-5 text-green-600" />;
      case 'sale_inspection':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Hotel className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.property?.title?.toLowerCase().includes(query) ||
        booking.property?.address?.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 STEP 13: RENDER DECISION');
  console.log('State Check:', {
    authChecked,
    isAuthenticated,
    hasToken: !!token,
    isLoading,
    localLoading,
    bookingsCount: bookings.length,
    filteredCount: filteredBookings.length,
    willShowLoader: isLoading || localLoading,
    willShowEmpty: !isLoading && !localLoading && filteredBookings.length === 0,
    willShowBookings: !isLoading && !localLoading && filteredBookings.length > 0
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Show loader while checking auth
  if (!authChecked) {
    console.log('⏳ RENDERING: AuthLoader (auth not checked)');
    return <AuthLoader />;
  }

  // Redirect to login if not authenticated (this should rarely happen due to useEffect)
  if (!isAuthenticated && !token) {
    console.log('❌ RENDERING: AuthLoader (not authenticated)');
    return <AuthLoader />;
  }
  
  console.log('✅ RENDERING: Main bookings page');

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <Container>
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">My Bookings</h1>
                <p className="text-lg text-gray-600">View and manage all your property bookings</p>
              </div>
              <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { key: 'all', label: 'All Bookings', icon: Calendar },
                { key: 'shortlet', label: 'Shortlets', icon: Home },
                { key: 'rental', label: 'Rentals', icon: Building2 },
                { key: 'inspection', label: 'Inspections', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as BookingTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by property name, address, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {(() => {
            console.log('🔍 Bookings List Render Check:', { isLoading, localLoading, showingLoader: isLoading || localLoading });
            if (isLoading || localLoading) {
              console.log('🔄 Rendering skeleton loader...');
              return (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Image skeleton */}
                          <div className="w-full lg:w-48 h-48 bg-gray-200 rounded-lg"></div>
                          
                          {/* Content skeleton */}
                          <div className="flex-1 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <div className="h-10 bg-gray-200 rounded w-32"></div>
                              <div className="h-10 bg-gray-200 rounded w-32"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            
            console.log('📊 Filtered bookings check:', {
              filteredCount: filteredBookings.length,
              totalBookings: bookings.length,
              filteredBookings: filteredBookings
            });
            
            if (filteredBookings.length === 0) {
              console.log('📭 Rendering empty state');
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl border border-gray-200 shadow-2xl">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 px-8 py-16 md:px-16 md:py-20">
                    <div className="max-w-2xl mx-auto text-center">
                      {/* Image placeholder - user will add their own image */}
                      <div className="relative w-64 h-64 mx-auto mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-6"></div>
                        <div className="relative bg-white rounded-3xl shadow-xl p-8 flex items-center justify-center border border-gray-100">
                          {/* Placeholder for user's image */}
                          <div className="text-center">
                            <Calendar className="w-24 h-24 text-blue-500 mx-auto mb-4" />
                            <p className="text-xs text-gray-400 font-medium">Replace with your image</p>
                          </div>
                        
                          <Image 
                            src="/images/nobooking.png" 
                            alt="No bookings" 
                            fill 
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                          {searchQuery ? 'No Results Found' : 'No Bookings Yet'}
                        </h3>
                        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                          {searchQuery
                            ? 'We couldn\'t find any bookings matching your search. Try adjusting your filters or search terms.'
                            : 'Start your journey by exploring our amazing properties and make your first booking today!'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => router.push('/browse-listing')}
                          className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" />
                            Browse Properties
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                        
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                              setActiveTab('all');
                            }}
                            className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>

                      {/* Additional info */}
                      <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                              <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Wide Selection</h4>
                            <p className="text-sm text-gray-600">Choose from thousands of properties</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                              <CheckCircle className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Easy Booking</h4>
                            <p className="text-sm text-gray-600">Simple and secure booking process</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                              <User className="w-6 h-6 text-pink-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                            <p className="text-sm text-gray-600">We&apos;re here to help anytime</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            console.log('✅ Rendering bookings list with', filteredBookings.length, 'bookings');
            console.log('📋 Bookings to render:', filteredBookings);
            
            return (
              <div className="space-y-4">
              {filteredBookings.map((booking) => {
                console.log('🎨 Rendering booking card:', booking.id);
                return (
                  <div
                    key={booking.id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2"
                  >
                  <div className="p-6 relative">
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Property Image */}
                      {booking.property?.images?.[0] && (
                        <div className="w-full lg:w-48 h-48 relative rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                          <Image
                            src={booking.property.images[0]}
                            alt={booking.property.title || 'Property'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getBookingTypeIcon(booking.bookingType)}
                              <h3 className="text-xl font-semibold text-gray-900">
                                {booking.property?.title || 'Property'}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <MapPin size={16} />
                              {booking.property?.address || 'Address not available'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Booking ID: {booking.id}
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {booking.bookingType === 'sale_inspection' ? (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-gray-600">Inspection Date</p>
                                  <p className="font-medium text-gray-900">
                                    {booking.inspectionDate
                                      ? formatDate(booking.inspectionDate)
                                      : 'Not set'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-gray-600">Time</p>
                                  <p className="font-medium text-gray-900">
                                    {booking.inspectionTime ? booking.inspectionTime.substring(0, 5) : 'Not set'}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-gray-600">Check-in</p>
                                  <p className="font-medium text-gray-900">
                                    {booking.checkInDate
                                      ? formatDate(booking.checkInDate)
                                      : 'Not set'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-gray-600">Check-out</p>
                                  <p className="font-medium text-gray-900">
                                    {booking.checkOutDate
                                      ? formatDate(booking.checkOutDate)
                                      : 'Not set'}
                                  </p>
                                </div>
                              </div>
                              {booking.numberOfNights && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-gray-600">Duration</p>
                                    <p className="font-medium text-gray-900">
                                      {booking.numberOfNights} nights
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">₦</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                              <p className="font-extrabold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(booking.totalPrice, booking.currency)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            Booked on {formatDate(booking.createdAt)}
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => router.push(`/product-details?id=${booking.propertyId}`)}
                              className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-2 font-medium border border-blue-200 hover:border-blue-300"
                            >
                              <Eye size={16} />
                              View Property
                            </button>
                            <button
                              onClick={() => router.push(`/booking/${booking.id}`)}
                              className="group/btn relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
              </div>
            );
          })()}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of <span className="font-semibold text-gray-900">{pagination.totalItems}</span> bookings
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 transition-all duration-300 font-medium flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 transition-all duration-300 font-medium flex items-center gap-2"
                >
                  Next
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </Container>
      </div>
    </MainLayout>
  );
}
