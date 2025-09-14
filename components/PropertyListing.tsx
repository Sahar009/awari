"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Container from "@/components/Container";
import { SearchFilter } from "@/components/SearchFilter";
import { Card } from "@/components/ui/Card";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties, PropertyFilters, Property } from '@/store/slices/propertySlice';
import { Loader } from './ui/Loader';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PropertyListingProps {
  defaultFilters?: PropertyFilters;
  title?: string;
  showSearchFilter?: boolean;
}

const PropertyListing: React.FC<PropertyListingProps> = ({ 
  defaultFilters = {}, 
  title,
  showSearchFilter = true 
}) => {
  const dispatch = useAppDispatch();
  const { properties, isLoading, error, totalPages, currentPage, hasNextPage, hasPrevPage, total } = useAppSelector(
    (state) => state.property
  );

  // Debug logging
  useEffect(() => {
    console.log('🔍 PropertyListing State Debug:', { 
      propertiesCount: properties.length, 
      isLoading, 
      error, 
      totalPages, 
      currentPage, 
      total,
      hasNextPage,
      hasPrevPage
    });
    
    // Check if we should show the "No properties found" message
    if (!isLoading && properties.length === 0 && !error) {
      console.log('✅ Should show "No properties found" message');
    }
    
    // Check if we should show the loader
    if (isLoading && properties.length === 0 && !error) {
      console.log('⏳ Should show loader');
    }
    
    // Check if we have properties but they're not being displayed
    if (properties.length > 0) {
      console.log('🏠 Properties found in state:', properties);
    }
  }, [properties, isLoading, error, totalPages, currentPage, total, hasNextPage, hasPrevPage]);


  const [currentFilters, setCurrentFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...defaultFilters
  });

  // Temporary debug: Check if we should force show properties
  const [debugProperties, setDebugProperties] = useState<Property[]>([]);
  const [debugLoading, setDebugLoading] = useState(true);
  
  useEffect(() => {
    // If we have properties in Redux state, use them
    if (properties.length > 0) {
      setDebugProperties(properties);
      setDebugLoading(false);
    }
  }, [properties]);

  // Direct API call as fallback if Redux is not working
  useEffect(() => {
    const fetchDirectly = async () => {
      try {
        console.log('🔄 Making direct API call as fallback...');
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentFilters.page?.toString() || '1');
        queryParams.append('limit', currentFilters.limit?.toString() || '12');
        queryParams.append('sortBy', currentFilters.sortBy || 'createdAt');
        queryParams.append('sortOrder', currentFilters.sortOrder || 'desc');
        
        if (currentFilters.listingType) {
          queryParams.append('listingType', currentFilters.listingType);
        }
        
        const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.data.properties) {
          console.log('✅ Direct API call successful:', data.data.properties);
          setDebugProperties(data.data.properties);
          setDebugLoading(false);
        }
      } catch (error) {
        console.error('❌ Direct API call failed:', error);
        setDebugLoading(false);
      }
    };

    // Only make direct call if Redux is not working (no properties after 3 seconds)
    const timer = setTimeout(() => {
      if (properties.length === 0 && isLoading) {
        console.log('⏰ Redux timeout - making direct API call');
        fetchDirectly();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentFilters, properties.length, isLoading]);

  const loadProperties = useCallback(() => {
    console.log('🔄 Dispatching fetchProperties with filters:', currentFilters);
    dispatch(fetchProperties(currentFilters)).then((result) => {
      console.log('📋 fetchProperties result:', result);
      if (result.type.endsWith('/fulfilled')) {
        console.log('✅ fetchProperties fulfilled with payload:', result.payload);
      } else if (result.type.endsWith('/rejected')) {
        console.log('❌ fetchProperties rejected with error:', result.payload);
      }
    });
  }, [dispatch, currentFilters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setCurrentFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, 
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    loadProperties();
  };

  const [showLoader, setShowLoader] = useState(true);
  
  useEffect(() => {
    if (!isLoading && properties.length === 0 && !error) {
      console.log('✅ Setting showLoader to false - no properties found');
      setShowLoader(false);
    }
    
    // If we have properties, definitely stop showing loader
    if (properties.length > 0) {
      console.log('✅ Setting showLoader to false - properties found');
      setShowLoader(false);
    }
  }, [isLoading, properties.length, error]);
  
  // Timeout fallback - if we've been loading for more than 10 seconds, stop showing loader
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('⏰ Loading timeout - forcing loader to stop');
        setShowLoader(false);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if ((showLoader || debugLoading) && properties.length === 0 && debugProperties.length === 0 && !error) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      </Container>
    );
  }

  if (error && properties.length === 0) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="my-15 flex flex-col gap-10">
        {title && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">
              {(properties.length > 0 || debugProperties.length > 0) ? `Showing ${properties.length || debugProperties.length} of ${total} properties` : 'No properties found'}
            </p>
          </div>
        )}

        {showSearchFilter && (
          <SearchFilter />
        )}

        {(properties.length === 0 && debugProperties.length === 0 && !debugLoading) ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn&apos;t find any properties matching your criteria. Try adjusting your filters.
            </p>
            <button
              onClick={() => handleFilterChange({})}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {(properties.length > 0 ? properties : debugProperties).map((property, index) => {
                console.log('🔍 PropertyListing - Property data:', property);
                console.log('🔍 PropertyListing - Property ID:', property.id);
                console.log('🔍 PropertyListing - Property index:', index, 'Property ID:', property.id);
                return (
                  <div key={property.id || index}>
                    <Card
                      ImageSrc={property.media?.[0]?.url || property.images?.[0] || '/assets/images/houseimg (1).jpg'}
                      Title={property.title}
                      description={property.description}
                      price={`₦${parseFloat(property.price).toLocaleString('en-NG')}`}
                      liked={true} 
                      location={`${property.city}, ${property.state}`}
                      type={property.propertyType || property.type || 'apartment'}
                      propertyId={property.id}
                    />
                  </div>
                );
              })}
            </div>

            {/* Loading overlay for pagination */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader />
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage || isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage || isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results summary */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Page {currentPage} of {totalPages} • Total properties: {total}
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default PropertyListing;
