import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Temporary minimal reducer to test store setup
const tempReducer = (state = { test: 'working' }, action: any) => state;

export const store = configureStore({
  reducer: {
    temp: tempReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the hooks with the correct types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Default export for the store
export default store;
