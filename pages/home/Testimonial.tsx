"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ReviewCard } from "@/components/ui/ReviewCard";
import Image from "next/image";

// Reviews data (can also be fetched via API later)
const reviews = [
  {
    imageSrc: "/assets/images/profile.png",
    customerName: "James Carter",
    customerType: "Home Owner",
    content:
      "Working with this team was an absolute pleasure! They delivered exactly what I needed on time and with great quality.",
  },
  {
    imageSrc: "/https://randomuser.me/api/portraits/women/44.jpg",
    customerName: "Sophia Johnson",
    customerType: "Interior Designer",
    content:
      "Their service exceeded my expectations. The attention to detail and communication were excellent.",
  },
  {
    imageSrc: "/https://randomuser.me/api/portraits/men/12.jpg",
    customerName: "Michael Smith",
    customerType: "Real Estate Agent",
    content:
      "A very professional and reliable team. I’ll definitely recommend them to others.",
  },
  {
    imageSrc: "/https://randomuser.me/api/portraits/women/68.jpg",
    customerName: "Emily Davis",
    customerType: "Architect",
    content:
      "The creativity and commitment from this team are outstanding. My clients loved the results.",
  },
  {
    imageSrc: "/https://randomuser.me/api/portraits/men/25.jpg",
    customerName: "Daniel Brown",
    customerType: "Business Owner",
    content:
      "They understood my vision perfectly and executed it with excellence.",
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
