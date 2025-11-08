import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import favoriteReducer from './slices/favoriteSlice';
import bookingReducer from './slices/bookingSlice';
import availabilityReducer from './slices/availabilitySlice';
import notificationReducer from './slices/notificationSlice';
import reviewsReducer from './slices/reviewsSlice';
import kycReducer from './slices/kycSlice';
import messageReducer from './slices/messageSlice';
import userDashboardReducer from './slices/userDashboardSlice';
import landlordDashboardReducer from './slices/landlordDashboardSlice';
import hotelDashboardReducer from './slices/hotelDashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    favorite: favoriteReducer,
    bookings: bookingReducer,
    availability: availabilityReducer,
    notifications: notificationReducer,
    reviews: reviewsReducer,
    kyc: kycReducer,
    messages: messageReducer,
    userDashboard: userDashboardReducer,
    landlordDashboard: landlordDashboardReducer,
    hotelDashboard: hotelDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;