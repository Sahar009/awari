"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import "./heroslider.css";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    img: "/assets/images/real-estate-3297625_1280.jpg",
    header: "Find Your Perfect Home",
    description: [
      "Discover",
      "thousands",
      "of",
      "verified",
      "properties",
      "for",
      "rent",
      "and",
      "sale",
      "across",
      "prime",
      "locations.",
      "From",
      "affordable",
      "apartments",
      "to",
      "luxury",
      "homes,",
      "find",
      "your",
      "dream",
      "property",
      "with",
      "secure",
      "transactions",
      "and",
      "expert",
      "guidance.",
    ],
    gradient: "from-primary/90 to-purple-600/80",
    accentColor: "text-primary",
    badge: "Rent & Buy",
  },
  {
    img: "/assets/images/slider7.png",
    header: "Premium Shortlets & Hotels",
    description: [
      "Book",
      "luxury",
      "short-stay",
      "accommodations",
      "for",
      "vacations,",
      "business",
      "trips,",
      "and",
      "weekend",
      "getaways.",
      "Premium",
      "amenities,",
      "instant",
      "booking,",
      "and",
      "verified",
      "hosts",
      "ensure",
      "memorable",
      "experiences",
      "every",
      "time.",
    ],
    gradient: "from-secondary-color/90 to-pink-500/80",
    accentColor: "text-secondary-color",
    badge: "Shortlets",
  },
  {
    img: "/assets/images/slider3.png",
    header: "Smart Property Management",
    description: [
      "Streamline",
      "your",
      "real",
      "estate",
      "business",
      "with",
      "our",
      "comprehensive",
      "platform.",
      "List",
      "properties,",
      "manage",
      "bookings,",
      "schedule",
      "inspections,",
      "and",
      "handle",
      "payments",
      "all",
      "in",
      "one",
      "place.",
    ],
    gradient: "from-orange-500/90 to-red-500/80",
    accentColor: "text-orange-500",
    badge: "Management",
  },
  {
    img: "/assets/images/slider1.png",
    header: "Seamless Tenant Experiences",
    description: [
      "Delight",
      "tenants",
      "with",
      "self-service",
      "tools,",
      "automated",
      "reminders,",
      "and",
      "fast",
      "support",
      "every",
      "step",
      "of",
      "their",
      "journey.",
      "Empower",
      "residents",
      "with",
      "real-time",
      "updates",
      "and",
      "transparent",
      "communication.",
    ],
    gradient: "from-emerald-500/90 to-teal-500/80",
    accentColor: "text-emerald-500",
    badge: "Tenant Care",
  },
  {
    img: "/assets/images/slider5.png",
    header: "Developer Sales Acceleration",
    description: [
      "Launch",
      "new",
      "projects",
      "with",
      "immersive",
      "storytelling,",
      "lead",
      "nurture,",
      "and",
      "real-time",
      "analytics.",
      "Manage",
      "inventory,",
      "buyers,",
      "and",
      "agents",
      "from",
      "a",
      "single",
      "command",
      "center.",
    ],
    gradient: "from-sky-500/90 to-blue-600/80",
    accentColor: "text-sky-500",
    badge: "Developers",
  },
  {
    img: "/assets/images/slider6.png",
    header: "Data-Driven Investment Insights",
    description: [
      "Unlock",
      "market",
      "intelligence",
      "with",
      "AI-powered",
      "valuation,",
      "performance",
      "tracking,",
      "and",
      "portfolio",
      "optimization.",
      "Make",
      "smarter",
      "decisions",
      "faster.",
    ],
    gradient: "from-purple-600/90 to-indigo-600/80",
    accentColor: "text-purple-500",
    badge: "Investors",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalTime = 6000;
  const transitionDuration = 800;
  const sliderRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
  }, [current, isTransitioning]);

  useEffect(() => {
    const autoSlide = setInterval(nextSlide, intervalTime);
    return () => clearInterval(autoSlide);
  }, [nextSlide]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="relative flex items-center justify-center h-[80vh] sm:h-[85vh] md:h-[90vh] lg:h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50 z-10"></div>
      
      <div className="w-full h-full relative" ref={sliderRef}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide-item absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full h-full pt-4 transition-all duration-1000 ease-out ${
              index === current 
                ? "opacity-100 translate-x-0 scale-100 z-20" 
                : "opacity-0 translate-x-0 scale-90 z-0"
            }`}
          >
            <div className="lg:px-16 lg:w-[60%] w-full flex flex-col items-start justify-center z-30 relative px-4 sm:px-6 lg:px-0">
              <div className="slide-content">
                <h1 className="slide-header text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                  {slide.header.split(' ').map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={`slide-word inline-block mr-2 sm:mr-3 lg:mr-4 transform transition-all duration-1000 ease-out ${
                        wordIndex === 0 ? slide.accentColor : 'text-white'
                      }`}
                      style={{
                        animationDelay: `${wordIndex * 0.1}s`,
                        transform: index === current ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)',
                        opacity: index === current ? 1 : 0
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>

                <p className="slide-description text-sm sm:text-base md:text-lg lg:text-lg sm:text-xl md:text-2xl text-slate-200 leading-relaxed max-w-2xl mb-6 sm:mb-8">
                  {slide.description.join(" ")}
                </p>

                <div className="slide-button">
                  <Button 
                    label={index === 0 ? "Browse Properties" : index === 1 ? "Book Now" : "Get Started"}
                    className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary transform hover:scale-105 transition-all duration-300 ease-out shadow-xl hover:shadow-2xl border-0"
                    style={{
                      animationDelay: '0.8s',
                      transform: index === current ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
                      opacity: index === current ? 1 : 0
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="slide-image-container lg:w-[40%] w-full relative z-30 mt-6 lg:mt-0 px-4 sm:px-6 lg:px-0">
              <div className="image-wrapper relative group max-w-md lg:max-w-none mx-auto lg:mx-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} rounded-2xl lg:rounded-3xl opacity-80 group-hover:opacity-90 transition-opacity duration-500`}></div>
                
              <div className="slide-image w-full h-48 sm:h-56 md:h-64 lg:h-[65vh] relative rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl transform transition-all duration-1000 ease-out group-hover:scale-105 overflow-hidden">
                <Image
                  src={slide.img}
                  alt={slide.header}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
                
                
               
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/30">
                  <span className="text-white text-xs sm:text-sm font-medium">{slide.badge}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex space-x-2 sm:space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`slide-indicator w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ease-out transform hover:scale-125 ${
                index === current 
                  ? "bg-primary scale-125 shadow-lg shadow-primary/50" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

     
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 group border border-white/20"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 group border border-white/20"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-40">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary-color transition-all duration-1000 ease-out"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      
      <div className="absolute top-8 right-8 z-40 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{current + 1}</div>
            <div className="text-sm text-slate-300">of {slides.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
