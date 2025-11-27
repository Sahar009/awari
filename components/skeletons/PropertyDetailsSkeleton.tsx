"use client";

import React from 'react';

const PropertyDetailsSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <div className="h-10 w-3/4 bg-gray-200 rounded-lg mb-3"></div>
            {/* Location and badges */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-5 w-48 bg-gray-200 rounded"></div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          {/* Price */}
          <div className="text-right">
            <div className="h-10 w-40 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Image Gallery Skeleton */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
          {/* Main image */}
          <div className="relative col-span-2 row-span-2 h-64 md:h-96 bg-gray-200 rounded-2xl"></div>
          {/* Smaller images */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative h-32 md:h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Owner Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Property Specifications Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                  <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Features Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-36 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
            {/* Rating Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Review Items */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center mb-6">
                <div className="h-10 w-40 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="h-3 w-32 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>

            {/* Property Stats Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="h-6 w-44 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsSkeleton;






