"use client";

import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const PropertyListing = dynamic(() => import('@/components/PropertyListing'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

const Properties = () => {
  return (
    <PropertyListing 
      title="All Properties"
      showSearchFilter={true}
    />
  );
};

export default Properties;