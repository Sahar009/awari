"use client";
import React from "react";

export interface selectCardProps {
  icon: React.ReactNode;
  title: string;
  content?: string;
}

export const ServiceCard: React.FC<selectCardProps> = ({
  icon,
  title,
  content,
}) => {
  return (
    <div
      className="
        group 
        bg-white border border-primary 
        flex flex-col items-center 
        rounded-2xl py-12 px-8 
        text-center transition-all duration-300 
        hover:bg-primary hover:text-white hover:scale-105 shadow-md hover:shadow-2xl
      "
    >
      {/* Icon */}
      <div
        className="
          mb-4 text-primary text-4xl p-4 
          bg-secondary-color rounded-full 
          transition-all duration-300 
          group-hover:bg-white/20 group-hover:text-white
        "
      >
        {icon}
      </div>

      {/* Title */}
      <h2
        className="
          text-2xl font-semibold mb-2 
          transition-colors duration-300 
          group-hover:text-white
        "
      >
        {title}
      </h2>

      {/* Content */}
      {content && (
        <p
          className="
            text-gray-500 text-lg font-light 
            transition-colors duration-300 
            group-hover:text-gray-100
          "
        >
          {content}
        </p>
      )}
    </div>
  );
};
