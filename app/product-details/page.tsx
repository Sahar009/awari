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
      <div className="min-h-screen bg-gray-50">
        {/* Simple Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<PropertyDetailsSkeleton />}>
            <CardDetails />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
};
export default ProductDetailsPage;
