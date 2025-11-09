import { addDays, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { Calendar, CalendarDays, Clock, Home, Users } from 'lucide-react';
import clsx from 'clsx';

export type CalendarEventType = 'inspection' | 'check_in' | 'check_out';

export interface CalendarEvent {
  id: string;
  date: string; // formatted as yyyy-MM-dd
  type: CalendarEventType;
  title: string;
  propertyTitle?: string;
  guestName?: string;
  timeLabel?: string;
  status?: string;
}

interface InspectionCalendarProps {
  currentMonth: Date;
  events: CalendarEvent[];
  selectedDate: string | null;
  onMonthChange: (next: Date) => void;
  onSelectDate: (date: string) => void;
}

const typeConfig: Record<CalendarEventType, { label: string; dotClass: string; badgeClass: string }> = {
  inspection: {
    label: 'Inspection',
    dotClass: 'bg-indigo-500',
    badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100'
  },
  check_in: {
    label: 'Check-in',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
  },
  check_out: {
    label: 'Check-out',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100'
  }
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

const groupedEvents = (events: CalendarEvent[]) =>
  events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

export const InspectionCalendar = ({
  currentMonth,
  events,
  selectedDate,
  onMonthChange,
  onSelectDate
}: InspectionCalendarProps) => {
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));
  const days: Date[] = [];

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    days.push(date);
  }

  const eventsByDate = groupedEvents(events);

  const handlePrevMonth = () => {
    const prev = addDays(startOfMonth(currentMonth), -1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = addDays(endOfMonth(currentMonth), 1);
    onMonthChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Inspection calendar
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition dark:border-slate-700"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={handleNextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition dark:border-slate-700"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </header>

      <div className="px-4 py-3">
        <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {days.map((day) => {
            const dateKey = formatDateKey(day);
            const dayEvents = eventsByDate[dateKey] ?? [];
            const isSelected = selectedDate ? dateKey === selectedDate : false;
            const inCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(dateKey)}
                className={clsx(
                  'min-h-[96px] rounded-xl border p-2 text-left transition hover:border-primary/60 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-slate-800',
                  isSelected ? 'border-primary/70 shadow-sm dark:border-primary/50' : 'border-slate-200 dark:border-slate-800',
                  !inCurrentMonth && 'bg-slate-50 text-slate-400 dark:bg-slate-900/40 dark:text-slate-500'
                )}
              >
                <div
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                    isSelected ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  {format(day, 'd')}
                </div>

                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const config = typeConfig[event.type];
                    return (
                      <div
                        key={event.id}
                        className={clsx(
                          'flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium',
                          config.badgeClass
                        )}
                      >
                        <span className={clsx('h-1.5 w-1.5 rounded-full', config.dotClass)} />
                        <span className="truncate">{config.label}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className={clsx('h-2 w-2 rounded-full', typeConfig.inspection.dotClass)} />
          Inspection
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={clsx('h-2 w-2 rounded-full', typeConfig.check_in.dotClass)} />
          Check-in
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={clsx('h-2 w-2 rounded-full', typeConfig.check_out.dotClass)} />
          Check-out
        </span>
      </footer>
    </div>
  );
};

interface EventListProps {
  selectedDate: string | null;
  events: CalendarEvent[];
}

export const InspectionEventList = ({ selectedDate, events }: EventListProps) => {
  if (!selectedDate) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        Select a date to see scheduled inspections or stays.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        No scheduled events for {format(new Date(selectedDate), 'MMMM d, yyyy')}.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </span>
        </div>
      </header>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {events.map((event) => {
          const config = typeConfig[event.type];
          return (
            <div key={event.id} className="flex items-start gap-4 px-6 py-4">
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
                {event.type === 'inspection' ? (
                  <CalendarDays className="h-4 w-4" />
                ) : event.type === 'check_in' ? (
                  <Home className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</span>
                  <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-semibold', config.badgeClass)}>
                    {config.label}
                  </span>
                </div>
                {event.propertyTitle && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Home className="h-3.5 w-3.5" />
                    <span>{event.propertyTitle}</span>
                  </div>
                )}
                {event.guestName && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>{event.guestName}</span>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {event.timeLabel && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {event.timeLabel}
                    </span>
                  )}
                  {event.status && (
                    <span className="inline-flex items-center gap-1">
                      Status: <span className="font-medium text-slate-600 dark:text-slate-300">{event.status}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

