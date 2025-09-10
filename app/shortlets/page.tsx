"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';

const Shortlets = dynamic(() => import('@/components/pages/Shortlets'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

export default function ShortletsPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Booking amazing stays" location="Shortlets" />
       <Shortlets/>
    </MainLayout>
  );
}
