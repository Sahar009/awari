"use client";
import {
  Building2,
  CheckCircle2,
  Home,
  MapPinned,
  PhoneIcon,
  ShieldCheck,
  Users
} from "lucide-react";
import Image from "next/image";


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

const performanceStats = [
  { value: "20+", label: "Years of Expertise" },
  { value: "12K", label: "Curated Listings" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "30+", label: "Cities Worldwide" }
];

const About = () => {
  return (
    <>
      <section className="relative overflow-hidden bg-primary">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.1),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <div className="relative w-full lg:w-[46%]">
          <div className="absolute -left-6 -top-6 hidden h-32 w-32 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg lg:block" />
          <div className="absolute -right-6 bottom-12 hidden h-28 w-28 rounded-full border border-white/10 bg-white/5 backdrop-blur-md lg:block" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <Image
              src={"/assets/images/slider4.jpg"}
              alt="About Awari Homes"
              width={720}
              height={880}
              className="h-full w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 p-4 text-sm text-white backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-secondary-color" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-secondary-color/80">Premium residences</p>
                  <p className="text-base font-semibold text-white">Curated luxury spaces</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPinned className="h-5 w-5 text-secondary-color" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-secondary-color/80">Global reach</p>
                  <p className="text-base font-semibold text-white">Across Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-8 lg:w-[54%]">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-color/40 bg-secondary-color/10 px-4 py-2 text-sm font-medium tracking-wide text-secondary-color">
              <CheckCircle2 className="h-4 w-4" />
              About Awari Homes
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Elevating real estate journeys with trust, technology, and timeless service.
            </h2>
            <p className="text-base text-secondary-color sm:text-lg">
              From boutique residences to large-scale developments, Awari curates spaces that enrich lives. Our platform
              fuses verified market data, modern infrastructure, and a high-touch service model to unlock value for
              homeowners, investors, and partners.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureHighlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 text-white transition hover:border-secondary-color/40 hover:bg-secondary-color/10"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary-color/20 text-secondary-color transition group-hover:bg-secondary-color group-hover:text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-secondary-color">{description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-wrap gap-6 text-white sm:gap-8">
              {performanceStats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold sm:text-4xl">{value}</p>
                  <p className="text-sm text-secondary-color">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-secondary-color/40 bg-secondary-color/10 p-5 text-white">
              <div className="rounded-full bg-secondary-color/20 p-3 text-secondary-color">
                <PhoneIcon size={24} />
              </div>
              <div>
                <p className="text-sm text-secondary-color">Speak with our concierge</p>
                <p className="text-2xl font-semibold text-white">+01 345 67890</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
    
    </>
  );
};

export default About;
