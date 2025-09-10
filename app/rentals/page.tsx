"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';

const Rental = dynamic(() => import('@/components/pages/Rental'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

export default function RentalPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Find your perfect home" location="Rentals" />
      <Rental />
    </MainLayout>
  );
}
