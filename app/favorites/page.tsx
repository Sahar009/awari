"use client";

import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/Loader';
import MainLayout from '../mainLayout';

const FavoritesPage = dynamic(() => import('@/components/favorites/FavoritesPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader />
    </div>
  )
});

export default function Favorites() {
  return (
    <MainLayout>
      <FavoritesPage />
    </MainLayout>
  );
}
