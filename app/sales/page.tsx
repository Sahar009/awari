"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';

const Sales = dynamic(() => import('@/components/pages/Sales'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

export default function SalesPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Buy your dream Property" location="Sales" />
      <Sales />
    </MainLayout>
  );
}
