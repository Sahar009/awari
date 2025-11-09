'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Calendar,
  CreditCard,
  FileText,
  Eye,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Building2,
  Hotel,
  ArrowRight,
  Filter,
  Download,
  Star,
  User
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { hydrate } from '@/store/slices/authSlice';
import {
  fetchMyRentals,
  fetchMyPurchases,
  fetchMyShortletBookings,
  fetchPaymentStatements,
  fetchDashboardStats,
  type RentalApplication,
  type PurchaseInspection,
  type ShortletBooking,
  type PaymentStatement,
  type ViewedProperty
} from '@/store/slices/userDashboardSlice';
import MainLayout from '../mainLayout';
import Container from '@/components/Container';
import { AuthLoader } from '@/components/ui/Loader';
import Image from 'next/image';

type TabType = 'rentals' | 'purchases' | 'shortlets';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const {
    rentals,
    rentalsLoading,
    rentalsPagination,
    inspections,
    viewedProperties,
    purchasesLoading,
    shortletBookings,
    shortletsLoading,
    shortletsPagination,
    paymentStatements,
    statementsLoading,
    statementsSummary,
    stats,
    statsLoading
  } = useAppSelector((state) => state.userDashboard);

  const [activeTab, setActiveTab] = useState<TabType>('rentals');
  const [authChecked, setAuthChecked] = useState(false);
  const [rentalFilter, setRentalFilter] = useState<string>('');
  const [purchaseFilter, setPurchaseFilter] = useState<string>('');
  const [shortletFilter, setShortletFilter] = useState<string>('');

  // Hydrate auth state from localStorage first
  useEffect(() => {
    dispatch(hydrate());
    
    // Immediately check if we have a token in localStorage
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (localToken) {
      console.log('Token found in localStorage, setting authChecked immediately');
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
      
      console.log('Dashboard Auth Check:', {
        isAuthenticated,
        hasToken: !!token,
        hasLocalToken: !!localToken,
        hasAuth,
        authChecked
      });
      
      if (hasAuth) {
        console.log('Auth check passed, setting authChecked to true');
        setAuthChecked(true);
      } else if (!localToken && !token && !isAuthenticated) {
        // Only redirect if we're sure there's no token
        console.log('No access, redirecting to login');
        router.push('/auth/login');
      }
    };
    
    // Small delay to ensure hydration completes
    const timer = setTimeout(checkAuth, 150);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, router, authChecked]);

  useEffect(() => {
    if (authChecked) {
      dispatch(fetchDashboardStats());
      
      if (activeTab === 'rentals') {
        dispatch(fetchMyRentals({ page: 1, limit: 10, status: rentalFilter || undefined }));
      } else if (activeTab === 'purchases') {
        dispatch(fetchMyPurchases({ page: 1, limit: 10, status: purchaseFilter || undefined }));
      } else if (activeTab === 'shortlets') {
        dispatch(fetchMyShortletBookings({ page: 1, limit: 10, status: shortletFilter || undefined }));
      }
    }
  }, [authChecked, activeTab, rentalFilter, purchaseFilter, shortletFilter, dispatch]);

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: LucideIcon; color: string; label: string }> = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      confirmed: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', label: 'Confirmed' },
      completed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Completed' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
      expired: { icon: AlertCircle, color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Expired' },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
      refunded: { color: 'bg-blue-100 text-blue-700', label: 'Refunded' },
    };

    const config = configs[status] || configs.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!authChecked) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <AuthLoader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        <Container>
          <div className="py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
              <p className="text-gray-600">Manage your rentals, purchases, and bookings all in one place</p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Rental Applications</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.rentals.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.rentals.pending} pending</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-purple-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Purchase Inspections</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.purchases.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.purchases.pending} pending</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Hotel className="h-6 w-6 text-orange-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Shortlet Bookings</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.shortlets.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.shortlets.upcoming} upcoming</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Spent</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.payments.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(stats.payments.pending)} pending
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('rentals')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'rentals'
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Home size={18} />
                      <span>My Rentals</span>
                      {stats && stats.rentals.total > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {stats.rentals.total}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'purchases'
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingBag size={18} />
                      <span>My Purchases</span>
                      {stats && stats.purchases.total > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {stats.purchases.total}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('shortlets')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'shortlets'
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Hotel size={18} />
                      <span>My Shortlets</span>
                      {stats && stats.shortlets.total > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {stats.shortlets.total}
                        </span>
                      )}
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Rentals Tab */}
                {activeTab === 'rentals' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Rental Applications</h2>
                      <div className="flex items-center gap-3">
                        <select
                          value={rentalFilter}
                          onChange={(e) => setRentalFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => dispatch(fetchPaymentStatements({ page: 1, limit: 20 }))}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FileText size={16} />
                          <span>View Statements</span>
                        </button>
                      </div>
                    </div>

                    {rentalsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <AuthLoader />
                      </div>
                    ) : rentals.length === 0 ? (
                      <div className="text-center py-12">
                        <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rental Applications</h3>
                        <p className="text-gray-600 mb-6">You haven&apos;t applied for any rentals yet.</p>
                        <button
                          onClick={() => router.push('/rentals')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Browse Rentals
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rentals.map((rental: RentalApplication) => (
                          <div
                            key={rental.id}
                            className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <div className="flex flex-col md:flex-row gap-6">
                              {rental.property?.primaryImage && (
                                <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                                  <Image
                                    src={rental.property.primaryImage}
                                    alt={rental.property.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                      {rental.property?.title || 'Property'}
                                    </h3>
                                    <div className="flex items-center text-gray-600 text-sm mb-2">
                                      <MapPin size={14} className="mr-1" />
                                      {rental.property?.address}, {rental.property?.city}
                                    </div>
                                  </div>
                                  {getStatusBadge(rental.status)}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                    <p className="text-sm font-medium">{formatDate(rental.checkInDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                    <p className="text-sm font-medium">{formatDate(rental.checkOutDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Price</p>
                                    <p className="text-sm font-medium">{formatCurrency(rental.totalPrice, rental.currency)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                                    {getPaymentStatusBadge(rental.paymentStatus)}
                                  </div>
                                </div>

                                {rental.property?.owner && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-200">
                                    <User size={14} />
                                    <span>
                                      Landlord: {rental.property.owner.firstName} {rental.property.owner.lastName}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 mt-4">
                                  <button
                                    onClick={() => router.push(`/product-details?id=${rental.propertyId}`)}
                                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                                  >
                                    View Property
                                    <ArrowRight size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Purchase Inspections & Viewed Properties</h2>
                      <select
                        value={purchaseFilter}
                        onChange={(e) => setPurchaseFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {purchasesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <AuthLoader />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Inspections */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Inspections</h3>
                          {inspections.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-600">No inspections scheduled</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {inspections.map((inspection: PurchaseInspection) => (
                                <div
                                  key={inspection.id}
                                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200"
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                        {inspection.property?.title || 'Property'}
                                      </h4>
                                      <div className="flex items-center text-gray-600 text-sm">
                                        <MapPin size={14} className="mr-1" />
                                        {inspection.property?.address}, {inspection.property?.city}
                                      </div>
                                    </div>
                                    {getStatusBadge(inspection.status)}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Inspection Date</p>
                                      <p className="text-sm font-medium">{formatDate(inspection.inspectionDate)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Time</p>
                                      <p className="text-sm font-medium">{inspection.inspectionTime || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-end">
                                      <button
                                        onClick={() => router.push(`/product-details?id=${inspection.propertyId}`)}
                                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                                      >
                                        View Property
                                        <ArrowRight size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Viewed Properties */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Viewed Properties</h3>
                          {viewedProperties.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <Eye className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-600">No properties viewed yet</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {viewedProperties.map((property: ViewedProperty) => (
                                <div
                                  key={property.id}
                                  className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
                                  onClick={() => router.push(`/product-details?id=${property.id}`)}
                                >
                                  {property.primaryImage && (
                                    <div className="relative w-full h-48">
                                      <Image
                                        src={property.primaryImage}
                                        alt={property.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h4>
                                    <div className="flex items-center text-gray-600 text-sm mb-2">
                                      <MapPin size={12} className="mr-1" />
                                      <span className="line-clamp-1">{property.address}, {property.city}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-lg font-bold text-primary">
                                        {formatCurrency(property.price, property.currency)}
                                      </p>
                                      <div className="flex items-center text-gray-500 text-xs">
                                        <Eye size={12} className="mr-1" />
                                        {property.viewCount}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Shortlets Tab */}
                {activeTab === 'shortlets' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Shortlet Bookings</h2>
                      <select
                        value={shortletFilter}
                        onChange={(e) => setShortletFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {shortletsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <AuthLoader />
                      </div>
                    ) : shortletBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Hotel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shortlet Bookings</h3>
                        <p className="text-gray-600 mb-6">You haven&apos;t booked any shortlets yet.</p>
                        <button
                          onClick={() => router.push('/shortlets')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Browse Shortlets
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {shortletBookings.map((booking: ShortletBooking) => (
                          <div
                            key={booking.id}
                            className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <div className="flex flex-col md:flex-row gap-6">
                              {booking.property?.primaryImage && (
                                <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                                  <Image
                                    src={booking.property.primaryImage}
                                    alt={booking.property.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                      {booking.property?.title || 'Property'}
                                    </h3>
                                    <div className="flex items-center text-gray-600 text-sm mb-2">
                                      <MapPin size={14} className="mr-1" />
                                      {booking.property?.address}, {booking.property?.city}
                                    </div>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                    <p className="text-sm font-medium">{formatDate(booking.checkInDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                    <p className="text-sm font-medium">{formatDate(booking.checkOutDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Nights</p>
                                    <p className="text-sm font-medium">{booking.numberOfNights || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Guests</p>
                                    <p className="text-sm font-medium">{booking.numberOfGuests || 'N/A'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Price</p>
                                    <p className="text-lg font-bold text-primary">
                                      {formatCurrency(booking.totalPrice, booking.currency)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                                    {getPaymentStatusBadge(booking.paymentStatus)}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4">
                                  <button
                                    onClick={() => router.push(`/product-details?id=${booking.propertyId}`)}
                                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                                  >
                                    View Property
                                    <ArrowRight size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
}

