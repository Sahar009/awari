"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import { HouseIcon, Building2Icon, UsersIcon } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import Container from "@/components/Container";
import FaqSection from "@/components/about/FaqSection";

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
    "With 20+ years of experience, our experts carefully guide you through every step of your property journey with confidence.",
  imgSrc: "/assets/images/slider6.png",
},
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
      energy levels each day. When you walk into our homes, you’ll see
      thoughtful design that puts people first — and more importantly,
      you’ll feel it deeply.
    </p>
  </div>
</div>


      <div className="flex flex-col items-center w-full gap-10 bg-primary py-10 px-6 rounded-4xl my-12">
        <div className="flex items-center flex-col justify-center gap-5 text=center">
          <h1 className="lg:text-5xl text-4xl font-bold text-white">
            Why <span className="text-orange-500">Choose</span> us?
          </h1>
          <p className="md:text-2xl text-lg font-light text-purple-300 text-center w-full md:w-2/3">
            We are a real estate firm with over 20 years of expertise, and our
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
