'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../mainLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchHotelSummary,
  fetchHotelRooms,
  fetchHotelBookings,
  fetchHotelAvailability,
  updateHotelRoomPricing,
  respondHotelBooking,
  setRoomFilters,
  setBookingFilters,
  resetAvailability
} from '@/store/slices/hotelDashboardSlice';
import { Loader } from '@/components/ui/Loader';
import {
  ArrowRight,
  BedDouble,
  BarChart3,
  TrendingUp,
  CalendarClock,
  CheckCircle,
  MapPin,
  DollarSign,
  Pencil,
  XCircle,
  Hotel
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import type { HotelRoomEntry } from '@/services/hotelDashboardService';

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

type PricingDraft = {
  price: string;
  originalPrice: string;
  pricePeriod: string;
  negotiable: boolean;
};

const DEFAULT_PRICING_DRAFT: PricingDraft = {
  price: '',
  originalPrice: '',
  pricePeriod: 'per_night',
  negotiable: false
};

const formatCurrency = (amount: number) =>
  `₦${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function HotelDashboardPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const hotelDashboard = useAppSelector((state) => state.hotelDashboard);

  const isHotelProvider = useMemo(
    () => user?.role === 'hotel_provider',
    [user?.role]
  );

  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [pricingDraft, setPricingDraft] = useState<PricingDraft>({ ...DEFAULT_PRICING_DRAFT });

  useEffect(() => {
    if (!isAuthenticated || !isHotelProvider) return;

    dispatch(fetchHotelSummary(undefined));
    dispatch(fetchHotelRooms(DEFAULT_PAGINATION));
    dispatch(setRoomFilters(DEFAULT_PAGINATION));
    dispatch(fetchHotelBookings(DEFAULT_PAGINATION));
    dispatch(setBookingFilters(DEFAULT_PAGINATION));
  }, [dispatch, isAuthenticated, isHotelProvider]);

  const handleRefreshRooms = () => {
    dispatch(fetchHotelRooms(hotelDashboard.rooms.filters));
  };

  const handleRefreshBookings = () => {
    dispatch(fetchHotelBookings(hotelDashboard.bookings.filters));
  };

  const handleEditPricing = (roomId: string) => {
    if (editRoomId === roomId) {
      setEditRoomId(null);
      setPricingDraft({ ...DEFAULT_PRICING_DRAFT });
      return;
    }

    const room = hotelDashboard.rooms.collection.items.find((r) => r.id === roomId);
    if (room) {
      setEditRoomId(roomId);
      setPricingDraft({
        price: room.price !== undefined ? String(room.price) : '',
        originalPrice: room.originalPrice !== undefined && room.originalPrice !== null ? String(room.originalPrice) : '',
        pricePeriod: room.pricePeriod ?? 'per_night',
        negotiable: Boolean(room.negotiable)
      });
    }
  };

  const handleSavePricing = (roomId: string) => {
    const payload: Partial<HotelRoomEntry> = {};
    if (pricingDraft.price !== '') {
      payload.price = Number(pricingDraft.price);
    }
    if (pricingDraft.originalPrice !== '') {
      payload.originalPrice = Number(pricingDraft.originalPrice);
    }
    if (pricingDraft.pricePeriod) {
      payload.pricePeriod = pricingDraft.pricePeriod;
    }
    payload.negotiable = pricingDraft.negotiable;

    dispatch(updateHotelRoomPricing({ propertyId: roomId, payload }))
      .unwrap()
      .then(() => {
        setEditRoomId(null);
        setPricingDraft({ ...DEFAULT_PRICING_DRAFT });
      })
      .catch(() => {});
  };

  const handleRespondBooking = (bookingId: string, action: 'approve' | 'reject' | 'check_in' | 'check_out') => {
    dispatch(respondHotelBooking({ bookingId, action })).unwrap().catch(() => {});
  };

  const handleViewAvailability = (roomId: string) => {
    dispatch(fetchHotelAvailability({ propertyId: roomId, params: {} }));
  };

  const closeAvailabilityModal = () => {
    dispatch(resetAvailability());
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to access the hotel dashboard.</p>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isHotelProvider) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md text-center bg-white shadow-lg rounded-2xl p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Access Restricted</h2>
            <p className="text-gray-600">
              The hotel provider dashboard is available only to hotel provider accounts. If you believe this is an error,
              please contact support.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const summary = hotelDashboard.summary.data;

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hotel Provider Dashboard</h1>
            <p className="text-gray-600 max-w-2xl">
              Manage room inventory, bookings, pricing, and stay on top of performance metrics for your shortlet listings.
            </p>
          </header>

          {/* Summary Cards */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Performance Overview</h2>
                <p className="text-gray-500 text-sm">Key metrics for your hotel listings and bookings.</p>
              </div>
              <button
                onClick={() => dispatch(fetchHotelSummary(undefined))}
                className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
              >
                Refresh
              </button>
            </div>

            {hotelDashboard.summary.isLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex justify-center">
                <Loader variant="spinner" text="Loading dashboard summary..." />
              </div>
            ) : summary ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <BedDouble className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary">Active Rooms</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{summary.metrics.activeRooms}</p>
                    <p className="text-sm text-gray-500 mt-2">Out of {summary.metrics.totalRooms} total rooms</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-sky-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-sky-500" />
                      </div>
                      <span className="text-sm font-medium text-sky-500">Occupancy Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{summary.metrics.occupancyRate}%</p>
                    <p className="text-sm text-gray-500 mt-2">Confirmed bookings relative to inventory</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                      </div>
                      <span className="text-sm font-medium text-emerald-500">Upcoming Check-ins</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{summary.metrics.upcomingCheckins}</p>
                    <p className="text-sm text-gray-500 mt-2">Guests arriving soon</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <DollarSign className="h-6 w-6 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium text-amber-500">Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.metrics.totalRevenue)}</p>
                    <p className="text-sm text-gray-500 mt-2">Completed bookings revenue</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Rooms</h3>
                    {summary.popularRooms.length === 0 ? (
                      <p className="text-gray-500 text-sm">No booking data yet.</p>
                    ) : (
                      <ul className="space-y-4">
                        {summary.popularRooms.map((room) => {
                          const property = room.property as
                            | {
                                title?: unknown;
                                city?: unknown;
                                state?: unknown;
                              }
                            | undefined;
                          const title =
                            typeof property?.title === 'string' && property.title.trim().length > 0
                              ? property.title
                              : 'Room';
                          const city = typeof property?.city === 'string' ? property.city : '';
                          const state = typeof property?.state === 'string' ? property.state : '';

                          return (
                            <li key={room.propertyId} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{title}</p>
                                <p className="text-sm text-gray-500">
                                  {[city, state].filter(Boolean).join(', ')}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {room.bookingCount} bookings
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                    {summary.monthlyRevenue.length === 0 ? (
                      <p className="text-gray-500 text-sm">No revenue recorded yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {summary.monthlyRevenue.map((entry) => (
                          <li key={entry.period} className="flex items-center justify-between text-sm text-gray-700">
                            <span>{entry.period}</span>
                            <span>{formatCurrency(entry.totalAmount)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                Unable to retrieve dashboard summary at the moment.
              </div>
            )}
          </section>

          {/* Room Inventory */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Room Inventory</h2>
                <p className="text-gray-500 text-sm">Manage pricing and availability for your shortlet rooms.</p>
              </div>
              <button
                onClick={handleRefreshRooms}
                className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {hotelDashboard.rooms.isLoading ? (
                <div className="p-10 flex justify-center">
                  <Loader variant="spinner" text="Loading rooms..." />
                </div>
              ) : hotelDashboard.rooms.collection.items.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No rooms found. Add some listings to get started.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {hotelDashboard.rooms.collection.items.map((room) => {
                    const isEditing = editRoomId === room.id;
                    const isSaving = hotelDashboard.actions.updatingRoomId === room.id;
                    return (
                      <div key={room.id} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Hotel className="h-5 w-5 text-primary" /> {room.title}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                            <MapPin className="h-4 w-4" />
                            {room.city ?? 'N/A'}, {room.state ?? ''}
                          </p>
                          <div className="text-xs uppercase text-gray-400 font-medium mt-2">{room.status}</div>
                          <div className="text-xs text-gray-500 mt-2">Upcoming stays: {room.upcomingBookings.length}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Current rate:</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {formatCurrency(room.price)}
                            </span>
                            <span className="text-xs text-gray-500 uppercase">
                              {room.pricePeriod?.replace('_', ' ') ?? 'per night'}
                            </span>
                          </div>
                          {room.originalPrice && (
                            <div className="text-xs text-gray-500 line-through italic">
                              Original: {formatCurrency(room.originalPrice)}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Negotiable: {room.negotiable ? 'Yes' : 'No'}
                          </p>
                          <Button
                            variant="outline"
                            label={isEditing ? 'Cancel edit' : 'Edit pricing'}
                            onClick={() => handleEditPricing(room.id)}
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-dashed border-gray-200 pt-4 lg:pt-0 lg:pl-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Occupancy</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {room.occupancy} upcoming stays
                            </span>
                          </div>

                          <Button
                            variant="secondary"
                            label="View availability"
                            onClick={() => handleViewAvailability(room.id)}
                            className="w-full"
                          />

                          {isEditing && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                              <div>
                                <label className="text-xs text-gray-500 uppercase block mb-1">Rate</label>
                                <input
                                  type="number"
                                  value={pricingDraft.price ?? ''}
                                  onChange={(e) => setPricingDraft((prev) => ({ ...prev, price: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 uppercase block mb-1">Original Price</label>
                                <input
                                  type="number"
                                  value={pricingDraft.originalPrice ?? ''}
                                  onChange={(e) =>
                                    setPricingDraft((prev) => ({ ...prev, originalPrice: e.target.value }))
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 uppercase block mb-1">Rate Period</label>
                                <select
                                  value={pricingDraft.pricePeriod ?? 'per_night'}
                                  onChange={(e) =>
                                    setPricingDraft((prev) => ({ ...prev, pricePeriod: e.target.value }))
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                  <option value="per_night">Per Night</option>
                                  <option value="per_month">Per Month</option>
                                  <option value="per_year">Per Year</option>
                                  <option value="one_time">One Time</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(pricingDraft.negotiable)}
                                  onChange={(e) =>
                                    setPricingDraft((prev) => ({ ...prev, negotiable: e.target.checked }))
                                  }
                                  id={`negotiable-${room.id}`}
                                />
                                <label
                                  htmlFor={`negotiable-${room.id}`}
                                  className="text-sm text-gray-600"
                                >
                                  Negotiable
                                </label>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="secondary"
                                  label="Save"
                                  onClick={() => handleSavePricing(room.id)}
                                  className="flex-1"
                                  disabled={isSaving}
                                />
                                <Button
                                  variant="outline"
                                  label="Cancel"
                                  onClick={() => handleEditPricing(room.id)}
                                  className="flex-1"
                                />
                              </div>
                              {isSaving && (
                                <p className="text-xs text-gray-500">Updating pricing...</p>
                              )}
                              {hotelDashboard.actions.error && (
                                <p className="text-xs text-red-500">{hotelDashboard.actions.error}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Bookings */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Bookings</h2>
                <p className="text-gray-500 text-sm">Manage confirmations, check-ins, and guest stays.</p>
              </div>
              <button
                onClick={handleRefreshBookings}
                className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {hotelDashboard.bookings.isLoading ? (
                <div className="p-10 flex justify-center">
                  <Loader variant="spinner" text="Loading bookings..." />
                </div>
              ) : hotelDashboard.bookings.collection.items.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No bookings yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Stay Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {hotelDashboard.bookings.collection.items.map((booking) => {
                        const isUpdating = hotelDashboard.actions.updatingBookingId === booking.id;
                        const bookingUser = booking.user as
                          | { firstName?: unknown; lastName?: unknown; email?: unknown }
                          | undefined;
                        const firstName =
                          typeof bookingUser?.firstName === 'string' ? bookingUser.firstName : '';
                        const lastName =
                          typeof bookingUser?.lastName === 'string' ? bookingUser.lastName : '';
                        const email = typeof bookingUser?.email === 'string' ? bookingUser.email : '';

                        const bookingProperty = booking.property as
                          | { title?: unknown }
                          | undefined;
                        const propertyTitle =
                          typeof bookingProperty?.title === 'string' && bookingProperty.title.trim().length > 0
                            ? bookingProperty.title
                            : 'Room';

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Guest'}
                              </div>
                              <div className="text-xs text-gray-500">{email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{propertyTitle}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div>Check-in: {booking.checkInDate ? format(new Date(booking.checkInDate), 'PP') : '—'}</div>
                              <div>Check-out: {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'PP') : '—'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      label="Reject"
                                      onClick={() => handleRespondBooking(booking.id, 'reject')}
                                      disabled={isUpdating}
                                    />
                                    <Button
                                      label="Confirm"
                                      onClick={() => handleRespondBooking(booking.id, 'approve')}
                                      disabled={isUpdating}
                                    />
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <Button
                                    label="Mark Check-in"
                                    onClick={() => handleRespondBooking(booking.id, 'check_in')}
                                    disabled={isUpdating}
                                  />
                                )}
                                {booking.status === 'checked_in' && (
                                  <Button
                                    variant="secondary"
                                    label="Mark Check-out"
                                    onClick={() => handleRespondBooking(booking.id, 'check_out')}
                                    disabled={isUpdating}
                                  />
                                )}
                                {isUpdating && (
                                  <span className="text-xs text-gray-500">Updating...</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Availability Modal */}
        {hotelDashboard.availability.propertyId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Room Availability</h3>
                  <p className="text-xs text-gray-500">
                    Availability slots for property ID {hotelDashboard.availability.propertyId}
                  </p>
                </div>
                <button
                  onClick={closeAvailabilityModal}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  <XCircle className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
                {hotelDashboard.availability.isLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loader variant="spinner" text="Loading availability..." />
                  </div>
                ) : hotelDashboard.availability.calendar.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">No availability slots configured.</div>
                ) : (
                  <div className="space-y-3">
                    {hotelDashboard.availability.calendar.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {format(new Date(slot.startDate), 'PP')} → {format(new Date(slot.endDate), 'PP')}
                          </div>
                          {slot.notes && <div className="text-xs text-gray-500">{slot.notes}</div>}
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                          {slot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}


