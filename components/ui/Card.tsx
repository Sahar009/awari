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
      <div onClick={() => router.push("/product-details")} className="relative w-full md:h-56 h-36">
        <Image
          src={ImageSrc}
          fill
          className="object-cover hover:scale-110 transition overflow-hidden duration-300 ease-in"
          alt="card image"
        />

        {liked && (
          <div className="absolute top-3 right-3 ">
            <Favourite/>
          </div>
        )}

        {type && (
          <span className="absolute bottom-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            {type}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + Price */}
        <div className="flex flex-col md:flex-row justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 truncate ">{Title}</h3>
          <span className="text-primary font-bold md:text-lg text-sm">{price}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        {/* Location */}
        {location && (
          <div className="flex items-center text-gray-500 text-sm gap-1">
            <MapPin size={16} />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
