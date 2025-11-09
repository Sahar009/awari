"use client";

import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const PropertyListing = dynamic(() => import('@/components/PropertyListing'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

const Shortlets = () => {
  return (
    <PropertyListing 
      title="Short-term Rentals"
      defaultFilters={{ listingType: 'shortlet' }}
      showSearchFilter={true}
    />
  );
};

export default Shortlets;
