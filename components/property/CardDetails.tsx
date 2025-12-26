"use client";
import { Rating } from "@/components/ui/Rating";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPropertyById, type Property } from "@/store/slices/propertySlice";
import PropertyDetailsSkeleton from "@/components/skeletons/PropertyDetailsSkeleton";
import { MapPin, Heart, Loader2 } from "lucide-react";
import { 
  toggleFavorite,
  checkFavoriteStatus,
  selectIsPropertyFavorited
} from '@/store/slices/favoriteSlice';
import { useToast } from '@/components/ui/useToast';
import BookingModal from '@/components/booking/BookingModal';
import { 
  getReviews,
  getPropertyRatingSummary,
  selectReviews,
  selectPropertySummary,
  selectReviewsLoading,
  selectSummaryLoading,
  type Review
} from '@/store/slices/reviewsSlice';
import { Star, ThumbsUp, Flag, MessageCircle, CheckCircle2, Building2, Users, Clock, Bed, Bath, Car, Home, Calendar, Maximize2, User2, FileText, Sparkles, Shield, PawPrint, Cigarette, DollarSign, Award } from 'lucide-react';

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
  const router = useRouter();
  const propertyId = searchParams?.get('id');
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { currentProperty, isLoading, error } = useAppSelector((state) => state.property);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Fallback state for direct API call
  const [fallbackProperty, setFallbackProperty] = useState(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  
  // Favorite functionality
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const isFavorited = useAppSelector(selectIsPropertyFavorited(propertyId || ''));
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Reviews state
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  
  // Refs to prevent duplicate API calls
  const reviewsApiCalled = useRef(false);
  const summaryApiCalled = useRef(false);
  const favoriteApiCalled = useRef(false);
  
  // Track which property we've loaded data for
  const loadedPropertyId = useRef<string | null>(null);
  
  // Reviews selectors
  const reviews = useAppSelector(selectReviews);
  const propertySummary = useAppSelector(selectPropertySummary);
  const reviewsLoading = useAppSelector(selectReviewsLoading);
  const summaryLoading = useAppSelector(selectSummaryLoading);

  // Debug logging
  console.log('🔍 CardDetails - URL search params:', searchParams?.toString());
  console.log('🔍 CardDetails - Property ID:', propertyId);
  console.log('🔍 CardDetails - Redux state:', { currentProperty, isLoading, error });
  console.log('🔍 CardDetails - Reviews state:', { reviewsLoaded, summaryLoaded, reviewsLoading, summaryLoading });
  console.log('🔍 CardDetails - API call refs:', { 
    reviewsApiCalled: reviewsApiCalled.current, 
    summaryApiCalled: summaryApiCalled.current,
    favoriteApiCalled: favoriteApiCalled.current,
    loadedPropertyId: loadedPropertyId.current
  });


  // Single effect to load all data for a property
  useEffect(() => {
    if (!propertyId) return;
    
    // Check if we've already loaded data for this property
    if (loadedPropertyId.current === propertyId && currentProperty) {
      console.log('🔍 CardDetails - Data already loaded for property:', propertyId);
      return;
    }
    
    console.log('🔍 CardDetails - Loading data for new property:', propertyId);
    
    // Mark this property as being loaded
    loadedPropertyId.current = propertyId;
    
    // Reset states for new property
    setReviewsLoaded(false);
    setSummaryLoaded(false);
    reviewsApiCalled.current = false;
    summaryApiCalled.current = false;
    favoriteApiCalled.current = false;
    setFallbackProperty(null);
    setFallbackLoading(false);
    
    // Load property data
    console.log('🚀 CardDetails - Loading property data for:', propertyId);
    dispatch(fetchPropertyById({ id: propertyId, incrementView: true }))
      .unwrap()
      .catch((error) => {
        // If Redux call fails, use fallback
        console.log('⚠️ CardDetails - Redux call failed, using fallback API:', error);
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
      });
    
    // Check favorite status
    console.log('🚀 CardDetails - Checking favorite status for:', propertyId);
    dispatch(checkFavoriteStatus(propertyId));
    
    // Load reviews data
    console.log('🚀 CardDetails - Loading reviews for:', propertyId);
    dispatch(getReviews({ 
      propertyId: propertyId,
      status: 'approved',
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }));
    
    // Load rating summary
    console.log('🚀 CardDetails - Loading rating summary for:', propertyId);
    dispatch(getPropertyRatingSummary(propertyId));
  }, [propertyId, dispatch]); // Include dispatch in dependencies

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('🔍 CardDetails - Component unmounting, cleaning up...');
      setReviewsLoaded(false);
      setSummaryLoaded(false);
      setFallbackProperty(null);
      setFallbackLoading(false);
      reviewsApiCalled.current = false;
      summaryApiCalled.current = false;
      favoriteApiCalled.current = false;
      loadedPropertyId.current = null;
    };
  }, []);

  const handleToggleFavorite = useCallback(async () => {
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
  }, [propertyId, isFavoriteLoading, dispatch, toast]);

  // Function to refresh reviews data
  const refreshReviewsData = useCallback(() => {
    if (propertyId) {
      setReviewsLoaded(false);
      setSummaryLoaded(false);
      reviewsApiCalled.current = false;
      summaryApiCalled.current = false;
      loadedPropertyId.current = null; // Reset to allow reloading
      dispatch(getReviews({ 
        propertyId: propertyId,
        status: 'approved',
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      }));
      dispatch(getPropertyRatingSummary(propertyId));
    }
  }, [propertyId, dispatch]);

  // Helper functions
  const renderStars = useCallback((rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const getDisplayRating = useCallback(() => {
    if (propertySummary) {
      return propertySummary.averageRating;
    }
    return 4.8; // fallback rating
  }, [propertySummary]);

  const getDisplayReviewsCount = useCallback(() => {
    if (propertySummary) {
      return propertySummary.totalReviews;
    }
    return 24; // fallback count
  }, [propertySummary]);

  const property = currentProperty || fallbackProperty;
  
  // Debug: Log property data when it's available
  useEffect(() => {
    if (property) {
      console.log('🔍 [CARD DETAILS] Property loaded:', {
        id: property.id,
        title: property.title,
        ownerId: property.ownerId,
        hasOwner: !!property.owner,
        owner: property.owner,
        ownerKeys: property.owner ? Object.keys(property.owner) : null,
        allPropertyKeys: Object.keys(property),
      });
    }
  }, [property]);
  
  // Show skeleton loader only if we don't have property data yet AND we're still loading
  if (!property && (isLoading || fallbackLoading)) {
    return <PropertyDetailsSkeleton />;
  }

  // Show error only if we have an error AND no property data
  if (error && !property) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Property</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  
  if (!property) {
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
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-blue-600" />
                <span>{property.address}, {property.city}, {property.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(Math.floor(getDisplayRating()), 'sm')}
                  <span className="text-sm font-semibold text-gray-900">
                    {getDisplayRating().toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  ({getDisplayReviewsCount()} reviews)
                </span>
                {summaryLoading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold uppercase border border-emerald-200">
                {property.status}
              </span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold capitalize border border-blue-200">
                {property.listingType}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="text-right bg-gradient-to-br from-primary/5 to-primary/10 px-6 py-4 rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary">
                ₦{parseFloat(property.price).toLocaleString('en-NG')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {property.listingType === 'rent' ? 'per month' : 'total price'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-xl overflow-hidden shadow-sm">
          <div className="relative col-span-2 row-span-2 h-64 md:h-96 bg-gray-100">
            <Image
              src={property.media?.[0]?.url || '/assets/images/houseimg (1).jpg'}
              alt="Main property image"
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {property.media?.length || 0} photos
            </div>
          </div>
          {property.media?.slice(1, 5).map((media, i) => (
            <div key={i} className="relative h-32 md:h-48 bg-gray-100 cursor-pointer overflow-hidden rounded-lg">
              <Image 
                src={media.url} 
                alt={`Property image ${i + 2}`} 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-300" 
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
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <User2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Property Owner</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-xl">
                  {property.owner?.firstName?.[0] || 'O'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{property.owner?.firstName} {property.owner?.lastName}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Verified Owner</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Property Specifications */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Property Specifications</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.bedrooms && (
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                  <Bed className="w-7 h-7 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600 mt-1">Bedrooms</div>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center p-4 bg-cyan-50 rounded-xl border border-cyan-100 hover:border-cyan-300 transition-colors">
                  <Bath className="w-7 h-7 text-cyan-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600 mt-1">Bathrooms</div>
                </div>
              )}
              {property.toilets && (
                <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-100 hover:border-teal-300 transition-colors">
                  <Bath className="w-7 h-7 text-teal-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.toilets}</div>
                  <div className="text-sm text-gray-600 mt-1">Toilets</div>
                </div>
              )}
              {property.parkingSpaces && (
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
                  <Car className="w-7 h-7 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.parkingSpaces}</div>
                  <div className="text-sm text-gray-600 mt-1">Parking Spaces</div>
                </div>
              )}
              {property.floorArea && (
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 transition-colors">
                  <Maximize2 className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.floorArea}</div>
                  <div className="text-sm text-gray-600 mt-1">Floor Area (sq ft)</div>
                </div>
              )}
              {property.yearBuilt && (
                <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-100 hover:border-pink-300 transition-colors">
                  <Calendar className="w-7 h-7 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{property.yearBuilt}</div>
                  <div className="text-sm text-gray-600 mt-1">Year Built</div>
                </div>
              )}
            </div>
          </div>

          {/* Property Features */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Property Features</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Property Type
                  </span>
                  <span className="font-semibold text-gray-900 capitalize">{property.propertyType}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Condition
                  </span>
                  <span className="font-semibold text-gray-900 capitalize">{property.conditionStatus}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    Floor Number
                  </span>
                  <span className="font-semibold text-gray-900">{property.floorNumber}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-purple-600" />
                    Furnished
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${property.furnished ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-700'}`}>
                    {property.furnished ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-amber-600" />
                    Pet Friendly
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${property.petFriendly ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-700'}`}>
                    {property.petFriendly ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Cigarette className="w-4 h-4 text-gray-500" />
                    Smoking Allowed
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${property.smokingAllowed ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-700'}`}>
                    {property.smokingAllowed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Negotiable
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${property.negotiable ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-700'}`}>
                    {property.negotiable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Featured
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${property.featured ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-200 text-gray-700'}`}>
                    {property.featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Details Section (for hotels only) */}
          {property.listingType === 'hotel' && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Hotel Details</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.numberOfRooms && (
                  <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-colors">
                    <Building2 className="w-7 h-7 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.numberOfRooms}</div>
                    <div className="text-sm text-gray-600">Rooms</div>
                  </div>
                )}
                {property.maxGuestsPerRoom && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                    <Users className="w-7 h-7 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.maxGuestsPerRoom}</div>
                    <div className="text-sm text-gray-600">Max Guests/Room</div>
                  </div>
                )}
                {property.starRating && (
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-300 transition-colors">
                    <Star className="w-7 h-7 text-amber-600 mx-auto mb-2 fill-current" />
                    <div className="text-2xl font-bold text-gray-900">{property.starRating}</div>
                    <div className="text-sm text-gray-600">Star Rating</div>
                  </div>
                )}
                {property.checkInTime && (
                  <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                    <Clock className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{property.checkInTime}</div>
                    <div className="text-sm text-gray-600">Check-in</div>
                  </div>
                )}
                {property.checkOutTime && (
                  <div className="text-center p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-300 transition-colors">
                    <Clock className="w-7 h-7 text-rose-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{property.checkOutTime}</div>
                    <div className="text-sm text-gray-600">Check-out</div>
                  </div>
                )}
              </div>
              {property.roomTypes && Array.isArray(property.roomTypes) && property.roomTypes.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Room Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.roomTypes.map((type: string, index: number) => (
                      <span key={index} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium capitalize">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amenities & Features */}
          {(property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0) || 
           (property.listingType === 'hotel' && property.hotelAmenities && Array.isArray(property.hotelAmenities) && property.hotelAmenities.length > 0) ? (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Amenities & Features</h2>
              </div>
              
              {/* Regular Amenities */}
              {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Property Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.amenities.map((amenity: string, index: number) => {
                      // Convert amenity value to readable label
                      const amenityLabel = amenity
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          <span className="text-gray-700">{amenityLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hotel Amenities (for hotels only) */}
              {property.listingType === 'hotel' && property.hotelAmenities && Array.isArray(property.hotelAmenities) && property.hotelAmenities.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-purple-900 mb-3">Hotel Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.hotelAmenities.map((amenity: string, index: number) => {
                      // Convert amenity value to readable label
                      const amenityLabel = amenity
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                          <span className="text-purple-900">{amenityLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

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

          {/* Reviews Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
              {reviews.length > 0 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showAllReviews ? 'Show Less' : 'View All Reviews'}
                </button>
              )}
            </div>

            {/* Overall Rating Summary */}
            {propertySummary && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {propertySummary.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex justify-center mt-1">
                      {renderStars(Math.floor(propertySummary.averageRating || 0), 'sm')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {propertySummary.totalReviews || 0} reviews
                    </div>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      {propertySummary.categoryRatings?.cleanliness && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Cleanliness</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(Math.floor(propertySummary.categoryRatings.cleanliness), 'sm')}</div>
                            <span className="font-medium">{propertySummary.categoryRatings.cleanliness.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                      {propertySummary.categoryRatings?.communication && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Communication</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(Math.floor(propertySummary.categoryRatings.communication), 'sm')}</div>
                            <span className="font-medium">{propertySummary.categoryRatings.communication.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                      {propertySummary.categoryRatings?.location && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Location</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(Math.floor(propertySummary.categoryRatings.location), 'sm')}</div>
                            <span className="font-medium">{propertySummary.categoryRatings.location.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                      {propertySummary.categoryRatings?.value && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(Math.floor(propertySummary.categoryRatings.value), 'sm')}</div>
                            <span className="font-medium">{propertySummary.categoryRatings.value.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Reviews */}
            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Star className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-sm text-gray-500">Be the first to review this property!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.slice(0, showAllReviews ? reviews.length : 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {review.reviewer?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.reviewer?.firstName} {review.reviewer?.lastName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">{renderStars(review.rating, 'sm')}</div>
                            <span className="text-sm text-gray-600">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                          {review.helpfulCount}
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Flag className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    )}
                    
                    <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>
                    
                    {/* Category Ratings */}
                    {(review.cleanliness || review.communication || review.location || review.value) && (
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        {review.cleanliness && (
                          <div className="flex items-center justify-between">
                            <span>Cleanliness</span>
                            <div className="flex">{renderStars(review.cleanliness, 'sm')}</div>
                          </div>
                        )}
                        {review.communication && (
                          <div className="flex items-center justify-between">
                            <span>Communication</span>
                            <div className="flex">{renderStars(review.communication, 'sm')}</div>
                          </div>
                        )}
                        {review.location && (
                          <div className="flex items-center justify-between">
                            <span>Location</span>
                            <div className="flex">{renderStars(review.location, 'sm')}</div>
                          </div>
                        )}
                        {review.value && (
                          <div className="flex items-center justify-between">
                            <span>Value</span>
                            <div className="flex">{renderStars(review.value, 'sm')}</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Owner Response */}
                    {review.ownerResponse && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Owner Response</span>
                          <span className="text-xs text-blue-600">
                            {formatDate(review.ownerResponseAt || '')}
                          </span>
                        </div>
                        <p className="text-blue-700">{review.ownerResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg sticky top-6">
              <div className="mb-6 pb-6 border-b">
                <div className="text-3xl font-bold text-primary">
                  ₦{parseFloat(property.price).toLocaleString('en-NG')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {property.listingType === 'rent' ? 'per month' : 
                   property.listingType === 'hotel' || property.listingType === 'shortlet' ? 'per night' : 
                   'total price'}
                </div>
                {property.originalPrice && (
                  <div className="text-sm text-gray-500 line-through mt-1">
                    ₦{parseFloat(property.originalPrice).toLocaleString('en-NG')}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Dynamic booking button based on property type */}
                {(property.listingType === 'shortlet' || property.listingType === 'hotel') && (
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {property.listingType === 'hotel' ? 'Book Hotel' : 'Book Now'}
                  </button>
                )}
                
                {(property.listingType === 'rent' || property.listingType === 'sale') && (
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Schedule Inspection
                  </button>
                )}
                
                <button 
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading || !propertyId}
                  className={`
                    w-full font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                    ${isFavorited 
                      ? 'bg-rose-500 text-white hover:bg-rose-600 border-2 border-rose-500 shadow-md hover:shadow-lg' 
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600'
                    }
                    ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transform hover:scale-[1.02]'}
                  `}
                >
                  {isFavoriteLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Heart 
                      className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
                    />
                  )}
                  {isFavorited ? 'Saved' : 'Save to Favorites'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {property.negotiable ? 'Price is negotiable' : 'Fixed price'}
                </p>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Property Statistics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">{property.viewCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-medium text-gray-900">{property.favoriteCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Contacts</span>
                  <span className="font-medium text-gray-900">{property.contactCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Details (if applicable) */}
            {property.listingType === 'rent' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Rental Details</h3>
                </div>
                <div className="space-y-3">
                  {property.minLeasePeriod && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Min Lease</span>
                      <span className="font-medium text-gray-900">{property.minLeasePeriod}</span>
                    </div>
                  )}
                  {property.maxLeasePeriod && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Max Lease</span>
                      <span className="font-medium text-gray-900">{property.maxLeasePeriod}</span>
                    </div>
                  )}
                  {property.availableFrom && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available From</span>
                      <span className="font-medium text-gray-900">
                        {new Date(property.availableFrom).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {property.availableUntil && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available Until</span>
                      <span className="font-medium text-gray-900">
                        {new Date(property.availableUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shortlet/Hotel Details (if applicable) */}
            {(property.listingType === 'shortlet' || property.listingType === 'hotel') && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Shortlet Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Min Stay</span>
                    <span className="font-medium text-gray-900">{property.minStayNights} nights</span>
                  </div>
                  {property.maxStayNights && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Max Stay</span>
                      <span className="font-medium text-gray-900">{property.maxStayNights} nights</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Instant Booking</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${property.instantBooking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {property.instantBooking ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cancellation</span>
                    <span className="font-medium text-gray-900 capitalize">{property.cancellationPolicy}</span>
                  </div>
                </div>
              </div>
            )}


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
