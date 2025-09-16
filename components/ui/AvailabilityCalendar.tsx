import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UnavailableDateInfo {
  date: string;
  reason: 'booking' | 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable';
  notes?: string;
}

interface AvailabilityCalendarProps {
  unavailableDates: string[];
  unavailableDateDetails?: UnavailableDateInfo[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  unavailableDates,
  unavailableDateDetails = [],
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  minDate = new Date().toISOString().split('T')[0],
  maxDate,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Get unavailable date details
  const getUnavailableDateInfo = (dateStr: string): UnavailableDateInfo | null => {
    return unavailableDateDetails.find(detail => detail.date === dateStr) || null;
  };

  // Get human-readable reason
  const getReasonText = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      'booking': 'Booked',
      'maintenance': 'Under Maintenance',
      'owner_blocked': 'Blocked by Owner',
      'admin_blocked': 'Blocked by Admin',
      'unavailable': 'Unavailable'
    };
    return reasonMap[reason] || 'Unavailable';
  };
  
  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const unavailableInfo = getUnavailableDateInfo(dateStr);
      days.push({
        day,
        dateStr,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isUnavailable: unavailableDates.includes(dateStr),
        unavailableInfo,
        isSelected: dateStr === selectedStartDate || dateStr === selectedEndDate,
        isInRange: selectedStartDate && selectedEndDate && 
                  dateStr >= selectedStartDate && dateStr <= selectedEndDate,
        isMinDate: dateStr === minDate,
        isMaxDate: maxDate ? dateStr === maxDate : false
      });
    }
    
    return days;
  };

  const handleDateClick = (dateStr: string) => {
    if (!dateStr) return;
    
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow selection of past dates
    if (date < today) return;
    
    // Don't allow selection of unavailable dates
    if (unavailableDates.includes(dateStr)) return;
    
    onDateSelect(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isDateDisabled = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date < today || unavailableDates.includes(dateStr);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-10" />;
          }

          const isDisabled = isDateDisabled(day.dateStr);
          
          return (
            <div key={day.dateStr} className="relative group">
              <button
                onClick={() => handleDateClick(day.dateStr)}
                disabled={isDisabled}
                onMouseEnter={() => setHoveredDate(day.dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`
                  h-10 w-10 rounded-lg text-sm font-medium transition-colors relative
                  ${isDisabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : day.isUnavailable
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300'
                      : day.isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : day.isInRange
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : day.isToday
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                            : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
                title={day.isUnavailable ? 'Unavailable' : day.isToday ? 'Today' : ''}
              >
                {day.day}
                {day.isUnavailable && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>

              {/* Hover Tooltip for Unavailable Dates */}
              {hoveredDate === day.dateStr && day.isUnavailable && day.unavailableInfo && (
                <div className="absolute z-10 w-48 p-2 mt-1 text-xs text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 left-1/2">
                  <div className="font-medium mb-1">
                    {getReasonText(day.unavailableInfo.reason)}
                  </div>
                  {day.unavailableInfo.notes && (
                    <div className="text-gray-300">
                      {day.unavailableInfo.notes}
                    </div>
                  )}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                    <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-xs mb-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded relative">
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">
            Hover over unavailable dates to see why they&apos;re blocked
          </span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
