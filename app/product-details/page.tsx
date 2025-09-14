"use client";
import React, { Suspense } from "react";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CardDetails = dynamic(() => import('@/components/property/CardDetails').then(mod => ({ default: mod.CardDetails })), {
  ssr: false,
  loading: () => <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-center"><Loader /></div>
});

const ProductDetailsPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <MainLayout>
      <div className="relative pt-16">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Go back to previous page"
        >
          <ArrowLeft size={18} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Back</span>
        </button>

        {/* Add top padding to ensure content doesn't overlap with back button */}
        <div className="pt-16">

          <Suspense fallback={
            <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
              <Loader />
            </div>
          }>
            <CardDetails />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
};
export default ProductDetailsPage;
