"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ReviewCard } from "@/components/ui/ReviewCard";
import Image from "next/image";

// Reviews data (can also be fetched via API later)
const reviews = [
  {
    imageSrc: "/assets/images/user1.png",
    customerName: "Adebayo Ogundimu",
    customerType: "Home Owner",
    content:
      "Working with this team was an absolute pleasure! They delivered exactly what I needed on time and with great quality.",
  },
  {
    imageSrc: "/assets/images/user2.png",
    customerName: "Chioma Nwosu",
    customerType: "Interior Designer",
    content:
      "Their service exceeded my expectations. The attention to detail and communication were excellent.",
  },
  {
    imageSrc: "/assets/images/user3.png",
    customerName: "Kemi Adeleke",
    customerType: "Real Estate Agent",
    content:
      "A very professional and reliable team. I'll definitely recommend them to others.",
  },
  {
    imageSrc: "/assets/images/user4.png",
    customerName: "Folake Adebisi",
    customerType: "Architect",
    content:
      "The creativity and commitment from this team are outstanding. My clients loved the results.",
  },
  {
    imageSrc: "/assets/images/eme.jpg",
    customerName: "Emeka Okafor",
    customerType: "Business Owner",
    content:
      "They understood my vision perfectly and executed it with excellence.",
  },
  {
    imageSrc: "/assets/images/aisha.jpg",
    customerName: "Aisha Bello",
    customerType: "Property Developer",
    content:
      "Their innovative approach and timely delivery made my project a huge success. Highly recommended!",
  },
  {
    imageSrc: "/assets/images/uue.jpg",
    customerName: "Obinna Okwu",
    customerType: "Construction Manager",
    content:
      "Professional, reliable, and detail-oriented. They transformed my vision into reality beyond my expectations.",
  },
  {
    imageSrc: "/assets/images/fat.jpg",
    customerName: "Fatima Ibrahim",
    customerType: "Investment Banker",
    content:
      "The quality of work and customer service is exceptional. They truly understand the Nigerian market.",
  },
  {
    imageSrc: "/assets/images/user9.png",
    customerName: "Tunde Ajayi",
    customerType: "Civil Engineer",
    content:
      "Outstanding professionalism and technical expertise. They delivered exactly what was promised, on time.",
  },
  {
    imageSrc: "/assets/images/user10.png",
    customerName: "Ngozi Okechukwu",
    customerType: "Urban Planner",
    content:
      "Their attention to detail and commitment to excellence sets them apart. A pleasure to work with!",
  },
];

const Testimonial = () => {
  return (
    <div className="h-screen w-full relative mt-12">
      {/* Background image */}
      <Image
        width={1920}
        height={1080}
        src="/assets/images/background34.jpg"
        alt="background"
        className="w-full h-full object-cover"
        priority
      />

      {/* Overlay content */}
      <div className="py-12 bg-black/70 px-6 md:px-20 text-center flex flex-col items-center justify-center gap-2 w-full h-full absolute top-0">
        <h4 className="text-sm font-semibold text-secondary-color uppercase tracking-wide">
          Words from others
        </h4>
        <h1 className="text-5xl font-bold text-white mt-2">
          It is not just us
        </h1>
        <p className="mt-2 mb-8 text-secondary-color">
          Hear what others have to say about us
        </p>

        {/* Swiper carousel */}
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
          {reviews.map((review, index) => (
            <SwiperSlide key={index}>
              <ReviewCard
                imageSrc={review.imageSrc}
                customerName={review.customerName}
                customerType={review.customerType}
                content={review.content}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonial;
