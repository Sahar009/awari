"use client";
import { Rating } from "@/components/ui/Rating";
import Image from "next/image";
import React from "react";

export type Listing = {
  id: string;
  title: string;
  location: string;
  rating: number; // 4.85
  reviewsCount: number; // 128
  pricePerNight: number; // e.g. 120
  images: string[]; // urls
  host: {
    name: string;
    image?: string;
    isSuperhost?: boolean;
  };
  description: string;
};

const listing: Listing = {
  id: "listing_123",
  title: "Chic Apartment near the Beach",
  location: "Lekki, Lagos, Nigeria",
  rating: 4.86,
  reviewsCount: 128,
  pricePerNight: 120,
  images: [
    "/assets/images/slider1.jpg",
    "/assets/images/slider1.jpg",
    "/assets/images/slider1.jpg",
    "/assets/images/slider1.jpg",
     "/assets/images/slider1.jpg",
  ],
  host: {
    name: "Aisha",
    image: "/assets/images/slider1.jpg",
    isSuperhost: true,
  },
  description:
    "Enjoy a stylish experience at this centrally-located place. Steps from the beach, restaurants, and nightlife.\nFast Wi-Fi, a fully equipped kitchen, and a cozy balcony for sunset views.",
};

export const CardDetails = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Title + Rating */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold">
          {listing.title}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Rating rating={listing.rating} />
          <p className="text-sm text-gray-700">
            {listing.rating.toFixed(2)} · {listing.reviewsCount} reviews
          </p>
          <p className="text-sm text-gray-500">· {listing.location}</p>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-8">
        <div className="relative col-span-2 row-span-2 h-64 md:h-96">
          <Image
            src={listing.images[0]}
            alt="cover"
            fill
            className="object-cover"
          />
        </div>
        {listing.images.slice(1, 5).map((src, i) => (
          <div key={i} className="relative h-32 md:h-48">
            <Image src={src} alt={`img-${i}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Content + Sidebar */}
      <div className="flex w-full flex-col lg:flex-row gap-8">
        {/* Left column */}
        <div className="w-full lg:w-[60%]">
          {/* Host */}
          <div className="flex items-center gap-3 mb-6">
            <Image
              src={listing.host.image ?? "/placeholder.jpg"}
              alt={listing.host.name}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">Hosted by {listing.host.name}</p>
              {listing.host.isSuperhost && (
                <span className="text-xs text-gray-500">Superhost</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities (placeholder) */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">What this place offers</h2>
            <ul className="grid grid-cols-2 gap-2 text-gray-700">
              <li>Free Wi-Fi</li>
              <li>2 Bedrooms</li>
              <li>Kitchen</li>
              <li>Workspace</li>
              <li>Laundry</li>
              <li>Pool access</li>
            </ul>
          </div>

          {/* Calendar Placeholder */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Select dates</h2>
            <div className="w-full h-64 border rounded-lg flex items-center justify-center text-gray-400">
              Calendar Component Here
            </div>
          </div>
        </div>

        {/* Right column (Booking card) */}
        <div className="w-full lg:w-[40%]">
          <div className="border rounded-xl shadow-md p-6 sticky top-20">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xl font-semibold">${listing.pricePerNight}</span>
              <span className="text-gray-600">night</span>
            </div>

            <div className="border rounded-lg p-4 mb-4">
              <p className="text-gray-500 text-sm">Check-in / Check-out</p>
              <div className="h-32 flex items-center justify-center text-gray-400">
                Date Picker Here
              </div>
            </div>

            <button className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-red-600 transition">
              Reserve
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
              You won’t be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
