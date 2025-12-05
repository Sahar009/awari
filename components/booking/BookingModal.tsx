"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, CreditCard, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import AvailabilityCalendar from '@/components/ui/AvailabilityCalendar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createBooking } from '@/store/slices/bookingSlice';
import { 
  checkDateRangeAvailability,
  getUnavailableDates,
  selectAvailabilityCheck,
  // selectAvailabilityCheckLoading, // Unused
  // selectAvailabilityCheckError, // Unused
  selectUnavailableDates,
  // selectUnavailableDatesLoading, // Unused
  clearAvailabilityCheck,
  clearUnavailableDates,
  type AvailabilityCheckResponse
} from '@/store/slices/availabilitySlice';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';
import { selectUser, selectIsAuthenticated, getProfile } from '@/store/slices/authSlice';
import { type Property } from '@/store/slices/propertySlice';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

interface BookingFormData {
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  inspectionDate: string;
  inspectionTime: string;
  couponCode: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, property }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  
  // Auth state
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  // Debug authentication state
  console.log('🔐 Auth state in BookingModal:', {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userObject: user
  });
  
  // Availability state
  const availabilityCheck = useAppSelector(selectAvailabilityCheck);
  // const availabilityCheckLoading = useAppSelector(selectAvailabilityCheckLoading); // Unused
  // const availabilityCheckError = useAppSelector(selectAvailabilityCheckError); // Unused
  const unavailableDates = useAppSelector(selectUnavailableDates);
  // const unavailableDatesLoading = useAppSelector(selectUnavailableDatesLoading); // Unused
  
  // Booking state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingType, setBookingType] = useState<'shortlet' | 'hotel' | 'sale_inspection'>('shortlet');
  
  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    checkInDate: '',
    checkOutDate: '',
    numberOfNights: 1,
    numberOfGuests: 1,
    guestName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    specialRequests: '',
    inspectionDate: '',
    inspectionTime: '',
    couponCode: '',
  });

  // Pricing calculation
  const [pricing, setPricing] = useState({
    basePrice: 0,
    serviceFee: 0,
    taxAmount: 0,
    discountAmount: 0,
    couponDiscount: 0,
    totalPrice: 0,
  });

  // Coupon state
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Availability validation state
  const [dateValidationError, setDateValidationError] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dateSelectionMode, setDateSelectionMode] = useState<'checkin' | 'checkout' | null>(null);

  // Check authentication and load user data on open
  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        toast.error('Authentication Required', 'Please log in to make a booking');
        onClose();
        router.push('/auth/login');
        return;
      }
      
      // If authenticated but no user data, fetch profile
      if (isAuthenticated && !user) {
        console.log('🔐 User authenticated but no user data, fetching profile...');
        dispatch(getProfile());
      }
    }
  }, [isOpen, isAuthenticated, user, onClose, router, toast, dispatch]);

  // Clear availability data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearAvailabilityCheck());
      dispatch(clearUnavailableDates());
      setDateValidationError('');
      
      // Load unavailable dates for the next 3 months
      if (property?.id) {
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(today.getMonth() + 3);
        
        dispatch(getUnavailableDates({
          propertyId: property.id,
          startDate: today.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [isOpen, dispatch, property?.id]);

  // Initialize booking type based on property
  // Shortlet and hotel use booking flow, rent and sale use inspection scheduling
  useEffect(() => {
    if (property) {
      const type = property.listingType === 'shortlet' || property.listingType === 'hotel' 
        ? (property.listingType === 'hotel' ? 'hotel' : 'shortlet')
        : 'sale_inspection'; // Both rent and sale use inspection scheduling
      setBookingType(type);
      setPricing(prev => ({
        ...prev,
        basePrice: parseFloat(property.price) || 0,
        serviceFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalPrice: parseFloat(property.price) || 0,
      }));
    }
  }, [property]);

  // Calculate pricing when dates change (for shortlet and hotel)
  useEffect(() => {
    if ((bookingType === 'shortlet' || bookingType === 'hotel') && formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const basePrice = (parseFloat(property.price) || 0) * nights;
        const serviceFee = basePrice * 0.1; // 10% service fee
        const taxAmount = basePrice * 0.05; // 5% tax
        const totalPrice = basePrice + serviceFee + taxAmount;

        setFormData(prev => ({ ...prev, numberOfNights: nights }));
        setPricing(prev => ({
          basePrice,
          serviceFee,
          taxAmount,
          discountAmount: 0,
          couponDiscount: prev.couponDiscount,
          totalPrice: totalPrice - prev.couponDiscount,
        }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, property.price, bookingType]);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check availability when check-out date changes
    if (field === 'checkOutDate' && formData.checkInDate && value) {
      checkAvailability(formData.checkInDate, value as string);
    }
  };

  const handleCalendarDateSelect = (date: string) => {
    if (dateSelectionMode === 'checkin') {
      setFormData(prev => ({ ...prev, checkInDate: date }));
      setDateSelectionMode('checkout');
      setDateValidationError('');
    } else if (dateSelectionMode === 'checkout') {
      if (formData.checkInDate && date <= formData.checkInDate) {
        setDateValidationError('Check-out date must be after check-in date');
        return;
      }
      setFormData(prev => ({ ...prev, checkOutDate: date }));
      setDateSelectionMode(null);
      
      // Check availability when both dates are selected
      if (formData.checkInDate) {
        checkAvailability(formData.checkInDate, date);
      }
    } else {
      // Start with check-in date selection
      setFormData(prev => ({ ...prev, checkInDate: date }));
      setDateSelectionMode('checkout');
      setDateValidationError('');
    }
  };

  const checkAvailability = async (checkInDate: string, checkOutDate: string) => {
    if (!property?.id || !checkInDate || !checkOutDate) return;

    setIsCheckingAvailability(true);
    setDateValidationError('');

    try {
      await dispatch(checkDateRangeAvailability({
        propertyId: property.id,
        checkInDate,
        checkOutDate
      })).unwrap();

      // Check the result
      if (availabilityCheck && !availabilityCheck.isAvailable) {
        setDateValidationError(`Selected dates are not available. Conflicting dates: ${availabilityCheck.conflicts.map(c => c.date).join(', ')}`);
      }
    } catch (error: unknown) {
      console.error('Availability check failed:', error);
      setDateValidationError('Failed to check availability. Please try again.');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleCouponApply = async () => {
    if (!formData.couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Simulate API call for coupon validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock coupon validation logic
      const validCoupons = {
        'SAVE10': { discount: 0.1, type: 'percentage' },
        'FLAT50': { discount: 50, type: 'fixed' },
        'WELCOME20': { discount: 0.2, type: 'percentage' },
        'STUDENT15': { discount: 0.15, type: 'percentage' },
      };

      const coupon = validCoupons[formData.couponCode.toUpperCase() as keyof typeof validCoupons];
      
      if (coupon) {
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
          discountAmount = pricing.basePrice * coupon.discount;
        } else {
          discountAmount = Math.min(coupon.discount, pricing.basePrice * 0.5); // Max 50% discount
        }

        setPricing(prev => ({
          ...prev,
          couponDiscount: discountAmount,
          totalPrice: prev.basePrice + prev.serviceFee + prev.taxAmount - discountAmount,
        }));

        setCouponApplied(true);
        toast.success('Coupon Applied!', `You saved ₦${discountAmount.toLocaleString()}`);
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCouponRemove = () => {
    setPricing(prev => ({
      ...prev,
      couponDiscount: 0,
      totalPrice: prev.basePrice + prev.serviceFee + prev.taxAmount,
    }));
    setCouponApplied(false);
    setFormData(prev => ({ ...prev, couponCode: '' }));
    setCouponError('');
  };

  const handleNextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getTotalSteps = () => {
    switch (bookingType) {
      case 'shortlet':
      case 'hotel':
        return 4; // Date Selection → Guest Info → Payment → Confirmation
      case 'sale_inspection':
        return 2; // Viewing Request → Confirmation
      default:
        return 4;
    }
  };

  const handleBookingSubmit = async () => {
    console.log('🎯 handleBookingSubmit called!', {
      bookingType,
      currentStep,
      isLastStep: currentStep === getTotalSteps(),
      property: property?.id,
      user: user?.id,
      isAuthenticated,
      formData
    });
    
    if (!property) {
      console.error('❌ Missing property:', property);
      toast.error('Error', 'Property information is missing.');
      return;
    }
    
    if (!isAuthenticated) {
      console.error('❌ User not authenticated');
      toast.error('Authentication Required', 'Please log in to make a booking.');
      router.push('/auth/login');
      return;
    }
    
    if (!user) {
      console.error('❌ User data missing, attempting to fetch...');
      try {
        await dispatch(getProfile()).unwrap();
        // User data should now be available, but let's check again
        if (!user) {
          toast.error('Authentication Error', 'Unable to load user data. Please log in again.');
          router.push('/auth/login');
          return;
        }
      } catch (error) {
        console.error('❌ Failed to fetch user profile:', error);
        toast.error('Authentication Error', 'Unable to load user data. Please log in again.');
        router.push('/auth/login');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // For shortlet and hotel bookings, validate availability one more time before submission
      if ((bookingType === 'shortlet' || bookingType === 'hotel') && formData.checkInDate && formData.checkOutDate) {
        const availabilityResult = await dispatch(checkDateRangeAvailability({
          propertyId: property.id,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate
        })).unwrap() as AvailabilityCheckResponse;

        if (availabilityResult && !availabilityResult.isAvailable) {
          toast.error('Booking Failed', 'The selected dates are no longer available. Please choose different dates.');
          setIsLoading(false);
          return;
        }
      }

      const bookingData = {
        propertyId: property.id,
        bookingType,
        ...((bookingType === 'shortlet' || bookingType === 'hotel') && {
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfNights: formData.numberOfNights,
          numberOfGuests: formData.numberOfGuests,
        }),
        ...(bookingType === 'sale_inspection' && {
          inspectionDate: formData.inspectionDate,
          inspectionTime: formData.inspectionTime,
        }),
        basePrice: pricing.basePrice,
        totalPrice: pricing.totalPrice,
        currency: 'NGN',
        serviceFee: pricing.serviceFee,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.couponDiscount,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        specialRequests: formData.specialRequests,
      };

      console.log('🚀 About to create booking with data:', bookingData);
      console.log('🎯 Booking type:', bookingType);
      console.log('🏠 Property ID:', property.id);
      console.log('👤 User ID:', user.id);
      console.log('🔐 Auth token present:', !!localStorage.getItem('token'));
      console.log('📡 API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const result = await dispatch(createBooking(bookingData)).unwrap();
      console.log('✅ Booking created successfully:', result);
      
      toast.success('Booking Created!', 
        (bookingType === 'shortlet' || bookingType === 'hotel') ? 'Your booking has been confirmed!' :
        'Your inspection request has been submitted!'
      );
      
      onClose();
      setCurrentStep(1);
      
    } catch (error: unknown) {
      console.error('Booking error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create booking';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message;
      }
      
      console.error('Detailed booking error:', {
        error,
        errorMessage,
        bookingType,
        propertyId: property?.id,
        formData
      });
      
      toast.error('Booking Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (bookingType) {
      case 'shortlet':
      case 'hotel':
        return renderShortletSteps();
      case 'sale_inspection':
        return renderSaleInspectionSteps();
      default:
        return null;
    }
  };

  const renderShortletSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select Your Dates</h3>
              <p className="text-gray-600">Choose your check-in and check-out dates</p>
            </div>

            {/* Date Selection Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Select Your Dates</span>
              </div>
              <p className="text-sm text-blue-700">
                {!dateSelectionMode && !formData.checkInDate && "Click on your desired check-in date to start"}
                {dateSelectionMode === 'checkout' && formData.checkInDate && `Now select your check-out date (after ${formData.checkInDate})`}
                {formData.checkInDate && formData.checkOutDate && "Dates selected! Review your selection below."}
              </p>
            </div>

            {/* Custom Calendar */}
            <AvailabilityCalendar
              unavailableDates={unavailableDates?.unavailableDates || []}
              unavailableDateDetails={unavailableDates?.unavailableDateDetails || []}
              selectedStartDate={formData.checkInDate}
              selectedEndDate={formData.checkOutDate}
              onDateSelect={handleCalendarDateSelect}
              className="mb-4"
            />

            {/* Selected Dates Summary */}
            {(formData.checkInDate || formData.checkOutDate) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Selected Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Check-in Date
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.checkInDate}
                        onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, checkInDate: '', checkOutDate: '' }));
                          setDateSelectionMode(null);
                          setDateValidationError('');
                        }}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Check-out Date
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.checkOutDate}
                        onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                      {isCheckingAvailability && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date Validation Error */}
            {dateValidationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 text-sm font-medium">Date Not Available</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{dateValidationError}</p>
              </div>
            )}

            {/* Unavailable Dates Display */}
            {unavailableDates && unavailableDates.unavailableDates.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 text-sm font-medium">Unavailable Dates</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  The following dates are currently unavailable: {unavailableDates.unavailableDates.slice(0, 5).join(', ')}
                  {unavailableDates.unavailableDates.length > 5 && ` and ${unavailableDates.unavailableDates.length - 5} more...`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <select
                  value={formData.numberOfGuests}
                  onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Nights
                </label>
                <input
                  type="number"
                  value={formData.numberOfNights}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                />
              </div>
            </div>

            {pricing.totalPrice > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Pricing Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>₦{property.price} × {formData.numberOfNights} nights</span>
                    <span>₦{pricing.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>₦{pricing.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₦{pricing.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₦{pricing.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Guest Information</h3>
              <p className="text-gray-600">Please provide your contact details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requests or notes for the host..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment</h3>
              <p className="text-gray-600">Complete your payment to confirm booking</p>
            </div>

            {/* Coupon Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-blue-800">Apply Coupon Code</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={couponApplied}
                />
                {couponApplied ? (
                  <button
                    onClick={handleCouponRemove}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleCouponApply}
                    disabled={couponLoading || !formData.couponCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-green-600 text-sm mt-2">
                  ✅ Coupon applied! You saved ₦{pricing.couponDiscount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium mb-4">Payment Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>₦{pricing.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>₦{pricing.serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₦{pricing.taxAmount.toLocaleString()}</span>
                </div>
                {pricing.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₦{pricing.couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span>₦{pricing.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Payment Information</span>
              </div>
              <p className="text-sm text-blue-700">
                Payment will be processed securely. You&apos;ll receive a confirmation email once payment is completed.
              </p>
            </div>

            {/* Available Coupons Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium mb-2 text-gray-700">Available Coupon Codes:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SAVE10</span>
                  <span className="text-green-600 font-medium">10% off</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WELCOME20</span>
                  <span className="text-green-600 font-medium">20% off</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">STUDENT15</span>
                  <span className="text-green-600 font-medium">15% off</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FLAT50</span>
                  <span className="text-green-600 font-medium">₦50 off</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Pay with Card
              </button>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                Pay with Bank Transfer
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900">Booking Confirmed!</h3>
            <p className="text-gray-600">
              Your shortlet booking has been confirmed. You&apos;ll receive a confirmation email shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium mb-2">Booking Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Property:</span> {property.title}</p>
                <p><span className="font-medium">Check-in:</span> {new Date(formData.checkInDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Check-out:</span> {new Date(formData.checkOutDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Guests:</span> {formData.numberOfGuests}</p>
                <p><span className="font-medium">Total:</span> ₦{pricing.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderRentalSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Rental Application</h3>
              <p className="text-gray-600">Submit your rental application</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Details *
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell the owner about yourself, your rental history, employment, and why you'd like to rent this property..."
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Application Process</span>
              </div>
              <p className="text-sm text-blue-700">
                Your application will be reviewed by the property owner. You&apos;ll be notified once they make a decision.
                Payment will only be required after your application is approved.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment Required</h3>
              <p className="text-gray-600">Your application has been approved! Complete payment to secure the rental.</p>
            </div>

            {/* Coupon Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-blue-800">Apply Coupon Code</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={couponApplied}
                />
                {couponApplied ? (
                  <button
                    onClick={handleCouponRemove}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleCouponApply}
                    disabled={couponLoading || !formData.couponCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-green-600 text-sm mt-2">
                  ✅ Coupon applied! You saved ₦{pricing.couponDiscount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium mb-4">Payment Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Monthly Rent</span>
                  <span>₦{pricing.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit</span>
                  <span>₦{(pricing.totalPrice * 0.5).toLocaleString()}</span>
                </div>
                {pricing.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₦{pricing.couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span>₦{((pricing.totalPrice * 1.5) - pricing.couponDiscount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Pay with Card
              </button>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                Pay with Bank Transfer
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900">Application Submitted!</h3>
            <p className="text-gray-600">
              Your rental application has been submitted successfully. The owner will review and respond soon.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium mb-2">Application Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Property:</span> {property.title}</p>
                <p><span className="font-medium">Monthly Rent:</span> ₦{pricing.totalPrice.toLocaleString()}</p>
                <p><span className="font-medium">Status:</span> Pending Owner Review</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSaleInspectionSteps = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Schedule Property Viewing</h3>
              <p className="text-gray-600">Request a property inspection appointment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <select
                  value={formData.inspectionTime}
                  onChange={(e) => handleInputChange('inspectionTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific areas you'd like to focus on during the inspection..."
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Free Inspection</span>
              </div>
              <p className="text-sm text-green-700">
                Property inspections are completely free. The owner will confirm your appointment and provide viewing instructions.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900">Inspection Requested!</h3>
            <p className="text-gray-600">
              Your property inspection request has been submitted. The owner will confirm your appointment.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium mb-2">Request Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Property:</span> {property.title}</p>
                <p><span className="font-medium">Date:</span> {new Date(formData.inspectionDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {formData.inspectionTime}</p>
                <p><span className="font-medium">Status:</span> Pending Owner Confirmation</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Check authentication before showing modal
  if (!isAuthenticated) {
    console.warn('🚫 User not authenticated, closing modal');
    onClose();
    router.push('/auth/login');
    return null;
  }

  // If authenticated but user data is still loading, show loading state
  if (isAuthenticated && !user) {
    return (
      <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading user data...</span>
          </div>
        </div>
      </div>
    );
  }

  const isLastStep = currentStep === getTotalSteps();
  const canProceed = () => {
    switch (bookingType) {
      case 'shortlet':
        return currentStep === 1 ? (formData.checkInDate && formData.checkOutDate && !dateValidationError && !isCheckingAvailability) :
               currentStep === 2 ? (formData.guestName && formData.guestEmail && formData.guestPhone) :
               true;
      case 'hotel':
        return currentStep === 1 ? (formData.checkInDate && formData.checkOutDate && !dateValidationError && !isCheckingAvailability) :
               currentStep === 2 ? (formData.guestName && formData.guestEmail && formData.guestPhone) :
               true;
      case 'sale_inspection':
        return currentStep === 1 ? (formData.inspectionDate && formData.inspectionTime && formData.guestName && formData.guestEmail && formData.guestPhone) :
               true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Book {property?.title}
            </h2>
            <p className="text-sm text-gray-600 capitalize">
              {bookingType.replace('_', ' ')} • Step {currentStep} of {getTotalSteps()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center">
            {Array.from({ length: getTotalSteps() }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {i + 1}
                </div>
                {i < getTotalSteps() - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log('🖱️ Button clicked!', {
                  isLastStep,
                  currentStep,
                  totalSteps: getTotalSteps(),
                  canProceed: canProceed(),
                  isLoading,
                  bookingType
                });
                if (isLastStep) {
                  handleBookingSubmit();
                } else {
                  handleNextStep();
                }
              }}
              disabled={!canProceed() || isLoading}
              className={`px-6 py-2 rounded-lg transition-colors ${
                canProceed() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Processing...' : isLastStep ? 'Complete Booking' : 'Next'}
            </button>
            
            {isLastStep && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
