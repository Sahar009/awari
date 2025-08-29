'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { hydrate } from '../store/slices/authSlice';

export default function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    dispatch(hydrate());
  }, [dispatch]);

  return null; // This component doesn't render anything
}

