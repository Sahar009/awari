"use client";

import dynamic from 'next/dynamic';
import PropertyListingSkeleton from '@/components/skeletons/PropertyListingSkeleton';

const PropertyListing = dynamic(() => import('@/components/PropertyListing'), {
  ssr: false,
  loading: () => <PropertyListingSkeleton />
});

const Hotels = () => {
  return (
    <PropertyListing 
      title="Hotels"
      defaultFilters={{ listingType: 'hotel' }}
      showSearchFilter={true}
    />
  );
};

export default Hotels;






