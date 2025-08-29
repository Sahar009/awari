"use client";

import { Card } from "@/components/ui/Card";
import { Heart } from "lucide-react";

export const demoCards = [
  {
    ImageSrc: "/assets/images/slider4.jpg",
    Title: "Luxury Apartment",
    description:
      "A modern 3-bedroom apartment with a spacious living room, balcony, and city views.",
    price: "$1,200/mo",
    liked: <Heart className="text-red-500" />,
    location: "Lekki, Lagos",
    type: "For Rent",
  },
  {
    ImageSrc: "/assets/images/slider1.jpg",
    Title: "Beachfront Villa",
    description:
      "Exclusive 5-bedroom villa with private pool, beachfront access, and premium finishes.",
    price: "$450,000",
    liked: <Heart className="text-gray-400" />,
    location: "Victoria Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/slider3.jpg",
    Title: "Cozy Studio",
    description:
      "Affordable and fully furnished studio apartment ideal for short stays.",
    price: "$60/night",
    liked: <Heart className="text-red-500" />,
    location: "Ikeja, Lagos",
    type: "Shortlet",
  },
  {
    ImageSrc: "/assets/images/slider2.jpg",
    Title: "Family Home",
    description:
      "Spacious 4-bedroom family home with garden, parking, and nearby schools.",
    price: "$2,000/mo",
    liked: <Heart className="text-gray-400" />,
    location: "Surulere, Lagos",
    type: "For Rent",
  },
  {
    ImageSrc: "/assets/images/slider4.jpg",
    Title: "Penthouse Suite",
    description:
      "Luxury penthouse with rooftop lounge, panoramic city views, and smart home features.",
    price: "$750,000",
    liked: <Heart className="text-red-500" />,
    location: "Banana Island, Lagos",
    type: "For Sale",
  },
   {
    ImageSrc: "/assets/images/slider1.jpg",
    Title: "Beachfront Villa",
    description:
      "Exclusive 5-bedroom villa with private pool, beachfront access, and premium finishes.",
    price: "$450,000",
    liked: <Heart className="text-gray-400" />,
    location: "Victoria Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/slider3.jpg",
    Title: "Cozy Studio",
    description:
      "Affordable and fully furnished studio apartment ideal for short stays.",
    price: "$60/night",
    liked: <Heart className="text-red-500" />,
    location: "Ikeja, Lagos",
    type: "Shortlet",
  },
  {
    ImageSrc: "/assets/images/slider2.jpg",
    Title: "Family Home",
    description:
      "Spacious 4-bedroom family home with garden, parking, and nearby schools.",
    price: "$2,000/mo",
    liked: <Heart className="text-gray-400" />,
    location: "Surulere, Lagos",
    type: "For Rent",
  },
  {
    ImageSrc: "/assets/images/slider4.jpg",
    Title: "Penthouse Suite",
    description:
      "Luxury penthouse with rooftop lounge, panoramic city views, and smart home features.",
    price: "$750,000",
    liked: <Heart className="text-red-500" />,
    location: "Banana Island, Lagos",
    type: "For Sale",
  },
];

const FeatureList = () => {
  return (
    <div className="w-full grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6">
      {demoCards.map((data, index) => (
        <div key={index}>
          <Card 
          ImageSrc={data.ImageSrc} 
          Title={data.Title}
          description={data.description}
          price={data.price}
          liked={data.liked}
          location={data.location}
          type={data.type}
           />
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
