"use client"; 
import { selectCardProps, ServiceCard } from "@/components/ui/ServiceCard";
import { HousePlugIcon } from "lucide-react";

const serviceData: selectCardProps[] = [
  {
    icon: <HousePlugIcon size={40} />,
    title: "Property for Rent",
    content: "Find rental apartments, houses, and commercial spaces tailored to your needs.",
  },
  {
    icon: <HousePlugIcon size={40} />,
    title: "Property for Sale",
    content: "Browse a wide range of properties available for purchase in prime locations.",
  },
  {
    icon: <HousePlugIcon size={40} />,
    title: "Shortlet & Hotels",
    content: "Book short-term stays and hotel accommodations with ease and convenience.",
  },
  {
    icon: <HousePlugIcon size={40} />,
    title: "Home Inspection",
    content: "Book short-term stays and hotel accommodations with ease and convenience.",
  },
  {
    icon: <HousePlugIcon size={40} />,
    title: "Escrow Services",
    content: "Book short-term stays and hotel accommodations with ease and convenience.",
  },
  {
    icon: <HousePlugIcon size={40} />,
    title: "Property Management",
    content: "Book short-term stays and hotel accommodations with ease and convenience.",
  },
];

export const Service = () => {
  return (
    <section className="py-12 px-6">
      <div className="text-center mb-10 flex flex-col items-center">
        <h4 className="text-secondary-color font-semibold tracking-wide text-sm uppercase">
          Our Services
        </h4>
        <h1 className="text-4xl lg:text-5xl font-bold  w-3/4  mt-2">
          We are committed to discovering the perfect property for you
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {serviceData.map((data, index) => (
          <ServiceCard
            key={index}
            icon={data.icon}
            title={data.title}
            content={data.content}
          />
        ))}
      </div>
    </section>
  );
};