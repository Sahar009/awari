"use client";
import Image from "next/image";
import React from "react";

interface ReviewCardProps {
    imageSrc: string;
    customerName: string;
    customerType: string;
    content: string;
}

export const ReviewCard: React.FC<ReviewCardProps>= ({imageSrc,customerName,customerType,content}) => {
  return (
    <div>
      <div className="relative group">
        <div className="absolute transition rounded-lg opacity-25 -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 blur duration-400 group-hover:opacity-100 group-hover:duration-200"></div>
       
          <div className="relative px-6 py-14 space-y-6 leading-none rounded-lg bg-white  shadow-card ring-1 ring-gray-900/5">
            <div className="flex items-center space-x-4">
              <Image
                width={50}
                height={50}
                src={imageSrc}
                className="w-12 h-12 bg-center bg-cover border rounded-full"
                alt="Tim Cook"
              />
              <div className="flex flex-col items-start">
                <h3 className="text-xl font-semibold text-primary">{customerName}</h3>
                <p className=" text-sm text-secondary-color">{customerType}</p>
              </div>
            </div>
            <p className="leading-light text-black text-lg">
              {content}
            </p>
          </div>
        
      </div>
    </div>
  );
};
