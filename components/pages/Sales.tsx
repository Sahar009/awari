"use client";

import dynamic from 'next/dynamic';

const PropertyListing = dynamic(() => import('@/components/PropertyListing'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
});

const Sales = () => {
  return (
    <PropertyListing 
      title="Properties for Sale"
      defaultFilters={{ listingType: 'sale' }}
      showSearchFilter={true}
    />
  );
};

export default Sales;
