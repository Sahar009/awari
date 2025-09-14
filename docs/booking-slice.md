# Booking Slice Documentation

## Overview

The `bookingSlice` is a Redux Toolkit slice that manages all booking-related state and API interactions for the property booking system. It provides comprehensive functionality for creating, managing, and tracking property bookings including shortlets, rentals, and sale inspections.

## Features

- ✅ **Complete CRUD Operations** - Create, read, update, and delete bookings
- ✅ **Booking Status Management** - Handle pending, confirmed, completed, cancelled, rejected, and expired states
- ✅ **Owner Actions** - Confirm, reject, and complete bookings (owner-specific)
- ✅ **Guest Actions** - Cancel bookings (guest-specific)
- ✅ **Advanced Filtering** - Filter by status, type, payment status, dates, etc.
- ✅ **Pagination Support** - Handle large lists of bookings efficiently
- ✅ **Statistics Tracking** - Revenue, success rates, and booking metrics
- ✅ **Property-specific Bookings** - View bookings for specific properties
- ✅ **Real-time State Updates** - Optimistic updates and error handling
- ✅ **TypeScript Support** - Full type safety and IntelliSense

## API Endpoints Covered

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | Get user's bookings with filters |
| GET | `/api/bookings/statistics` | Get booking statistics |
| GET | `/api/bookings/:bookingId` | Get booking by ID |
| PUT | `/api/bookings/:bookingId` | Update booking details |
| POST | `/api/bookings/:bookingId/cancel` | Cancel a booking |
| POST | `/api/bookings/:bookingId/confirm` | Confirm booking (owner) |
| POST | `/api/bookings/:bookingId/reject` | Reject booking (owner) |
| POST | `/api/bookings/:bookingId/complete` | Complete booking (owner) |
| GET | `/api/bookings/properties/:propertyId/bookings` | Get property bookings |

## Types and Interfaces

### Booking Interface

```typescript
interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  ownerId: string;
  bookingType: 'shortlet' | 'rental' | 'sale_inspection';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired';
  checkInDate?: string;
  checkOutDate?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  numberOfNights?: number;
  numberOfGuests?: number;
  basePrice: number;
  totalPrice: number;
  currency: string;
  serviceFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  ownerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  property?: Property;
  user?: User;
}
```

### Booking Filters

```typescript
interface BookingFilters {
  page?: number;
  limit?: number;
  status?: string;
  bookingType?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  propertyId?: string;
}
```

### Booking Statistics

```typescript
interface BookingStatistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  totalRevenue: number;
  successRate: number;
}
```

## Async Thunks (Actions)

### 1. Create Booking

```typescript
dispatch(createBooking({
  propertyId: 'uuid',
  bookingType: 'shortlet',
  checkInDate: '2024-01-15',
  checkOutDate: '2024-01-20',
  numberOfNights: 5,
  numberOfGuests: 2,
  basePrice: 50000,
  totalPrice: 55000,
  currency: 'NGN',
  guestName: 'John Doe',
  guestEmail: 'john@example.com',
  guestPhone: '+2341234567890',
  specialRequests: 'Late checkout requested'
}));
```

### 2. Fetch User Bookings

```typescript
dispatch(fetchUserBookings({
  page: 1,
  limit: 10,
  status: 'confirmed',
  bookingType: 'shortlet',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
}));
```

### 3. Fetch Booking by ID

```typescript
dispatch(fetchBookingById('booking-uuid'));
```

### 4. Update Booking

```typescript
dispatch(updateBooking({
  bookingId: 'booking-uuid',
  updateData: {
    status: 'confirmed',
    ownerNotes: 'Welcome! Keys available at reception.',
    paymentStatus: 'completed'
  }
}));
```

### 5. Cancel Booking

```typescript
dispatch(cancelBooking({
  bookingId: 'booking-uuid',
  cancelData: {
    cancellationReason: 'Change of plans'
  }
}));
```

### 6. Owner Actions

```typescript
// Confirm booking
dispatch(confirmBooking({
  bookingId: 'booking-uuid',
  ownerNotes: 'Confirmed, looking forward to hosting!'
}));

// Reject booking
dispatch(rejectBooking({
  bookingId: 'booking-uuid',
  ownerNotes: 'Property not available for those dates'
}));

// Complete booking
dispatch(completeBooking({
  bookingId: 'booking-uuid',
  ownerNotes: 'Guest checked out successfully'
}));
```

### 7. Fetch Property Bookings

```typescript
dispatch(fetchPropertyBookings({
  propertyId: 'property-uuid',
  filters: {
    page: 1,
    limit: 10,
    status: 'confirmed'
  }
}));
```

### 8. Fetch Statistics

```typescript
dispatch(fetchBookingStatistics({ type: 'user' })); // or 'owner'
```

## State Management

### State Structure

```typescript
interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  statistics: BookingStatistics | null;
  filters: BookingFilters;
  pagination: BookingPagination | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  lastFetch: number | null;
}
```

### Reducers

#### Synchronous Actions

```typescript
import {
  clearBookings,
  clearCurrentBooking,
  setFilters,
  clearFilters,
  clearError,
  setCurrentBooking
} from '@/store/slices/bookingSlice';

// Clear all bookings
dispatch(clearBookings());

// Clear current booking
dispatch(clearCurrentBooking());

// Set filters
dispatch(setFilters({
  status: 'confirmed',
  bookingType: 'shortlet'
}));

// Clear filters
dispatch(clearFilters());

// Clear error
dispatch(clearError());

// Set current booking
dispatch(setCurrentBooking(bookingObject));
```

## Selectors

### Basic Selectors

```typescript
import {
  selectBookings,
  selectCurrentBooking,
  selectBookingStatistics,
  selectBookingFilters,
  selectBookingPagination,
  selectBookingLoading,
  selectBookingCreating,
  selectBookingUpdating,
  selectBookingError,
  selectBookingLastFetch
} from '@/store/slices/bookingSlice';

const bookings = useAppSelector(selectBookings);
const currentBooking = useAppSelector(selectCurrentBooking);
const statistics = useAppSelector(selectBookingStatistics);
const isLoading = useAppSelector(selectBookingLoading);
const error = useAppSelector(selectBookingError);
```

### Utility Selectors

```typescript
import {
  selectBookingsByStatus,
  selectBookingsByType,
  selectBookingsByProperty,
  selectBookingById,
  selectPendingBookings,
  selectConfirmedBookings,
  selectCompletedBookings,
  selectTotalRevenue,
  selectUpcomingBookings,
  selectOverdueBookings
} from '@/store/slices/bookingSlice';

// Get bookings by status
const pendingBookings = useAppSelector(selectPendingBookings);
const confirmedBookings = useAppSelector(selectConfirmedBookings);
const completedBookings = useAppSelector(selectCompletedBookings);

// Get bookings by type
const shortletBookings = useAppSelector(selectBookingsByType('shortlet'));

// Get bookings by property
const propertyBookings = useAppSelector(selectBookingsByProperty('property-uuid'));

// Get specific booking
const booking = useAppSelector(selectBookingById('booking-uuid'));

// Get revenue
const totalRevenue = useAppSelector(selectTotalRevenue);

// Get upcoming bookings
const upcomingBookings = useAppSelector(selectUpcomingBookings);

// Get overdue bookings
const overdueBookings = useAppSelector(selectOverdueBookings);
```

## Usage Examples

### Basic Component Usage

```typescript
"use client";

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUserBookings,
  selectBookings,
  selectBookingLoading,
  selectBookingError
} from '@/store/slices/bookingSlice';

const BookingsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const isLoading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id}>
          <h3>Booking #{booking.id.slice(0, 8)}</h3>
          <p>Status: {booking.status}</p>
          <p>Type: {booking.bookingType}</p>
          <p>Total: ₦{booking.totalPrice.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Booking Management Component

```typescript
const BookingManager: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const isLoading = useAppSelector(selectBookingLoading);

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await dispatch(confirmBooking({ 
        bookingId, 
        ownerNotes: 'Welcome to our property!' 
      })).unwrap();
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await dispatch(cancelBooking({ 
        bookingId, 
        cancelData: { cancellationReason: 'Property unavailable' } 
      })).unwrap();
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  useEffect(() => {
    dispatch(fetchPropertyBookings({ propertyId }));
  }, [dispatch, propertyId]);

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id} className="booking-card">
          <h3>Booking #{booking.id.slice(0, 8)}</h3>
          <p>Status: {booking.status}</p>
          
          {booking.status === 'pending' && (
            <div>
              <button onClick={() => handleConfirmBooking(booking.id)}>
                Confirm
              </button>
              <button onClick={() => handleCancelBooking(booking.id)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Statistics Dashboard

```typescript
const BookingDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const statistics = useAppSelector(selectBookingStatistics);
  const totalRevenue = useAppSelector(selectTotalRevenue);

  useEffect(() => {
    dispatch(fetchBookingStatistics({ type: 'user' }));
  }, [dispatch]);

  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Total Bookings</h3>
        <p>{statistics?.total || 0}</p>
      </div>
      
      <div className="stat-card">
        <h3>Pending Bookings</h3>
        <p>{statistics?.pending || 0}</p>
      </div>
      
      <div className="stat-card">
        <h3>Total Revenue</h3>
        <p>₦{totalRevenue.toLocaleString()}</p>
      </div>
      
      <div className="stat-card">
        <h3>Success Rate</h3>
        <p>{statistics?.successRate || 0}%</p>
      </div>
    </div>
  );
};
```

## Error Handling

The slice provides comprehensive error handling:

```typescript
const BookingComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectBookingError);

  const handleCreateBooking = async () => {
    try {
      await dispatch(createBooking(bookingData)).unwrap();
      toast.success('Booking created successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      toast.error('Error', errorMessage);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}
      {/* Rest of component */}
    </div>
  );
};
```

## Best Practices

### 1. Use Proper Error Handling

Always wrap async thunk calls in try-catch blocks:

```typescript
try {
  await dispatch(createBooking(data)).unwrap();
  // Handle success
} catch (error) {
  // Handle error
}
```

### 2. Optimize Re-renders

Use specific selectors to avoid unnecessary re-renders:

```typescript
// Good - specific selector
const pendingBookings = useAppSelector(selectPendingBookings);

// Avoid - selecting entire state
const { bookings } = useAppSelector(state => state.bookings);
const pendingBookings = bookings.filter(b => b.status === 'pending');
```

### 3. Handle Loading States

Always check loading states before showing data:

```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
// Show data
```

### 4. Use Filters Effectively

Set filters before fetching data:

```typescript
useEffect(() => {
  dispatch(setFilters({ status: 'confirmed' }));
  dispatch(fetchUserBookings({ status: 'confirmed' }));
}, []);
```

### 5. Clear State When Needed

Clear state when navigating away or resetting:

```typescript
useEffect(() => {
  return () => {
    dispatch(clearBookings());
    dispatch(clearError());
  };
}, []);
```

## Integration with Store

The booking slice is automatically integrated into the Redux store:

```typescript
// store/store.ts
import bookingReducer from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    favorite: favoriteReducer,
    bookings: bookingReducer, // ✅ Added
  },
});
```

## Testing

The slice can be tested using Redux Toolkit's testing utilities:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer, { createBooking } from './bookingSlice';

const store = configureStore({
  reducer: { bookings: bookingReducer }
});

// Test async thunk
test('createBooking should handle success', async () => {
  const bookingData = {
    propertyId: 'test-id',
    bookingType: 'shortlet',
    basePrice: 100,
    totalPrice: 120
  };

  await store.dispatch(createBooking(bookingData));
  
  const state = store.getState();
  expect(state.bookings.bookings).toHaveLength(1);
  expect(state.bookings.bookings[0].propertyId).toBe('test-id');
});
```

This comprehensive booking slice provides all the functionality needed to manage property bookings effectively in your application!
