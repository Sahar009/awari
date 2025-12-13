"use client";
import React from "react";
import Image from "next/image";

export interface selectCardProps {
  icon: React.ReactNode;
  title: string;
  content?: string;
  image?: string;
}

export const ServiceCard: React.FC<selectCardProps> = ({
  icon,
  title,
  content,
  image,
}) => {
  return (
    <div
      className="
        group 
        bg-white border border-gray-200
        flex flex-col 
        rounded-3xl overflow-hidden
        transition-all duration-500 
        hover:shadow-2xl hover:-translate-y-2
        shadow-lg
        relative
      "
    >
      {/* Image Section */}
      {image && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Icon overlay on image */}
          <div
            className="
              absolute top-4 right-4
              text-white bg-primary/90 backdrop-blur-sm
              p-3 rounded-2xl
              transition-all duration-300 
              group-hover:bg-primary group-hover:scale-110
              shadow-lg
            "
          >
            {icon}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        {/* Icon (shown only if no image) */}
        {!image && (
          <div
            className="
              mb-4 text-primary text-4xl p-4 
              bg-primary/10 rounded-2xl
              transition-all duration-300 
              group-hover:bg-primary group-hover:text-white
              self-start
            "
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <h2
          className="
            text-2xl md:text-3xl font-bold mb-3
            text-gray-900
            transition-colors duration-300 
            group-hover:text-primary
          "
        >
          {title}
        </h2>

        {/* Content */}
        {content && (
          <p
            className="
              text-gray-600 text-base md:text-lg leading-relaxed
              transition-colors duration-300 
              group-hover:text-gray-700
              flex-1
            "
          >
            {content}
          </p>
        )}

        {/* Read more indicator */}
        <div className="mt-4 flex items-center text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-sm">Learn more</span>
          <svg 
            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};