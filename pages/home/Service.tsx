"use client"; 
import { selectCardProps, ServiceCard } from "@/components/ui/ServiceCard";
import { Home, ShoppingBag, Hotel, ClipboardCheck, Shield, Building2 } from "lucide-react";

const serviceData: selectCardProps[] = [
  {
    icon: <Home size={32} />,
    title: "Property for Rent",
    content: "Find rental apartments, houses, and commercial spaces tailored to your needs.",
    image: "/assets/images/services/rent.jpg", // You can add your image path here
  },
  {
    icon: <ShoppingBag size={32} />,
    title: "Property for Sale",
    content: "Browse a wide range of properties available for purchase in prime locations.",
    image: "/assets/images/services/sale.jpg", // You can add your image path here
  },
  {
    icon: <Hotel size={32} />,
    title: "Shortlet & Hotels",
    content: "Book short-term stays and hotel accommodations with ease and convenience.",
    image: "/assets/images/services/shortlet.jpg", // You can add your image path here
  },
  {
    icon: <ClipboardCheck size={32} />,
    title: "Home Inspection",
    content: "Professional property inspection services to ensure quality and safety standards.",
    image: "/assets/images/services/inspection.jpg", // You can add your image path here
  },
  {
    icon: <Shield size={32} />,
    title: "Escrow Services",
    content: "Secure and transparent payment escrow services for safe property transactions.",
    image: "/assets/images/services/escrow.jpg", // You can add your image path here
  },
  {
    icon: <Building2 size={32} />,
    title: "Property Management",
    content: "Comprehensive property management solutions for landlords and property owners.",
    image: "/assets/images/services/management.jpg", // You can add your image path here
  },
];

const Service = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <span className="text-primary font-semibold tracking-wide text-sm uppercase px-4 py-2 bg-primary/10 rounded-full">
              Our Services
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-4 max-w-4xl mx-auto leading-tight">
            We are committed to discovering the perfect property for you
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            Comprehensive real estate solutions designed to meet all your property needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {serviceData.map((data, index) => (
            <ServiceCard
              key={index}
              icon={data.icon}
              title={data.title}
              content={data.content}
              image={data.image}
            />
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <span className="text-sm font-medium">Need help choosing a service?</span>
            <a 
              href="#contact" 
              className="text-primary font-semibold hover:underline transition-colors"
            >
              Contact us →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Service;