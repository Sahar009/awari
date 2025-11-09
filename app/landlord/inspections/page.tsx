'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MainLayout from '../../mainLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLandlordInspectionSchedule,
  setInspectionFilters
} from '@/store/slices/landlordDashboardSlice';
import type { BookingScheduleEntry } from '@/services/landlordDashboardService';
import { addMonths, endOfMonth, format, isAfter, isSameMonth, startOfDay, startOfMonth } from 'date-fns';
import {
  CalendarEvent,
  InspectionCalendar,
  InspectionEventList
} from '@/components/landlord/InspectionCalendar';
import { Loader } from '@/components/ui/Loader';
import { CalendarDays, CheckSquare, Home, ListFilter, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

type EventFilter = 'all' | 'inspections' | 'stays';

const LIMIT = 200;

const toDateKey = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, 'yyyy-MM-dd');
};

const getPropertyTitle = (booking: BookingScheduleEntry) =>
  typeof booking.property === 'object' && booking.property && 'title' in booking.property
    ? String((booking.property as { title?: unknown }).title ?? '')
    : '';

const getGuestName = (booking: BookingScheduleEntry) => {
  if (typeof booking.user !== 'object' || !booking.user) return '';
  const firstName = 'firstName' in booking.user ? (booking.user as { firstName?: unknown }).firstName : '';
  const lastName = 'lastName' in booking.user ? (booking.user as { lastName?: unknown }).lastName : '';
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return name || '';
};

const buildCalendarEvents = (bookings: BookingScheduleEntry[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  bookings.forEach((booking) => {
    const propertyTitle = getPropertyTitle(booking) || 'Untitled property';
    const guestName = getGuestName(booking);
    const status = booking.status;

    if (booking.bookingType === 'sale_inspection') {
      const inspectionDateKey = toDateKey(booking.inspectionDate);
      if (inspectionDateKey) {
        events.push({
          id: `${booking.id}-inspection`,
          date: inspectionDateKey,
          type: 'inspection',
          title: propertyTitle,
          propertyTitle,
          guestName: guestName || undefined,
          timeLabel: booking.inspectionTime || undefined,
          status
        });
      }
    }

    const checkInKey = toDateKey(booking.checkInDate);
    if (checkInKey) {
      events.push({
        id: `${booking.id}-checkin`,
        date: checkInKey,
        type: 'check_in',
        title: guestName ? `${guestName} arriving` : 'Guest check-in',
        propertyTitle,
        guestName: guestName || undefined,
        status
      });
    }

    const checkOutKey = toDateKey(booking.checkOutDate);
    if (checkOutKey) {
      events.push({
        id: `${booking.id}-checkout`,
        date: checkOutKey,
        type: 'check_out',
        title: guestName ? `${guestName} departing` : 'Guest check-out',
        propertyTitle,
        guestName: guestName || undefined,
        status
      });
    }
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
};

const filterEvents = (events: CalendarEvent[], filter: EventFilter) => {
  if (filter === 'all') return events;
  if (filter === 'inspections') return events.filter((event) => event.type === 'inspection');
  return events.filter((event) => event.type === 'check_in' || event.type === 'check_out');
};

const todayKey = format(new Date(), 'yyyy-MM-dd');

const LandlordInspectionsPage = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { inspectionSchedule } = useAppSelector((state) => state.landlordDashboard);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);

  const isLandlord = useMemo(
    () => ['landlord', 'agent'].includes(user?.role ?? ''),
    [user?.role]
  );

  const loadSchedule = useCallback(
    (month: Date) => {
      const rangeStart = format(startOfMonth(month), 'yyyy-MM-dd');
      const rangeEnd = format(endOfMonth(month), 'yyyy-MM-dd');
      const filters = {
        page: 1,
        limit: LIMIT,
        dateFrom: rangeStart,
        dateTo: rangeEnd
      };
      dispatch(setInspectionFilters(filters));
      dispatch(fetchLandlordInspectionSchedule(filters));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!isAuthenticated || !isLandlord) return;
    loadSchedule(currentMonth);
  }, [currentMonth, isAuthenticated, isLandlord, loadSchedule]);

  const bookings = inspectionSchedule.collection.items;
  const events = useMemo(() => buildCalendarEvents(bookings), [bookings]);
  const filteredEvents = useMemo(() => filterEvents(events, eventFilter), [events, eventFilter]);

  useEffect(() => {
    if (filteredEvents.length === 0) {
      setSelectedDate(null);
      return;
    }

    if (!selectedDate) {
      setSelectedDate(filteredEvents[0].date);
      return;
    }

    const hasSelected = filteredEvents.some((event) => event.date === selectedDate);
    if (!hasSelected) {
      const firstFuture = filteredEvents.find((event) => {
        const eventDate = startOfDay(new Date(event.date));
        const targetDate = startOfDay(new Date(selectedDate));
        return isAfter(eventDate, targetDate);
      });
      setSelectedDate((firstFuture ?? filteredEvents[0]).date);
    }
  }, [filteredEvents, selectedDate]);

  const selectedEvents = useMemo(
    () => (selectedDate ? filteredEvents.filter((event) => event.date === selectedDate) : []),
    [filteredEvents, selectedDate]
  );

  const summary = useMemo(() => {
    const inspectionCount = filteredEvents.filter((event) => event.type === 'inspection').length;
    const checkInCount = filteredEvents.filter((event) => event.type === 'check_in').length;
    const checkOutCount = filteredEvents.filter((event) => event.type === 'check_out').length;
    return {
      inspectionCount,
      stayCount: checkInCount,
      departureCount: checkOutCount
    };
  }, [filteredEvents]);

  const isLoading = inspectionSchedule.isLoading;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-slate-800">Sign in required</h1>
            <p className="text-sm text-slate-500">Log in to manage your inspection schedule.</p>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Go to login
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isLandlord) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="max-w-md rounded-2xl bg-white p-10 shadow-lg border border-slate-200">
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">Access restricted</h1>
            <p className="text-sm text-slate-600">
              The inspection calendar is available to landlord and agent accounts. Contact support if you believe you
              should have access.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleMonthChange = (nextDate: Date) => {
    setCurrentMonth(startOfMonth(nextDate));
  };

  const handleFilterChange = (nextFilter: EventFilter) => {
    setEventFilter(nextFilter);
  };

  const handleToday = () => {
    const today = new Date();
    if (!isSameMonth(today, currentMonth)) {
      setCurrentMonth(startOfMonth(today));
    }
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Inspection Calendar</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Visualize upcoming inspections and guest stays across your listings. Filter by event type and drill into
                daily details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange(addMonths(currentMonth, -1))}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition dark:border-slate-700"
              >
                ‹ Prev month
              </button>
              <button
                onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition dark:border-slate-700"
              >
                Next month ›
              </button>
              <button
                onClick={handleToday}
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition"
              >
                Today
              </button>
              <button
                onClick={() => loadSchedule(currentMonth)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition dark:border-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-50 p-2 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Inspections</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{summary.inspectionCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-50 p-2 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Check-ins</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{summary.stayCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-50 p-2 text-amber-500 dark:bg-amber-500/10 dark:text-amber-200">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Check-outs</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{summary.departureCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                  <ListFilter className="h-4 w-4" />
                </div>
                <div className="flex gap-2">
                  {(['all', 'inspections', 'stays'] as EventFilter[]).map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => handleFilterChange(filterOption)}
                      className={clsx(
                        'rounded-full px-3 py-1 text-[11px] font-semibold transition',
                        eventFilter === filterOption
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300'
                      )}
                    >
                      {filterOption === 'all'
                        ? 'All'
                        : filterOption === 'inspections'
                        ? 'Inspections'
                        : 'Stays'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="order-2 lg:order-1">
              {isLoading ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  <Loader variant="spinner" text="Loading inspection schedule..." />
                </div>
              ) : (
                <InspectionCalendar
                  currentMonth={currentMonth}
                  events={filteredEvents}
                  selectedDate={selectedDate}
                  onMonthChange={handleMonthChange}
                  onSelectDate={handleSelectDate}
                />
              )}
            </div>
            <div className="order-1 lg:order-2">
              {isLoading ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  <Loader variant="spinner" />
                </div>
              ) : (
                <InspectionEventList selectedDate={selectedDate} events={selectedEvents} />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LandlordInspectionsPage;

