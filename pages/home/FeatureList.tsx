"use client";

import { Card } from "@/components/ui/Card";
import { Heart } from "lucide-react";

export const demoCards = [
  {
    ImageSrc: "/assets/images/houseimg (11).jpg",
    Title: "Luxury Apartment",
    description:
      "A modern 3-bedroom apartment with a spacious living room, balcony, and city views.",
    price: "₦1,800,000/year",
    liked: <Heart className="text-red-500" />,
    location: "Lekki, Lagos",
    type: "For Rent",
  },
  {
    ImageSrc: "/assets/images/houseimg (8).jpg",
    Title: "Beachfront Villa",
    description:
      "Exclusive 5-bedroom villa with private pool, beachfront access, and premium finishes.",
    price: "₦675,000,000",
    liked: <Heart className="text-gray-400" />,
    location: "Victoria Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/image1.jpg",
    Title: "Cozy Studio",
    description:
      "Affordable and fully furnished studio apartment ideal for short stays.",
    price: "₦90,000/night",
    liked: <Heart className="text-red-500" />,
    location: "Ikeja, Lagos",
    type: "Shortlet",
  },
  {
    ImageSrc: "/assets/images/houseimg (3).jpg",
    Title: "Family Home",
    description:
      "Spacious 4-bedroom family home with garden, parking, and nearby schools.",
    price: "₦3,000,000/year",
    liked: <Heart className="text-gray-400" />,
    location: "Surulere, Lagos",
    type: "For Rent",
  },
  {
    ImageSrc: "/assets/images/houseimg (4).jpg",
    Title: "Penthouse Suite",
    description:
      "Luxury penthouse with rooftop lounge, panoramic city views, and smart home features.",
    price: "₦1,125,000,000",
    liked: <Heart className="text-red-500" />,
    location: "Banana Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/houseimg (5).jpg",
    Title: "Beachfront Villa",
    description:
      "Exclusive 5-bedroom villa with private pool, beachfront access, and premium finishes.",
    price: "₦675,000,000",
    liked: <Heart className="text-gray-400" />,
    location: "Victoria Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/houseimg (6).jpg",
    Title: "Cozy Studio",
    description:
      "Affordable and fully furnished studio apartment ideal for short stays.",
    price: "₦90,000/night",
    liked: <Heart className="text-red-500" />,
    location: "Ikeja, Lagos",
    type: "Shortlet",
  },
  {
    ImageSrc: "/assets/images/houseimg (7).jpg",
    Title: "Family Home",
    description:
      "Spacious 4-bedroom family home with garden, parking, and nearby schools.",
    price: "₦3,000,000/year",
    liked: <Heart className="text-gray-400" />,
    location: "Surulere, Lagos",
    type: "For Rent",
  },
  {
    ImageSrc: "/assets/images/houseimg (8).jpg",
    Title: "Penthouse Suite",
    description:
      "Luxury penthouse with rooftop lounge, panoramic city views, and smart home features.",
    price: "₦1,125,000,000",
    liked: <Heart className="text-red-500" />,
    location: "Banana Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/houseimg (9).jpg",
    Title: "Penthouse Suite",
    description:
      "Luxury penthouse with rooftop lounge, panoramic city views, and smart home features.",
    price: "₦1,125,000,000",
    liked: <Heart className="text-red-500" />,
    location: "Banana Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/houseimg (10).jpg",
    Title: "Beachfront Villa",
    description:
      "Exclusive 5-bedroom villa with private pool, beachfront access, and premium finishes.",
    price: "₦675,000,000",
    liked: <Heart className="text-gray-400" />,
    location: "Victoria Island, Lagos",
    type: "For Sale",
  },
  {
    ImageSrc: "/assets/images/houseimg (11).jpg",
    Title: "Cozy Studio",
    description:
      "Affordable and fully furnished studio apartment ideal for short stays.",
    price: "₦90,000/night",
    liked: <Heart className="text-red-500" />,
    location: "Ikeja, Lagos",
    type: "Shortlet",
  },
];

const FeatureList = () => {
  return (
    <div className="w-full grid md:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] grid-cols-2 md:gap-6 gap-3">
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
