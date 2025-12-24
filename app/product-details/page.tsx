"use client";
import React, { Suspense } from "react";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';
import PropertyDetailsSkeleton from "@/components/skeletons/PropertyDetailsSkeleton";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CardDetails = dynamic(() => import('@/components/property/CardDetails').then(mod => ({ default: mod.CardDetails })), {
  ssr: false,
  loading: () => <PropertyDetailsSkeleton />
});

const ProductDetailsPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <MainLayout>
      <div className="relative w-full bg-gradient-to-br from-[#f6fafd] via-[#eaf1fb] to-[#f0e7fa] dark:from-[#18181b] dark:via-[#23232a] dark:to-[#191724] py-8">
        {/* Floating Glassmorphic Back Button */}
        <button
          onClick={handleGoBack}
          className="fixed top-24 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-[#23232a]/80 backdrop-blur-md rounded-full shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-white/90 dark:hover:bg-[#23232a]/90 transition-all ring-1 ring-black/5 hover:scale-105 active:scale-95"
          title="Go back to previous page"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 shadow-md">
            <ArrowLeft size={20} className="text-white" />
          </span>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight">Back</span>
        </button>

        {/* Main Content Container with glass effect */}
        <div className="w-full max-w-7xl mx-auto px-2 md:px-6 lg:px-8 pb-10">
          <div className="rounded-3xl shadow-2xl bg-white/80 dark:bg-[#23232a]/90 backdrop-blur-xl border border-gray-100 dark:border-gray-800 ring-1 ring-black/5 overflow-hidden">
            <Suspense fallback={<PropertyDetailsSkeleton />}>
              <CardDetails />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default ProductDetailsPage;
