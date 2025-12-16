"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import "./heroslider.css";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    img: "/assets/images/real-estate-3297625_1280.jpg",
    header: "Find Your Perfect Home",
    description: "Discover thousands of verified properties for rent and sale across prime locations. From affordable apartments to luxury homes, find your dream property with secure transactions and expert guidance.",
    gradient: "from-primary/90 via-purple-600/80 to-purple-700/90",
    accentColor: "text-primary",
    badge: "Rent & Buy",
  },
  {
    img: "/assets/images/slider7.jpg",
    header: "Premium Shortlets & Hotels",
    description: "Book luxury short-stay accommodations for vacations, business trips, and weekend getaways. Premium amenities, instant booking, and verified hosts ensure memorable experiences every time.",
    gradient: "from-secondary-color/90 via-pink-500/80 to-rose-600/90",
    accentColor: "text-secondary-color",
    badge: "Shortlets",
  },
  {
    img: "/assets/images/slider34.jpg",
    header: "Smart Property Management",
    description: "Streamline your real estate business with our comprehensive platform. List properties, manage bookings, schedule inspections, and handle payments all in one place.",
    gradient: "from-orange-500/90 via-red-500/80 to-amber-600/90",
    accentColor: "text-orange-500",
    badge: "Management",
  },
  {
    img: "/assets/images/slider1.png",
    header: "Seamless Tenant Experiences",
    description: "Delight tenants with self-service tools, automated reminders, and fast support every step of their journey. Empower residents with real-time updates and transparent communication.",
    gradient: "from-emerald-500/90 via-teal-500/80 to-green-600/90",
    accentColor: "text-emerald-500",
    badge: "Tenant Care",
  },
  {
    img: "/assets/images/slider36.jpg",
    header: "Developer Sales Acceleration",
    description: "Launch new projects with immersive storytelling, lead nurture, and real-time analytics. Manage inventory, buyers, and agents from a single command center.",
    gradient: "from-sky-500/90 via-blue-600/80 to-cyan-600/90",
    accentColor: "text-sky-500",
    badge: "Developers",
  },
  {
    img: "/assets/images/slider6.png",
    header: "Expert Investment Guidance",
    description: "Navigate property investments with verified listings, market intelligence, and personalized advisory. From market research to acquisition, we guide you through every step with trusted expertise.",
    gradient: "from-purple-600/90 via-indigo-600/80 to-violet-700/90",
    accentColor: "text-purple-500",
    badge: "Investors",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const intervalTime = 6000;
  const transitionDuration = 1200;
  const sliderRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection("next");
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection("prev");
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setDirection(index > current ? "next" : "prev");
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
    <div className="hero-slider-container relative w-full h-[calc(90vh-5rem)] md:h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black mt-20">
      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/20 z-10" />
      
      {/* Floating orbs for visual effect */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      {/* Slides container */}
      <div className="relative w-full h-full" ref={sliderRef}>
        {slides.map((slide, index) => {
          const isActive = index === current;
          
          return (
            <div
              key={index}
              className={`hero-slide absolute inset-0 w-full h-full ${
                isActive ? "active" : ""
              } ${direction}`}
              data-index={index}
            >
              {/* Background image with parallax effect */}
              <div className={`slide-bg-image absolute inset-0 ${isActive ? "active" : ""}`}>
                <Image
                  src={slide.img}
                  alt={slide.header}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-40" style={{
                  background: `linear-gradient(135deg, ${slide.gradient.split(' ')[0]}, ${slide.gradient.split(' ')[1]}, ${slide.gradient.split(' ')[2]})`
                }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className={`slide-content-wrapper relative z-20 h-full flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 ${isActive ? "active" : ""}`}>
                <div className="max-w-7xl w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 xl:gap-12 items-center">
                    
                    {/* Text Content */}
                    <div className={`slide-text-content text-center lg:text-left relative w-full lg:max-w-[90%] xl:max-w-full ${isActive ? "animate-in" : ""}`}>
                      {/* Subtle backdrop for text readability */}
                      <div className="absolute inset-0 -inset-x-4 lg:-inset-x-8 -inset-y-4 bg-gradient-to-br from-white/5 to-transparent rounded-3xl backdrop-blur-sm -z-10" />
                      
                      {/* Badge */}
                      <div className={`inline-block mb-4 md:mb-6 ${isActive ? "fade-in-up" : ""}`} style={{ animationDelay: "0.1s" }}>
                        <span className={`badge-modern px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border border-white/30 ${slide.accentColor} bg-white/20`}>
                          {slide.badge}
                        </span>
                      </div>

                      {/* Header with split animation */}
                      <h1 className={`slide-title mb-4 md:mb-6 w-full ${isActive ? "fade-in-up" : ""}`} style={{ animationDelay: "0.3s" }}>
                        <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight break-words">
                          <span className={`${slide.accentColor} gradient-text drop-shadow-lg`}>
                            {slide.header.split(' ').slice(0, 2).join(' ')}
                          </span>
                          <span className="text-white ml-1 sm:ml-2 drop-shadow-lg">
                            {slide.header.split(' ').slice(2).join(' ')}
                          </span>
                        </span>
                      </h1>

                      {/* Description */}
                      <p className={`slide-description text-base sm:text-lg md:text-xl text-white/95 mb-6 md:mb-8 max-w-full lg:max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md break-words ${isActive ? "fade-in-up" : ""}`} style={{ animationDelay: "0.5s" }}>
                        {slide.description}
                      </p>

                      {/* CTA Button */}
                      <div className={`${isActive ? "fade-in-up" : ""}`} style={{ animationDelay: "0.7s" }}>
                        <Button
                          label={index === 0 ? "Browse Properties" : index === 1 ? "Book Now" : "Get Started"}
                          className="modern-cta-btn px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 rounded-full border-0"
                        />
                      </div>
                    </div>

                    {/* Image Content */}
                    <div className={`slide-image-wrapper hidden lg:block ${isActive ? "animate-in" : ""}`} style={{ animationDelay: "0.4s" }}>
                      <div className="relative">
                        {/* Floating card effect */}
                        <div className="modern-image-card relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`} />
                          <div className="relative h-[600px] w-full">
                            <Image
                              src={slide.img}
                              alt={slide.header}
                              fill
                              className="object-cover"
                              quality={90}
                            />
                          </div>
                          
                          {/* Decorative elements */}
                          <div className="absolute top-6 right-6 w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{index + 1}</span>
                          </div>
                          
                          {/* Gradient overlay on image */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`} />
                        </div>

                        {/* Floating decoration circles */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="nav-arrow nav-arrow-left absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-white/20"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 md:w-7 md:h-7 text-white transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="nav-arrow nav-arrow-right absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-white/20"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 md:w-7 md:h-7 text-white transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex space-x-3 items-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`pagination-dot group relative ${index === current ? "active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className="dot-inner" />
              <span className="dot-outer" />
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-40">
        <div 
          className="progress-bar h-full bg-gradient-to-r from-primary via-purple-500 to-primary transition-all duration-300 ease-out"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slide Counter (Desktop) */}
      {/* <div className="absolute top-8 right-8 z-40 hidden lg:block">
        <div className="slide-counter bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{String(current + 1).padStart(2, '0')}</div>
            <div className="text-sm text-gray-300">of {String(slides.length).padStart(2, '0')}</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default HeroSlider;