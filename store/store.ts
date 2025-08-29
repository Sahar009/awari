import { configureStore } from '@reduxjs/toolkit';

// Temporary minimal reducer to test store setup
const tempReducer = (state = { test: 'working' }, action: any) => state;

export const store = configureStore({
  reducer: {
    temp: tempReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Temporarily disable Redux hooks to avoid Provider context issues
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Default export for the store
export default store;
