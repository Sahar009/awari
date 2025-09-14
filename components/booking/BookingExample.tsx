"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUserBookings,
  createBooking,
  cancelBooking,
  confirmBooking,
  rejectBooking,
  completeBooking,
  fetchBookingStatistics,
  selectBookings,
  selectBookingStatistics,
  selectBookingLoading,
  selectBookingCreating,
  selectBookingUpdating,
  selectBookingError,
  selectTotalRevenue,
  setFilters,
  clearBookings,
  type Booking,
} from '@/store/slices/bookingSlice';
import { useToast } from '@/components/ui/useToast';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BookingExampleProps {
  propertyId?: string;
  userId?: string;
}

const BookingExample: React.FC<BookingExampleProps> = ({ propertyId, userId }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  // Selectors
  const bookings = useAppSelector(selectBookings);
  const statistics = useAppSelector(selectBookingStatistics);
  const isLoading = useAppSelector(selectBookingLoading);
  const isCreating = useAppSelector(selectBookingCreating);
  const isUpdating = useAppSelector(selectBookingUpdating);
  const error = useAppSelector(selectBookingError);
  const totalRevenue = useAppSelector(selectTotalRevenue);

  // Local state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createBookingData, setCreateBookingData] = useState({
    propertyId: propertyId || '',
    bookingType: 'shortlet' as 'shortlet' | 'rental' | 'sale_inspection',
    checkInDate: '',
    checkOutDate: '',
    numberOfNights: 1,
    numberOfGuests: 1,
    basePrice: 0,
    totalPrice: 0,
    currency: 'NGN',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  });

  // Load bookings on component mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserBookings({ page: 1, limit: 10 }));
      dispatch(fetchBookingStatistics({ type: 'user' }));
    }
  }, [dispatch, userId]);

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!createBookingData.propertyId || !createBookingData.basePrice || !createBookingData.totalPrice) {
      toast.error('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await dispatch(createBooking(createBookingData)).unwrap();
      toast.success('Success', 'Booking created successfully!');
      setShowCreateForm(false);
      setCreateBookingData({
        propertyId: propertyId || '',
        bookingType: 'shortlet',
        checkInDate: '',
        checkOutDate: '',
        numberOfNights: 1,
        numberOfGuests: 1,
        basePrice: 0,
        totalPrice: 0,
        currency: 'NGN',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: '',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      toast.error('Error', errorMessage);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    try {
      await dispatch(cancelBooking({ bookingId, cancelData: { cancellationReason: reason } })).unwrap();
      toast.success('Success', 'Booking cancelled successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      toast.error('Error', errorMessage);
    }
  };

  // Handle booking confirmation (owner only)
  const handleConfirmBooking = async (bookingId: string, notes?: string) => {
    try {
      await dispatch(confirmBooking({ bookingId, ownerNotes: notes })).unwrap();
      toast.success('Success', 'Booking confirmed successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm booking';
      toast.error('Error', errorMessage);
    }
  };

  // Handle booking rejection (owner only)
  const handleRejectBooking = async (bookingId: string, reason?: string) => {
    try {
      await dispatch(rejectBooking({ bookingId, ownerNotes: reason })).unwrap();
      toast.success('Success', 'Booking rejected successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject booking';
      toast.error('Error', errorMessage);
    }
  };

  // Handle booking completion (owner only)
  const handleCompleteBooking = async (bookingId: string, notes?: string) => {
    try {
      await dispatch(completeBooking({ bookingId, ownerNotes: notes })).unwrap();
      toast.success('Success', 'Booking completed successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete booking';
      toast.error('Error', errorMessage);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
    dispatch(fetchUserBookings({ ...newFilters, page: 1 }));
  };

  // Clear all bookings
  const handleClearBookings = () => {
    dispatch(clearBookings());
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-100', icon: Clock, text: 'Pending' };
      case 'confirmed':
        return { color: 'text-blue-600 bg-blue-100', icon: CheckCircle, text: 'Confirmed' };
      case 'completed':
        return { color: 'text-green-600 bg-green-100', icon: CheckCircle, text: 'Completed' };
      case 'cancelled':
        return { color: 'text-red-600 bg-red-100', icon: XCircle, text: 'Cancelled' };
      case 'rejected':
        return { color: 'text-red-600 bg-red-100', icon: XCircle, text: 'Rejected' };
      case 'expired':
        return { color: 'text-gray-600 bg-gray-100', icon: AlertCircle, text: 'Expired' };
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: Clock, text: status };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
        <p className="text-gray-600">Manage your property bookings and reservations</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Booking'}
          </button>

          <button
            onClick={handleClearBookings}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            onChange={(e) => handleFilterChange({ bookingType: e.target.value || undefined })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="shortlet">Shortlet</option>
            <option value="rental">Rental</option>
            <option value="sale_inspection">Sale Inspection</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create Booking Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Booking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
              <input
                type="text"
                value={createBookingData.propertyId}
                onChange={(e) => setCreateBookingData({ ...createBookingData, propertyId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter property ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
              <select
                value={createBookingData.bookingType}
                onChange={(e) => setCreateBookingData({ ...createBookingData, bookingType: e.target.value as 'shortlet' | 'rental' | 'sale_inspection' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="shortlet">Shortlet</option>
                <option value="rental">Rental</option>
                <option value="sale_inspection">Sale Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
              <input
                type="date"
                value={createBookingData.checkInDate}
                onChange={(e) => setCreateBookingData({ ...createBookingData, checkInDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
              <input
                type="date"
                value={createBookingData.checkOutDate}
                onChange={(e) => setCreateBookingData({ ...createBookingData, checkOutDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
              <input
                type="number"
                value={createBookingData.basePrice}
                onChange={(e) => setCreateBookingData({ ...createBookingData, basePrice: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
              <input
                type="number"
                value={createBookingData.totalPrice}
                onChange={(e) => setCreateBookingData({ ...createBookingData, totalPrice: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBooking}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Bookings ({bookings.length})</h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking: Booking) => {
              const statusDisplay = getStatusDisplay(booking.status);
              const StatusIcon = statusDisplay.icon;

              return (
                <div key={booking.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.id.slice(0, 8)}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusDisplay.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Type:</span> {booking.bookingType}</p>
                          <p><span className="font-medium">Property:</span> {booking.property?.title || booking.propertyId}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Check-in:</span> {booking.checkInDate || 'N/A'}</p>
                          <p><span className="font-medium">Check-out:</span> {booking.checkOutDate || 'N/A'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Total Price:</span> ₦{booking.totalPrice.toLocaleString()}</p>
                          <p><span className="font-medium">Payment:</span> {booking.paymentStatus}</p>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCompleteBooking(booking.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}

                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingExample;
