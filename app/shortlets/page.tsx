"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const Shortlets = dynamic(() => import('@/components/pages/Shortlets'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

export default function ShortletsPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Booking amazing stays" location="Shortlets" />
       <Shortlets/>
    </MainLayout>
  );
}
