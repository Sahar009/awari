"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const Rental = dynamic(() => import('@/components/pages/Rental'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

export default function RentalPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Find your perfect home" location="Rentals" />
      <Rental />
    </MainLayout>
  );
}
