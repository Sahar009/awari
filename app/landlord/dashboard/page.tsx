'use client';

import { useEffect, useMemo } from 'react';
import MainLayout from '../../mainLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLandlordEarnings,
  fetchLandlordPaymentLogs,
  fetchLandlordInspectionSchedule,
  fetchLandlordBookingRequests,
  respondLandlordBookingRequest,
  fetchLandlordInquiries,
  archiveLandlordInquiry,
  setPaymentFilters,
  setInspectionFilters
} from '@/store/slices/landlordDashboardSlice';
import { Loader } from '@/components/ui/Loader';
import { ArrowRight, Calendar, CheckCircle, DollarSign, FileText, MapPin, MessageCircle, Users, XCircle } from 'lucide-react';

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

export default function LandlordDashboardPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const landlordDashboard = useAppSelector((state) => state.landlordDashboard);

  const isLandlord = useMemo(
    () => ['landlord', 'agent'].includes(user?.role ?? ''),
    [user?.role]
  );

  useEffect(() => {
    if (!isAuthenticated || !isLandlord) return;

    dispatch(fetchLandlordEarnings(undefined));
    dispatch(fetchLandlordPaymentLogs(DEFAULT_PAGINATION));
    dispatch(setPaymentFilters(DEFAULT_PAGINATION));
    dispatch(fetchLandlordInspectionSchedule(DEFAULT_PAGINATION));
    dispatch(setInspectionFilters(DEFAULT_PAGINATION));
    dispatch(fetchLandlordBookingRequests(DEFAULT_PAGINATION));
    dispatch(fetchLandlordInquiries(DEFAULT_PAGINATION));
  }, [dispatch, isAuthenticated, isLandlord]);

  const handleRespondToBooking = (bookingId: string, action: 'approve' | 'reject') => {
    dispatch(respondLandlordBookingRequest({ bookingId, action }))
      .unwrap()
      .catch(() => {});
  };

  const handleArchiveInquiry = (messageId: string) => {
    dispatch(archiveLandlordInquiry(messageId)).unwrap().catch(() => {});
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to access the landlord dashboard.</p>
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

  if (!isLandlord) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md text-center bg-white shadow-lg rounded-2xl p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Access Restricted</h2>
            <p className="text-gray-600">
              The landlord dashboard is available to landlord and agent accounts only. If you believe this is an error,
              please contact support.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const earnings = landlordDashboard.earnings.data;
  const earningsLoading = landlordDashboard.earnings.isLoading;

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Landlord Dashboard</h1>
            <p className="text-gray-600 max-w-2xl">
              Monitor your earnings, manage booking requests, and stay on top of upcoming inspections and client inquiries.
            </p>
          </header>

          {/* Earnings Overview */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Earnings Overview</h2>
                <p className="text-gray-500 text-sm">Snapshot of your financial performance across your listings.</p>
              </div>
            </div>

            {earningsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex justify-center">
                <Loader variant="spinner" text="Loading earnings summary..." />
              </div>
            ) : earnings ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary">Total Earnings</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ₦{earnings.totals.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Across all confirmed bookings and payouts
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <FileText className="h-6 w-6 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium text-amber-500">Pending Payouts</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ₦{earnings.totals.pendingPayouts.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Awaiting disbursement from platform</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                      </div>
                      <span className="text-sm font-medium text-emerald-500">Confirmed Bookings</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{earnings.metrics.confirmedBookings}</p>
                    <p className="text-sm text-gray-500 mt-2">Bookings confirmed by you</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-sky-100 rounded-xl">
                        <Users className="h-6 w-6 text-sky-500" />
                      </div>
                      <span className="text-sm font-medium text-sky-500">Active Listings</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{earnings.metrics.activeListings}</p>
                    <p className="text-sm text-gray-500 mt-2">Currently live properties</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
                    {earnings.topProperties.length === 0 ? (
                      <p className="text-gray-500 text-sm">No transactions yet.</p>
                    ) : (
                      <ul className="space-y-4">
                        {earnings.topProperties.map((property) => (
                          <li key={property.propertyId} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{property.title}</p>
                              <p className="text-sm text-gray-500">
                                {property.listingType?.toUpperCase()}
                                {property.city ? ` • ${property.city}` : ''}
                                {property.state ? `, ${property.state}` : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                ₦{property.totalAmount.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {property.transactionCount} bookings
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                    {earnings.recentTransactions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No recent transactions recorded.</p>
                    ) : (
                      <ul className="space-y-4">
                        {earnings.recentTransactions.map((transaction) => (
                          <li key={transaction.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                ₦{transaction.amount.toLocaleString()} • {transaction.paymentType}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              {transaction.status.toUpperCase()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                Unable to retrieve earnings summary at the moment.
              </div>
            )}
          </section>

          {/* Payment Logs */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Payment Logs</h2>
                <p className="text-gray-500 text-sm">Comprehensive view of completed transactions and payouts.</p>
              </div>
              <button
                onClick={() => dispatch(fetchLandlordPaymentLogs(landlordDashboard.payments.filters))}
                className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {landlordDashboard.payments.isLoading ? (
                <div className="p-10 flex justify-center">
                  <Loader variant="spinner" text="Loading payments..." />
                </div>
              ) : landlordDashboard.payments.collection.items.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No payment records available yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {landlordDashboard.payments.collection.items.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{payment.property?.title ?? '—'}</div>
                            <div className="text-xs text-gray-500 uppercase">{payment.paymentType}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              ₦{Number(payment.payoutAmount ?? payment.amount).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                {payment.status.toUpperCase()}
                              </span>
                              {payment.payoutStatus && (
                                <span className="text-xs text-gray-500">Payout: {payment.payoutStatus}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : '—'}
                            </div>
                            <div className="text-xs text-gray-500">{payment.user?.email ?? ''}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Booking Requests & Inspection Schedule */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Pending Booking Requests</h2>
                  <p className="text-gray-500 text-sm">Review and approve or reject new booking inquiries.</p>
                </div>
                <button
                  onClick={() => dispatch(fetchLandlordBookingRequests(DEFAULT_PAGINATION))}
                  className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                {landlordDashboard.bookingRequests.isLoading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex justify-center">
                    <Loader variant="spinner" text="Loading booking requests..." />
                  </div>
                ) : landlordDashboard.bookingRequests.collection.items.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    No pending booking requests.
                  </div>
                ) : (
                  landlordDashboard.bookingRequests.collection.items.map((booking) => {
                    const isProcessing = landlordDashboard.actionState.respondingBookingId === booking.id;
                    return (
                      <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">{booking.property?.title}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              Requested on {new Date(booking.createdAt).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              Guest: {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A'}
                            </div>
                            <div className="text-xs font-medium text-primary uppercase">
                              {booking.bookingType}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                disabled={isProcessing}
                                onClick={() => handleRespondToBooking(booking.id, 'reject')}
                                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-60"
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </button>
                              <button
                                disabled={isProcessing}
                                onClick={() => handleRespondToBooking(booking.id, 'approve')}
                                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition disabled:opacity-60"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </button>
                            </div>
                            {isProcessing && (
                              <span className="text-xs text-gray-500">Processing...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Inspection & Stay Schedule</h2>
                  <p className="text-gray-500 text-sm">Upcoming inspections and confirmed stays.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/landlord/inspections"
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                  >
                    Calendar view
                  </a>
                  <button
                    onClick={() => dispatch(fetchLandlordInspectionSchedule(DEFAULT_PAGINATION))}
                    className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {landlordDashboard.inspectionSchedule.isLoading ? (
                  <div className="p-10 flex justify-center">
                    <Loader variant="spinner" text="Loading schedule..." />
                  </div>
                ) : landlordDashboard.inspectionSchedule.collection.items.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">No upcoming inspections yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {landlordDashboard.inspectionSchedule.collection.items.map((booking) => (
                      <div key={booking.id} className="p-6 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.property?.title}</h3>
                          <div className="text-sm text-gray-500 mb-1">
                            Guest: {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400 uppercase">{booking.bookingType}</div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          {booking.bookingType === 'sale_inspection' ? (
                            <>
                              <div>Inspection: {booking.inspectionDate ? new Date(booking.inspectionDate).toLocaleDateString() : 'TBD'}</div>
                              {booking.inspectionTime && <div>Time: {booking.inspectionTime}</div>}
                            </>
                          ) : (
                            <>
                              <div>Check-in: {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'TBD'}</div>
                              <div>Check-out: {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'TBD'}</div>
                            </>
                          )}
                          <div className="text-xs text-gray-500 mt-1">Status: {booking.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Client Inquiries */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Client Inquiries</h2>
                <p className="text-gray-500 text-sm">Messages from potential tenants and guests.</p>
              </div>
              <button
                onClick={() => dispatch(fetchLandlordInquiries(DEFAULT_PAGINATION))}
                className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {landlordDashboard.inquiries.isLoading ? (
                <div className="p-10 flex justify-center">
                  <Loader variant="spinner" text="Loading inquiries..." />
                </div>
              ) : landlordDashboard.inquiries.collection.items.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No client inquiries yet.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {landlordDashboard.inquiries.collection.items.map((inquiry) => {
                    const isArchiving = landlordDashboard.actionState.archivingInquiryId === inquiry.id;
                    return (
                      <li key={inquiry.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {inquiry.subject || 'General Inquiry'}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">{inquiry.content}</p>
                          <div className="text-xs text-gray-500">
                            From {inquiry.sender ? `${inquiry.sender.firstName} ${inquiry.sender.lastName}` : 'Unknown'} •{' '}
                            {new Date(inquiry.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                            {inquiry.status.toUpperCase()}
                          </span>
                          <button
                            disabled={isArchiving}
                            onClick={() => handleArchiveInquiry(inquiry.id)}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-60"
                          >
                            Archive
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}


