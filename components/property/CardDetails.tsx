"use client";
import { Rating } from "@/components/ui/Rating";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPropertyById, type Property } from "@/store/slices/propertySlice";
import { Loader } from "@/components/ui/Loader";
import { MapPin, Heart, Loader2 } from "lucide-react";
import { 
  toggleFavorite,
  checkFavoriteStatus,
  selectIsPropertyFavorited
} from '@/store/slices/favoriteSlice';
import { useToast } from '@/components/ui/useToast';
import BookingModal from '@/components/booking/BookingModal';

export type Listing = {
  id: string;
  title: string;
  location: string;
  rating: number; 
  reviewsCount: number; 
  pricePerNight: number; 
  images: string[]; // urls
  host: {
    name: string;
    image?: string;
    isSuperhost?: boolean;
  };
  description: string;
};


export const CardDetails = () => {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('id');
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { currentProperty, isLoading, error } = useAppSelector((state) => state.property);
  
  // Fallback state for direct API call
  const [fallbackProperty, setFallbackProperty] = useState(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  
  // Favorite functionality
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const isFavorited = useAppSelector(selectIsPropertyFavorited(propertyId || ''));
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Debug logging
  console.log('🔍 CardDetails - URL search params:', searchParams?.toString());
  console.log('🔍 CardDetails - Property ID:', propertyId);
  console.log('🔍 CardDetails - Redux state:', { currentProperty, isLoading, error });

  useEffect(() => {
    console.log('🔍 CardDetails - useEffect triggered with propertyId:', propertyId);
    if (propertyId) {
      console.log('🚀 CardDetails - Dispatching fetchPropertyById with ID:', propertyId);
      dispatch(fetchPropertyById({ id: propertyId, incrementView: true }));
      
      // Check favorite status
      dispatch(checkFavoriteStatus(propertyId));
      
      // Fallback direct API call
      setFallbackLoading(true);
      fetch(`https://awari-backend.onrender.com/api/properties/${propertyId}?incrementView=true`)
        .then(res => res.json())
        .then(data => {
          console.log('🔍 CardDetails - Fallback API response:', data);
          setFallbackProperty(data.data);
          setFallbackLoading(false);
        })
        .catch(err => {
          console.error('🔍 CardDetails - Fallback API error:', err);
          setFallbackLoading(false);
        });
    } else {
      console.log('❌ CardDetails - No property ID found in URL');
    }
  }, [propertyId, dispatch]);

  const handleToggleFavorite = async () => {
    if (!propertyId || isFavoriteLoading) return;
    
    setIsFavoriteLoading(true);
    
    try {
      const result = await dispatch(toggleFavorite({ propertyId })).unwrap();
      
      if (result.action === 'added') {
        toast.success('Success', result.apiMessage || 'Property has been added to your favorites.');
      } else if (result.action === 'removed') {
        toast.success('Success', result.apiMessage || 'Property has been removed from your favorites.');
      }
    } catch (error: unknown) {
      console.error('CardDetails favorite error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update favorites.';
      toast.error('Error', errorMessage);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  if (isLoading || fallbackLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Property</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const property = currentProperty || fallbackProperty;
  
  if (!isLoading && !fallbackLoading && !property) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mt-20 mb-2">Property Not Found</h1>
        <div className="flex justify-center items-center">
        <Image src="/assets/images/exist.png" alt="Property Not Found" width={150} height={150} />
          </div>
                <p className="text-gray-600">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Property ID: {propertyId}</p>
          <p>Redux Loading: {isLoading ? 'true' : 'false'}</p>
          <p>Fallback Loading: {fallbackLoading ? 'true' : 'false'}</p>
          <p>Error: {error || 'none'}</p>
          <p>Current Property: {currentProperty ? 'exists' : 'null'}</p>
          <p>Fallback Property: {fallbackProperty ? 'exists' : 'null'}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return null; 
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{property.address}, {property.city}, {property.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Rating rating={4.8} />
                <span className="text-sm text-gray-700">4.8 · 24 reviews</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {property.status}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                  {property.listingType}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                ₦{parseFloat(property.price).toLocaleString('en-NG')}
              </div>
              <div className="text-sm text-gray-600">
                {property.listingType === 'rent' ? 'per month' : 'total price'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
          <div className="relative col-span-2 row-span-2 h-64 md:h-96">
            <Image
              src={property.media?.[0]?.url || '/assets/images/houseimg (1).jpg'}
              alt="Main property image"
              fill
              className="object-cover hover:scale-102 transition-transform duration-200"
            />
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {property.media?.length || 0} photos
            </div>
          </div>
          {property.media?.slice(1, 5).map((media, i) => (
            <div key={i} className="relative h-32 md:h-48 group cursor-pointer">
              <Image 
                src={media.url} 
                alt={`Property image ${i + 2}`} 
                fill 
                className="object-cover group-hover:scale-102 transition-transform duration-200" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Owner */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Property Owner</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {property.owner?.firstName?.[0] || 'O'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{property.owner?.firstName} {property.owner?.lastName}</h3>
                <p className="text-gray-600">{property.owner?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Rating rating={4.9} />
                  <span className="text-sm text-gray-500">4.9 · Super Host</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Property Specifications */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Property Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {property.bedrooms && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
              )}
              {property.toilets && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.toilets}</div>
                  <div className="text-sm text-gray-600">Toilets</div>
                </div>
              )}
              {property.parkingSpaces && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.parkingSpaces}</div>
                  <div className="text-sm text-gray-600">Parking Spaces</div>
                </div>
              )}
              {property.floorArea && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.floorArea}</div>
                  <div className="text-sm text-gray-600">Floor Area (sq ft)</div>
                </div>
              )}
              {property.yearBuilt && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.yearBuilt}</div>
                  <div className="text-sm text-gray-600">Year Built</div>
                </div>
              )}
            </div>
          </div>

          {/* Property Features */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Property Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Property Type</span>
                  <span className="font-medium capitalize">{property.propertyType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Condition</span>
                  <span className="font-medium capitalize">{property.conditionStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Floor Number</span>
                  <span className="font-medium">{property.floorNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Furnished</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${property.furnished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.furnished ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Pet Friendly</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${property.petFriendly ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.petFriendly ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Smoking Allowed</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${property.smokingAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.smokingAllowed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Negotiable</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${property.negotiable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.negotiable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Featured</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${property.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {property.featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-gray-500" />
                <span className="text-gray-700">{property.address}, {property.city}, {property.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Country:</span>
                <span className="font-medium">{property.country}</span>
              </div>
              {property.postalCode && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Postal Code:</span>
                  <span className="font-medium">{property.postalCode}</span>
                </div>
              )}
              {property.neighborhood && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Neighborhood:</span>
                  <span className="font-medium">{property.neighborhood}</span>
                </div>
              )}
              {property.landmark && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Landmark:</span>
                  <span className="font-medium">{property.landmark}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  ₦{parseFloat(property.price).toLocaleString('en-NG')}
                </div>
                <div className="text-sm text-gray-600">
                  {property.listingType === 'rent' ? 'per month' : 'total price'}
                </div>
                {property.originalPrice && (
                  <div className="text-sm text-gray-500 line-through mt-1">
                    ₦{parseFloat(property.originalPrice).toLocaleString('en-NG')}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Dynamic booking button based on property type */}
                {property.listingType === 'shortlet' && (
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Book Now
                  </button>
                )}
                
                {property.listingType === 'rent' && (
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Apply for Rental
                  </button>
                )}
                
                {property.listingType === 'sale' && (
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Schedule Inspection
                  </button>
                )}
                
                <button 
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading || !propertyId}
                  className={`
                    w-full font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${isFavorited 
                      ? 'bg-red-500 text-white hover:bg-red-600 border border-red-500' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-500'
                    }
                    ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {isFavoriteLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Heart 
                      className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
                    />
                  )}
                  {isFavorited ? 'Remove from Favorites' : 'Save to Favorites'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {property.negotiable ? 'Price is negotiable' : 'Fixed price'}
                </p>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="font-semibold mb-4">Property Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{property.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-medium">{property.favoriteCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Contacts</span>
                  <span className="font-medium">{property.contactCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Details (if applicable) */}
            {property.listingType === 'rent' && (
              <div className="bg-white rounded-xl p-6 shadow-lg border">
                <h3 className="font-semibold mb-4">Rental Details</h3>
                <div className="space-y-3">
                  {property.minLeasePeriod && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Min Lease</span>
                      <span className="font-medium">{property.minLeasePeriod}</span>
                    </div>
                  )}
                  {property.maxLeasePeriod && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max Lease</span>
                      <span className="font-medium">{property.maxLeasePeriod}</span>
                    </div>
                  )}
                  {property.availableFrom && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available From</span>
                      <span className="font-medium">
                        {new Date(property.availableFrom).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {property.availableUntil && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available Until</span>
                      <span className="font-medium">
                        {new Date(property.availableUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shortlet Details (if applicable) */}
            {property.listingType === 'shortlet' && (
              <div className="bg-white rounded-xl p-6 shadow-lg border">
                <h3 className="font-semibold mb-4">Shortlet Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Min Stay</span>
                    <span className="font-medium">{property.minStayNights} nights</span>
                  </div>
                  {property.maxStayNights && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max Stay</span>
                      <span className="font-medium">{property.maxStayNights} nights</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Instant Booking</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${property.instantBooking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {property.instantBooking ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cancellation</span>
                    <span className="font-medium capitalize">{property.cancellationPolicy}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {property.owner?.firstName?.[0] || 'O'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{property.owner?.firstName} {property.owner?.lastName}</p>
                    <p className="text-sm text-gray-600">{property.owner?.email}</p>
                  </div>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        property={property as Property}
      />
    </div>
  );
};

export default CardDetails;
