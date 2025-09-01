'use client';

import { useEffect, ReactNode } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { hydrate } from '@/store/slices/authSlice';

interface AuthHydratorProps {
  children: ReactNode;
}

export function AuthHydrator({ children }: AuthHydratorProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    dispatch(hydrate());
  }, [dispatch]);

  return <>{children}</>;
}

export default AuthHydrator;



