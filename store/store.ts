import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import favoriteReducer from './slices/favoriteSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    favorite: favoriteReducer,
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