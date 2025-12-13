"use client";
import {
  Building2,
  CheckCircle2,
  Home,
  MapPinned,
  PhoneIcon,
  ShieldCheck,
  Users,
  TrendingUp,
  Award,
  MapPin
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";


const featureHighlights = [
  {
    title: "Tailored Advisory",
    description:
      "Personalized onboarding, dedicated portfolio managers, and continuous market intelligence for smarter moves.",
    icon: Users
  },
  {
    title: "Verified Assets",
    description:
      "Every listing passes through a 150-point digital and on-site verification checklist before it goes live.",
    icon: ShieldCheck
  },
  {
    title: "End-to-End Support",
    description:
      "From valuation to closing, our experts and automation keep transactions transparent, compliant, and fast.",
    icon: Building2
  }
];

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

const performanceStats = [
  { value: "7+", label: "Years of Expertise", icon: Award },
  { value: "12K", label: "Curated Listings", icon: Building2 },
  { value: "98%", label: "Client Satisfaction", icon: TrendingUp },
  { value: "30+", label: "Local Government", icon: MapPin }
];

const About = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-purple-900 py-20 md:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary-color/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-20">
          
          {/* Left Side - Image */}
          <div className="relative w-full lg:w-[48%]">
            {/* Decorative elements */}
            <div className="absolute -left-8 -top-8 hidden h-40 w-40 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl lg:block transform rotate-6 animate-pulse" />
            <div className="absolute -right-8 bottom-16 hidden h-32 w-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-md lg:block transform -rotate-12" />
            
            <div className="relative group">
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl transform transition-all duration-700 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent z-10" />
                <Image
                  src={"/assets/images/slider4.jpg"}
                  alt="About Awari Homes"
                  width={720}
                  height={880}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                
                {/* Info cards overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 backdrop-blur-xl p-5 border border-white/20 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-secondary-color/20 p-3 backdrop-blur-sm">
                        <Home className="h-6 w-6 text-secondary-color" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/70 font-medium">Premium residences</p>
                        <p className="text-lg font-bold text-white mt-1">Curated luxury spaces</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 backdrop-blur-xl p-5 border border-white/20 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-secondary-color/20 p-3 backdrop-blur-sm">
                        <MapPinned className="h-6 w-6 text-secondary-color" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/70 font-medium">Global reach</p>
                        <p className="text-lg font-bold text-white mt-1">Across Nigeria</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-6 -right-6 z-30 hidden lg:block">
                <div className="rounded-2xl bg-gradient-to-br from-secondary-color to-pink-500 p-4 shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex w-full flex-col gap-10 lg:w-[52%]">
            {/* Header */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-lg hover:bg-white/20 transition-all duration-300">
                <CheckCircle2 className="h-4 w-4 text-secondary-color" />
                About Awari Homes
              </div>
              
              <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Elevating real estate journeys with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-color to-pink-300">
                  trust, technology,
                </span>{" "}
                and timeless service.
              </h2>
              
              <p className="text-lg text-white/90 sm:text-xl leading-relaxed max-w-2xl">
                From boutique residences to large-scale developments, Awari curates spaces that enrich lives. Our platform
                fuses verified market data, modern infrastructure, and a high-touch service model to unlock value for
                homeowners, investors, and partners.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid gap-6 sm:grid-cols-2">
              {featureHighlights.map(({ title, description, icon: Icon }, index) => (
                <div
                  key={title}
                  className="group relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 text-white transition-all duration-500 hover:border-secondary-color/50 hover:bg-white/10 hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary-color/0 to-secondary-color/0 group-hover:from-secondary-color/10 group-hover:to-transparent transition-all duration-500" />
                  
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-color/20 text-secondary-color transition-all duration-500 group-hover:bg-secondary-color group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats and Contact */}
            <div className="flex flex-col gap-8">
              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {performanceStats.map(({ value, label, icon: Icon }) => {
                  const suffix = value.replace(/[0-9]/g, "");
                  return (
                    <div 
                      key={label}
                      className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                    >
                      <div className="flex justify-center mb-3">
                        <div className="rounded-full bg-secondary-color/20 p-3 text-secondary-color group-hover:bg-secondary-color group-hover:text-white transition-all duration-300">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-white mb-1">
                        <AnimatedCounter value={value} suffix={suffix} />
                      </p>
                      <p className="text-sm text-white/80 font-medium">{label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Contact Card */}
              <div className="flex items-center gap-6 rounded-3xl border border-white/30 bg-white/10 backdrop-blur-xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 group">
                <div className="rounded-2xl bg-gradient-to-br from-secondary-color to-pink-500 p-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <PhoneIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/70 font-medium mb-1">Speak with our concierge</p>
                  <p className="text-3xl font-bold text-white">+01 345 67890</p>
                </div>
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="rounded-full bg-secondary-color/20 p-2">
                    <svg className="h-6 w-6 text-secondary-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;