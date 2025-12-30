"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { SearchIcon, ChevronLeft, ChevronRight, MapPin, Users, User, UserPlus, UserCheck, Hotel, Home, Key, ShoppingBag } from "lucide-react";
import { PropertyFilters } from "@/store/slices/propertySlice";
import { locationApiService, type AddressSuggestion } from "@/services/locationApi";

export interface Option {
  label: string;
  value: string;
}

export interface SearchCriteria {
  query: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
}

interface SearchFilterProps {
  onFilterChange?: (filters: PropertyFilters) => void;
  defaultFilters?: PropertyFilters;
  locations?: Option[];
  propertyTypes?: Option[];
  onSearch?: (criteria: SearchCriteria) => void;
}

export const SearchFilter = ({ 
  onFilterChange, 
  defaultFilters = {},
  onSearch
}: SearchFilterProps) => {
  const useOldAPI = !!onSearch;
  
  // State
  const [activeSection, setActiveSection] = useState<'where' | 'when' | 'who' | 'type' | null>(null);
  const [location, setLocation] = useState<string>(defaultFilters.city || "");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(false);
  const [checkInDate, setCheckInDate] = useState<string>(defaultFilters.checkInDate || "");
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultFilters.checkOutDate || "");
  const [duration, setDuration] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(defaultFilters.numberOfGuests || 1);
  const [listingType, setListingType] = useState<string>(defaultFilters.listingType || "");
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dateFlexibility, setDateFlexibility] = useState<string>("exact");
  
  // Refs for click outside detection
  const whereRef = useRef<HTMLDivElement>(null);
  const whenRef = useRef<HTMLDivElement>(null);
  const whoRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Fetch location suggestions when typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (locationQuery.length < 2) {
        setLocationSuggestions([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
        // Default to Lagos State for suggestions
        const suggestions = await locationApiService.getAddressSuggestions(
          locationQuery, 
          'Lagos',  // city
          'Lagos'   // state
        );
        setLocationSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to fetch location suggestions:', error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [locationQuery]);

  // Calculate check-out date based on duration - only when duration is manually changed
  useEffect(() => {
    if (checkInDate && checkOutDate && duration && durationUnit) {
      // Only recalculate if both dates are already set and user changes duration
      const startDate = new Date(checkInDate);
      let daysToAdd = duration;
      
      if (durationUnit === 'weeks') {
        daysToAdd = duration * 7;
      } else if (durationUnit === 'months') {
        daysToAdd = duration * 30;
      }
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + daysToAdd);
      
      const endDateStr = endDate.toISOString().split('T')[0];
      setCheckOutDate(endDateStr);
    }
  }, [duration, durationUnit]);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (activeSection === 'where' && whereRef.current && !whereRef.current.contains(target)) {
        setActiveSection(null);
      } else if (activeSection === 'when' && whenRef.current && !whenRef.current.contains(target)) {
        setActiveSection(null);
      } else if (activeSection === 'who' && whoRef.current && !whoRef.current.contains(target)) {
        setActiveSection(null);
      } else if (activeSection === 'type' && typeRef.current && !typeRef.current.contains(target)) {
        setActiveSection(null);
      }
    };

    if (activeSection) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeSection]);

  // Build filters
  const filters = useMemo((): PropertyFilters => {
    const filterObj: PropertyFilters = {};
    
    if (location) filterObj.city = location;
    if (checkInDate) filterObj.checkInDate = checkInDate;
    if (checkOutDate) filterObj.checkOutDate = checkOutDate;
    if (numberOfGuests > 0) filterObj.numberOfGuests = numberOfGuests;
    if (listingType) filterObj.listingType = listingType;
    
    return filterObj;
  }, [location, checkInDate, checkOutDate, numberOfGuests, listingType]);

  // Update filters when they change
  useEffect(() => {
    if (!useOldAPI && onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange, useOldAPI]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === checkInDate || dateStr === checkOutDate;
  };

  const isDateInRange = (date: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    const dateStr = date.toISOString().split('T')[0];
    return dateStr >= checkInDate && dateStr <= checkOutDate;
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date)) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    if (!checkInDate || (checkInDate && checkOutDate)) {
      // First date selection or resetting range
      setCheckInDate(dateStr);
      setCheckOutDate("");
      // Keep modal open for second date selection
    } else if (checkInDate && dateStr > checkInDate) {
      // Second date selected - complete the range
      setCheckOutDate(dateStr);
      // Auto-close modal after range is complete
      // setTimeout(() => {
      //   setActiveSection(null);
      // }, 700);
    } else if (dateStr < checkInDate) {
      // User selected earlier date - reset range
      setCheckInDate(dateStr);
      setCheckOutDate("");
      // Keep modal open for second date selection
    }
  };

  const handleSearch = () => {
    if (useOldAPI && onSearch) {
      onSearch({
        query: "",
        location: location || undefined,
        checkInDate: checkInDate || undefined,
        checkOutDate: checkOutDate || undefined,
        numberOfGuests: numberOfGuests || undefined,
        propertyType: listingType || undefined,
      });
    }
    setActiveSection(null);
  };

  const renderCalendar = (date: Date) => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(date);
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isPast = isDatePast(currentDate);
      const isSelected = isDateSelected(currentDate);
      const inRange = isDateInRange(currentDate);
      const isCheckIn = dateStr === checkInDate;
      const isCheckOut = dateStr === checkOutDate;
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(currentDate)}
          disabled={isPast}
          className={`
            h-8 w-8 md:h-10 md:w-10 rounded-full text-xs md:text-sm font-medium transition-colors
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
            ${isSelected ? 'bg-black text-white hover:bg-black' : ''}
            ${inRange && !isSelected ? 'bg-gray-100' : ''}
            ${isCheckIn ? 'rounded-l-full' : ''}
            ${isCheckOut ? 'rounded-r-full' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const month1 = currentMonth;
  const month2 = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const guestText = numberOfGuests === 0 ? "Add guests" : `${numberOfGuests} guest${numberOfGuests > 1 ? 's' : ''}`;

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  // Get icon for guest count
  const getGuestIcon = (count: number) => {
    if (count === 1) return User;
    if (count === 2) return Users;
    if (count <= 4) return UserPlus;
    return UserCheck;
  };

  // Listing type options with icons
  const listingTypeOptions = [
    { value: 'hotel', label: 'Hotel', icon: Hotel, color: 'text-orange-500' },
    { value: 'shortlet', label: 'Short Let', icon: Home, color: 'text-purple-500' },
    { value: 'rent', label: 'For Rent', icon: Key, color: 'text-blue-500' },
    { value: 'sale', label: 'For Sale', icon: ShoppingBag, color: 'text-green-500' },
  ];

  const getListingTypeLabel = (type: string) => {
    return listingTypeOptions.find(opt => opt.value === type)?.label || 'Property type';
  };

  return (
    <div className="w-full relative z-50">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-2xl md:rounded-full shadow-lg border border-gray-200 overflow-visible relative">
        {/* Where Section */}
        <div 
          ref={whereRef}
          className="relative flex-1 px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors border-b md:border-b-0 md:border-r border-gray-200"
        >
          <div className="text-xs font-semibold text-gray-900 mb-1">Where</div>
          <input
            type="text"
            placeholder="Search destinations"
            value={locationQuery || location}
            onChange={(e) => {
              const value = e.target.value;
              setLocationQuery(value);
              if (value.length >= 2) {
                setActiveSection('where');
              }
              if (!value) {
                setLocation("");
              }
            }}
            onFocus={() => {
              if (locationQuery.length >= 2 || locationSuggestions.length > 0) {
                setActiveSection('where');
              }
            }}
            className="w-full outline-none text-sm md:text-base text-gray-600 bg-transparent placeholder-gray-400"
          />
          
          {/* Where Dropdown - Auto suggest on typing */}
          {activeSection === 'where' && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] p-3 md:p-4 max-h-80 md:max-h-96 overflow-y-auto"
            >
              {isLoadingLocations ? (
                <div className="text-center py-4 text-gray-500">Loading suggestions...</div>
              ) : locationSuggestions.length > 0 ? (
                <>
                  <div className="font-semibold text-gray-900 mb-3">Search results</div>
                  <div className="space-y-1">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          setLocation(suggestion.city || suggestion.fullAddress);
                          setLocationQuery("");
                          setLocationSuggestions([]);
                          setActiveSection(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
                      >
                        <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{suggestion.city || suggestion.fullAddress}</div>
                          <div className="text-sm text-gray-500">{suggestion.state ? `${suggestion.state}, Nigeria` : suggestion.fullAddress}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : locationQuery.length >= 2 ? (
                <div className="text-center py-4 text-gray-500">No locations found</div>
              ) : (
                <>
                  <div className="font-semibold text-gray-900 mb-3">Suggested destinations</div>
                  <div className="space-y-1">
                    {[
                      { city: "Lagos", state: "Lagos State", desc: "For its vibrant city life" },
                      { city: "Abuja", state: "FCT", desc: "For business and leisure" },
                      { city: "Lekki", state: "Lagos State", desc: "For its seaside allure" },
                      { city: "Ikeja", state: "Lagos State", desc: "Near you" },
                      { city: "Port Harcourt", state: "Rivers State", desc: "For oil and gas hub" },
                    ].map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLocation(dest.city);
                          setLocationQuery("");
                          setActiveSection(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
                      >
                        <MapPin className={`h-5 w-5 shrink-0 ${idx === 0 ? 'text-blue-500' : idx === 1 ? 'text-orange-500' : idx === 2 ? 'text-pink-500' : idx === 3 ? 'text-purple-500' : 'text-teal-500'}`} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{dest.city}, {dest.state}</div>
                          <div className="text-sm text-gray-500">{dest.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* When Section */}
        <div 
          ref={whenRef}
          className="relative flex-1 px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b md:border-b-0 md:border-r border-gray-200"
          onClick={() => setActiveSection(activeSection === 'when' ? null : 'when')}
        >
          <div className="text-xs font-semibold text-gray-900 mb-1">When</div>
          <div className="text-sm md:text-base text-gray-600">
            {checkInDate && checkOutDate 
              ? `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
              : checkInDate 
              ? formatDate(checkInDate)
              : "Add dates"}
          </div>
          
          {/* When Calendar Popup - Shows on click */}
          {activeSection === 'when' && (
            <div 
              className="absolute top-full left-0 right-0 md:right-auto mt-2 bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-200 z-[100] p-4 md:p-6 w-full md:w-[680px] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-4 md:mb-6">
                {/* Month 1 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevMonth();
                      }} 
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-400" />
                    </button>
                    <div className="font-semibold text-gray-900">
                      {month1.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="w-9"></div>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="h-6 md:h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                    {renderCalendar(month1)}
                  </div>
                </div>

                {/* Month 2 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="w-9 hidden md:block"></div>
                    <div className="font-semibold text-sm md:text-base text-gray-900 text-center flex-1 md:flex-none">
                      {month2.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextMonth();
                      }} 
                      className="hidden md:block p-2 hover:bg-gray-100 rounded-full touch-manipulation"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="w-9 md:hidden"></div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar(month2)}
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-900 mb-3">Duration of stay</div>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value as 'days' | 'weeks' | 'months')}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                  {checkInDate && checkOutDate && (
                    <div className="text-sm text-gray-600">
                      ({Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights)
                    </div>
                  )}
                </div>
              </div>

              {/* Date Flexibility Options */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {['exact', '± 1 day', '± 2 days', '± 3 days', '± 7 days', '± 14 days'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateFlexibility(option);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateFlexibility === option
                        ? 'border-2 border-gray-900 text-gray-900'
                        : 'border border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {option === 'exact' ? 'Exact dates' : option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Who Section - Dropdown on click */}
        <div 
          ref={whoRef}
          className="relative flex-1 px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b md:border-b-0 md:border-r border-gray-200"
          onClick={() => setActiveSection(activeSection === 'who' ? null : 'who')}
        >
          <div className="text-xs font-semibold text-gray-900 mb-1">Who</div>
          <div className="text-sm md:text-base text-gray-600">{guestText}</div>
          
          {/* Who Guest Selection Dropdown - Shows on click */}
          {activeSection === 'who' && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] py-2 max-h-80 overflow-y-auto"
            >
              {guestOptions.map((guestCount) => {
                const isSelected = numberOfGuests === guestCount;
                const IconComponent = getGuestIcon(guestCount);
                return (
                  <button
                    key={guestCount}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNumberOfGuests(guestCount);
                      setActiveSection(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
                      isSelected ? 'bg-primary/10' : ''
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />
                    <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-primary">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Type Section - Property Type Dropdown */}
        <div 
          ref={typeRef}
          className="relative flex-1 px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b md:border-b-0 md:border-r border-gray-200"
          onClick={() => setActiveSection(activeSection === 'type' ? null : 'type')}
        >
          <div className="text-xs font-semibold text-gray-900 mb-1">Type</div>
          <div className="text-sm md:text-base text-gray-600">
            {listingType ? getListingTypeLabel(listingType) : 'Property type'}
          </div>
          
          {/* Type Selection Dropdown - Shows on click */}
          {activeSection === 'type' && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] py-2"
            >
              {listingTypeOptions.map((option) => {
                const isSelected = listingType === option.value;
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setListingType(isSelected ? '' : option.value);
                      setActiveSection(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
                      isSelected ? 'bg-primary/10' : ''
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${isSelected ? option.color : 'text-gray-600'}`} />
                    <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-primary">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
              {listingType && (
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setListingType('');
                      setActiveSection(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-left text-sm text-gray-600"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Button - Using Primary Color */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-primary text-white font-semibold rounded-xl md:rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl mt-2 md:mt-0 w-full md:w-auto"
        >
          <SearchIcon className="h-5 w-5" />
          <span className="text-sm md:text-base">Search</span>
        </button>
      </div>
    </div>
  );
};
