"use client";

import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const PropertyListing = dynamic(() => import('@/components/PropertyListing'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

const Rental = () => {
  return (
    <PropertyListing 
      title="Properties for Rent"
      defaultFilters={{ listingType: 'rent' }}
      showSearchFilter={true}
    />
  );
};

export default Rental;
