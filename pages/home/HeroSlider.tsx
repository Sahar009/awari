"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./heroslider.css";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    img: "/assets/images/slider1.jpg",
    header: "Featured Rentals",
    description: [
      "Find",
      "affordable",
      "apartments",
      "and",
      "houses",
      "for",
      "rent",
      "in",
      "prime",
      "locations.",
      "Enjoy",
      "flexible",
      "payments",
      "and",
      "schedule",
      "property",
      "inspections",
      "easily.",
    ],
  },
  {
    img: "/assets/images/slider2.jpg",
    header: "Property for Sales",
    description: [
      "Discover",
      "exclusive",
      "homes",
      "and",
      "lands",
      "available",
      "for",
      "sale.",
      "Verified",
      "listings,",
      "secure",
      "transactions,",
      "and",
      "expert",
      "guidance",
      "to",
      "help",
      "you",
      "own",
      "your",
      "dream",
      "property.",
    ],
  },
  {
    img: "/assets/images/slider3.jpg",
    header: "Shortlets & Hotels",
    description: [
      "Book",
      "luxury",
      "short-stay",
      "apartments",
      "and",
      "hotels",
      "with",
      "top-rated",
      "amenities.",
      "Perfect",
      "for",
      "vacations,",
      "business",
      "trips,",
      "and",
      "weekend",
      "getaways.",
    ],
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const intervalTime = 5000;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const autoSlide = setInterval(nextSlide, intervalTime);
    return () => clearInterval(autoSlide);
  }, [nextSlide]);

  return (
    <div className="relative flex items-center justify-center h-screen w-full bg-secondary">
      <div className="w-full h-full  relative">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`item flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-0 lg:justify-between w-full min-h-screen lg:h-screen pt-4 top-0  absolute transition-all duration-700 ${
              index === current ? "active opacity-100" : "opacity-0"
            }`}
          >
            <div className=" lg:px-12 lg:w-[60%] w-full flex flex-col items-start justify-center">
              <h1
                className="text-6xl lg:text-8xl font-bold mb-4"
                style={{ wordSpacing: "0.5rem" }}
              >
                {slide.header}
              </h1>

              <p
                className="text-lg sm:text-xl md:text-2xl"
                style={{ wordSpacing: "0.35rem", lineHeight: "1.8" }}
              >
                {slide.description.join(" ")}
              </p>
            </div>

            <div className="item-image-container lg:w-[40%] w-full ">
              <img
                className="item-image w-full h-[30vh] sm:h-[50vh] lg:h-[60vh]  object-cover rounded-3xl"
                src={slide.img}
                alt={slide.header}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      {/* <div className="controls absolute bottom-6 right-6">
        <ul className="flex space-x-2">
          {slides.map((_, index) => (
            <li
              key={index}
              className={`control w-3 h-3 rounded-full ${
                index === current ? "bg-gray-700" : "bg-gray-400"
              } cursor-pointer`}
              onClick={() => setCurrent(index)}
            ></li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default HeroSlider;
