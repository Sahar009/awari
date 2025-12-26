"use client";

import Image from "next/image";
import { MapPin, Bed, Bath, Car, Maximize2, Sparkles, CheckCircle2 } from "lucide-react";
import { Favourite } from "./Favourite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CardProps {
  ImageSrc?: string;
  Title: string;
  description: string;
  price: string;
  liked?: React.ReactNode;
  location?: string;
  type?: string;
  propertyId?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floorArea?: string | number;
  furnished?: boolean;
  amenities?: string[];
  features?: string[];
  propertyType?: string;
  conditionStatus?: string;
}



export const Card: React.FC<CardProps> = ({
  ImageSrc = "/assets/images/slider4.jpg",
  Title,
  description,
  price,
  liked,
  location,
  type,
  propertyId,
  bedrooms,
  bathrooms,
  parkingSpaces,
  floorArea,
  furnished,
  amenities,
  features,
  propertyType,
  conditionStatus,
}) => {
  const router = useRouter();
  
  // Debug logging on mount and when key props change
  useEffect(() => {
    console.log('[Card] mounted', { propertyId, Title, liked: Boolean(liked) });
    return () => {
      console.log('[Card] unmounted', { propertyId });
    };
  }, [propertyId, Title, liked]);

  useEffect(() => {
    console.log('[Card] props changed', { propertyId, Title, liked: Boolean(liked) });
  }, [propertyId, Title, liked]);
  
  // Format floor area if it's a number
  const formattedFloorArea = floorArea ? (typeof floorArea === 'number' ? floorArea.toFixed(0) : floorArea) : null;
  
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
      {/* Image Section */}
      <div onClick={() => {
        console.log('🔍 Card - Clicked, navigating to:', `/product-details?id=${propertyId}`);
        router.push(`/product-details?id=${propertyId}`);
      }} className="relative w-full h-56 cursor-pointer overflow-hidden">
        <Image
          src={ImageSrc}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          alt="card image"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like Button */}
        {liked && propertyId && (
          <div className="absolute top-3 right-3 z-10">
            <Favourite propertyId={propertyId} />
          </div>
        )}
        {(!liked || !propertyId) && (
          <>
            {console.log('[Card] Favourite hidden', { reason: !liked ? 'liked is falsy' : 'propertyId missing', propertyId, liked: Boolean(liked) })}
          </>
        )}

        {/* Badges Row */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          {type && (
            <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
              {type}
            </span>
          )}
          {conditionStatus && (
            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg capitalize">
              {conditionStatus}
            </span>
          )}
          {furnished && (
            <span className="bg-indigo-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
              Furnished
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{Title}</h3>
        
        {/* Location */}
        {location && (
          <div className="flex items-center text-gray-600 text-sm gap-1.5">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        {/* Property Specs */}
        {(bedrooms || bathrooms || parkingSpaces || floorArea) && (
          <div className="flex items-center gap-4 py-3 border-y border-gray-100">
            {bedrooms && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Bed size={18} className="text-blue-600" />
                <span className="text-sm font-semibold">{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Bath size={18} className="text-cyan-600" />
                <span className="text-sm font-semibold">{bathrooms}</span>
              </div>
            )}
            {parkingSpaces && parkingSpaces > 0 && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Car size={18} className="text-purple-600" />
                <span className="text-sm font-semibold">{parkingSpaces}</span>
              </div>
            )}
            {floorArea && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Maximize2 size={18} className="text-orange-600" />
                <span className="text-sm font-semibold">{floorArea} sqft</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{description}</p>

        {/* Amenities/Features */}
        {(amenities || features) && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {amenities?.slice(0, 3).map((amenity, index) => (
              <span key={index} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 size={12} />
                {amenity}
              </span>
            ))}
            {features?.slice(0, 2).map((feature, index) => (
              <span key={index} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                <Sparkles size={12} />
                {feature}
              </span>
            ))}
            {((amenities?.length || 0) + (features?.length || 0)) > 5 && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                +{((amenities?.length || 0) + (features?.length || 0)) - 5} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-primary">{price}</span>
            {propertyType && (
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{propertyType}</p>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/product-details?id=${propertyId}`);
            }}
            className="px-4 py-2 bg-primary/10 text-primary font-semibold text-sm rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
