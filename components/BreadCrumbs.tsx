"use client";
import { ArrowRight } from "lucide-react";
interface BreadCrumbProps {
  header: string;
  location: string;
}

export const BreadCrumbs: React.FC<BreadCrumbProps> = ({
  header,
  location,
}) => {
  return (
    <div className="relative">
      <div className=" inset-0 h-[500px]">
        <img
          src="/assets/images/breadcrumb.jpg"
          alt="Luxury property background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/40 to-slate-800/60"></div>
      </div>

      {/* Overlay Gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div> */}

      <div className="absolute top-0 left-0 z-10 flex flex-col justify-between h-full w-full lg:w-[80%] md:px-16 px-6 py-12">
        {/* Top Section - Logo/Brand */}
        <div className="flex flex-col items-start justify-center animate-fadeInDown w-full h-full mt-6">
          <div className="transform hover:scale-105 transition-transform duration-300"></div>
          <h1 className="lg:text-5xl  text-4xl font-bold text-purple-100">
            {header}
          </h1>
          <p className="md:text-2xl text-xl text-white font-light my-8  flex flex-row items-center gap-2">
            Home <ArrowRight className="text-white" size={20} /> {location}
          </p>
        </div>
      </div>
    </div>
  );
};
