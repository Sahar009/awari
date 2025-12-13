"use client";
import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import { HouseIcon, Building2Icon, UsersIcon, Award, Building2, TrendingUp, MapPin } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import Container from "@/components/Container";
import FaqSection from "@/components/about/FaqSection";

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = "", duration = 2000 }: { value: string; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          const numericValue = parseInt(value.replace(/\D/g, ""));
          const startTime = Date.now();
          const startValue = 0;
          const endValue = numericValue;

          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
            
            setCount(currentValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };

          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};

const About = () => {

const whyUsData = [
  {
    icon: <HouseIcon size={28} className="text-orange-500"/>,
    title: "Smart Investments",
    content:
      "Access exclusive real estate deals with high ROI potential, tailored for both short and long-term goals.",
    imgSrc: "/assets/images/Gemini_Generated_Image_mzreg1mzreg1mzre.png",
  },
  {
    icon: <Building2Icon size={28} className="text-orange-500" />,
    title: "Luxury Properties",
    content:
      "From modern apartments to luxury villas, we provide properties designed for comfort and prestige.",
    imgSrc: "/assets/images/slider1.png",
  },
 {
  icon: <UsersIcon size={28} className="text-orange-500" />,
  title: "Trusted Expertise",
  content:
    "With 7+ years of experience, our experts carefully guide you through every step of your property journey with confidence.",
  imgSrc: "/assets/images/slider6.png",
},
];

const stats = [
  { 
    value: "7+", 
    label: "Years of Expertise", 
    icon: Award 
  },
  { 
    value: "12K", 
    label: "Curated Listings", 
    icon: Building2 
  },
  { 
    value: "98%", 
    label: "Client Satisfaction", 
    icon: TrendingUp 
  },
  { 
    value: "30+", 
    label: "Local Government", 
    icon: MapPin 
  }
];

  return (
    <Container>
    <div className="w-full h-full flex flex-col gap-6 py-14">
  <div className="w-full items-center gap-6 flex flex-col lg:justify-between lg:flex-row">
    <div className="space-y-3 w-full lg:w-[45%]">
      <h1 className="text-3xl md:text-4xl font-bold">
        Awari Vision & Mission
      </h1>
      <p className="text-xl font-normal">
        You are the center of our process — your needs, your wants, and
        your goals shape every decision we make. We actively listen,
        provide clear guidance, and always keep it even keel — never losing
        sight of creating value, trust, and meaningful results.
      </p>
    </div>
    <div className="w-full flex justify-center lg:w-[45%]">
      <Image
        src={"/assets/images/slider1.png"}
        alt="about-images"
        width={500}
        height={400}
        className="rounded-3xl"
      />
    </div>
  </div>

  <div className="w-full gap-6 items-center flex flex-col lg:justify-between lg:flex-row">
    <div className="w-full lg:w-[45%] flex justify-center">
      <Image
        src={"/assets/images/slider3.png"}
        alt="about-image2"
        width={500}
        height={400}
        className="rounded-3xl"
      />
    </div>

    <p className="text-xl font-normal w-full lg:w-[45%]">
      We design homes for the way people truly live. Our
      <span className="font-semibold"> Centered Design philosophy </span>
      shapes spaces that energize, inspire, and bring lasting comfort.
      Every floor plan emphasizes natural light, refreshing colors, and
      clean air — qualities that support your wellbeing, creativity, and
      energy levels each day. When you walk into our homes, you&apos;ll see
      thoughtful design that puts people first — and more importantly,
      you&apos;ll feel it deeply.
    </p>
  </div>
</div>

      {/* Stats Section with Animated Counters */}
      <div className="w-full py-16 bg-gradient-to-br from-primary via-primary/95 to-purple-900 rounded-4xl my-12">
        <div className="flex flex-col items-center gap-12 px-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Our <span className="text-orange-500">Achievements</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              Numbers that reflect our commitment and excellence in real estate
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const suffix = stat.value.replace(/[0-9]/g, "");
              
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 rounded-2xl bg-orange-500/20 p-4 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-8 w-8 text-orange-500 group-hover:text-white" />
                  </div>
                  <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                    <AnimatedCounter value={stat.value} suffix={suffix} />
                  </div>
                  <p className="text-sm md:text-base text-white/80 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full gap-10 bg-primary py-10 px-6 rounded-4xl my-12">
        <div className="flex items-center flex-col justify-center gap-5 text=center">
          <h1 className="lg:text-5xl text-4xl font-bold text-white">
            Why <span className="text-orange-500">Choose</span> us?
          </h1>
          <p className="md:text-2xl text-lg font-light text-purple-300 text-center w-full md:w-2/3">
            We are a real estate firm with over <AnimatedCounter value="7+" /> years of expertise, and our
            main goal is to provide amazing locations to our partners and
            clients. Within the luxury real estate market, our agency offers
            customized solutions.
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 }, // mobile
            768: { slidesPerView: 2 }, // tablet
            1024: { slidesPerView: 3 }, // desktop
          }}
          className="w-full"
        >
          {whyUsData.map((data, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col gap-5 items-start">
                <div className="flex items-start rounded-full justify-center border-purple-200 hover:bg-amber-500/80 border-2 p-6 ">
                  {data.icon}
                </div>
                <h1 className="text-2xl text-white font-bold">{data.title}</h1>
                <p className="text-lg font-light text-purple-200">
                  {data.content}
                </p>
                <div>
                  <Image
                    width={400}
                    height={500}
                    src={data.imgSrc}
                    alt="images"
                    className="w-full h-[500px] overflow-hidden  object-cover rounded-2xl"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <FaqSection />
    </Container>
  );
};

export default About;