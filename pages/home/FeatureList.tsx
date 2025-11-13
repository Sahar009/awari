"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";

export interface PropertyCard {
  ImageSrc: string;
  Title: string;
  description: string;
  price: string;
  rawPrice?: number | null;
  liked?: ReactNode;
  location?: string;
  type?: string;
  propertyId?: string;
}

interface FeatureListProps {
  cards?: PropertyCard[];
  isLoading?: boolean;
  skeletonCount?: number;
}

const MAX_VISIBLE = 16;

const PropertyCardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
    <div className="h-44 w-full rounded-xl bg-slate-200/80 animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 w-2/3 rounded bg-slate-200/80 animate-pulse" />
      <div className="h-4 w-1/3 rounded bg-slate-200/70 animate-pulse" />
    </div>
    <div className="h-3 w-full rounded bg-slate-200/70 animate-pulse" />
    <div className="h-3 w-3/4 rounded bg-slate-200/60 animate-pulse" />
    <div className="h-3 w-1/2 rounded bg-slate-200/60 animate-pulse" />
  </div>
);

const FeatureList: React.FC<FeatureListProps> = ({
  cards,
  isLoading = false,
  skeletonCount = 8
}) => {
  // Ensure cards is always an array
  const safeCards = cards || [];
  
  if (!isLoading && !safeCards.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-12 text-center shadow-md">
        <h3 className="text-xl font-semibold text-slate-800">No matching properties found</h3>
        <p className="mt-2 text-sm text-slate-500">
          Try adjusting your filters or exploring different locations to discover more listings.
        </p>
      </div>
    );
  }

  const visibleCards = safeCards.slice(0, MAX_VISIBLE);
  const visibleSkeletons = Math.min(MAX_VISIBLE, Math.max(1, skeletonCount));

  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: visibleSkeletons }).map((_, index) => (
            <div key={`skeleton-${index}`} className="relative">
              <PropertyCardSkeleton />
              {index === 0 && (
                <div className="absolute right-4 top-4">
                  <Loader size="sm" variant="spinner" />
                </div>
              )}
            </div>
          ))
        : visibleCards.map((data, index) => (
            <Card
              key={`${data.propertyId ?? data.Title}-${index}`}
              ImageSrc={data.ImageSrc}
              Title={data.Title}
              description={data.description}
              price={data.price}
              liked={data.liked}
              location={data.location}
              type={data.type}
              propertyId={data.propertyId}
            />
          ))}
    </div>
  );
};

export default FeatureList;

