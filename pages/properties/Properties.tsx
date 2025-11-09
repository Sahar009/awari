"use client";

import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const PropertyListing = dynamic(() => import('@/components/PropertyListing'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

const Properties = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="relative p-4">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        title="Go back to previous page"
      >
        <ArrowLeft size={18} className="text-gray-700" />
        <span className="text-sm font-medium text-gray-700">Back</span>
      </button>

      <PropertyListing 
        title="All Properties"
        showSearchFilter={true}
      />
    </div>
  );
};

export default Properties;