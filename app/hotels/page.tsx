"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const Hotels = dynamic(() => import('@/components/pages/Hotels'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

export default function HotelsPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Book amazing hotels" location="Hotels" />
      <Hotels />
    </MainLayout>
  );
}

