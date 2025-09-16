'use client';

import { useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrate, getProfile } from '@/store/slices/authSlice';

interface AuthHydratorProps {
  children: ReactNode;
}

export function AuthHydrator({ children }: AuthHydratorProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    dispatch(hydrate());
  }, [dispatch]);

  useEffect(() => {
    // If authenticated but no user data, fetch profile
    if (isAuthenticated && !user && !isLoading) {
      console.log('🔍 User is authenticated but no user data, fetching profile...');
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated, user, isLoading]);

  return <>{children}</>;
}

export default AuthHydrator;



