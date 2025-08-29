"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { Favourite } from "./Favourite";
import { useRouter } from "next/navigation";

interface CardProps {
  ImageSrc?: string;
  Title: string;
  description: string;
  price: string;
  liked?: React.ReactNode;
  location?: string;
  type?: string;
}



export const Card: React.FC<CardProps> = ({
  ImageSrc = "/assets/images/slider4.jpg",
  Title,
  description,
  price,
  liked,
  location,
  type,
}) => {
  const router = useRouter();
  return (
    <div className=" bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Image Section */}
      <div onClick={() => router.push("/product-details")} className="relative w-full h-56">
        <Image
          src={ImageSrc}
          fill
          className="object-cover hover:scale-110 transition overflow-hidden duration-300 ease-in"
          alt="card image"
        />

        {/* Like Button */}
        {liked && (
          <div className="absolute top-3 right-3 ">
            <Favourite/>
          </div>
        )}

        {/* Property Type Badge */}
        {type && (
          <span className="absolute bottom-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            {type}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + Price */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{Title}</h3>
          <span className="text-primary font-bold text-lg">{price}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        {/* Location */}
        {location && (
          <div className="flex items-center text-gray-500 text-sm gap-1">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
