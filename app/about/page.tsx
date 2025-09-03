"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import Image from "next/image";
import Container from "@/components/Container";
import { HouseIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

export default function About() {

  const whyUsData = [
    {
      icon: <HouseIcon size={20} className="text-purple-200" />,
      title: 'Invest Opportunities',
      content: 'All living, dining, kitchen and play areas were devised by attached to the home.',
      imgSrc: '/assets/images/slider4.jpg'
    },
     {
      icon: <HouseIcon size={20}  className="text-purple-200"/>,
      title: 'Invest Opportunities',
      content: 'All living, dining, kitchen and play areas were devised by attached to the home.',
      imgSrc: '/assets/images/slider4.jpg'
    },
     {
      icon: <HouseIcon size={20}  className="text-purple-200"/>,
      title: 'Invest Opportunities',
      content: 'All living, dining, kitchen and play areas were devised by attached to the home.',
      imgSrc: '/assets/images/slider4.jpg'
    }
  ]
  return (
    <MainLayout>
      <BreadCrumbs header="About Us" location="About Us"/>
      <Container>
        <div className="w-full h-full flex flex-col gap-6 py-14">
          <div className="w-full items-center gap-6 flex flex-col lg:justify-between lg:flex-row">
            <div className="space-y-3 w-full lg:w-[45%]]">
              <h1 className="text-3xl md:text-4xl font-bold">
                Awari Vission & Mission
              </h1>
              <p className="text-xl font-normal ">
                You are the center of our process. Your needs, your wants, and
                your goals. We actively listen, always keep it even keel — never
                rushing you or pushing something you don’t need. Full
                transparency is our goal. We stay connected while building your
                home, clearly outlining next steps and collaborating with you to
                select personal design details. From day one, your peace of mind
                is our highest priority.
              </p>
            </div>
            <div className="w-full flex justify-center lg:w-[45%]">
              <Image
                src={"/assets/images/slider2.jpg"}
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
                src={"/assets/images/slider3.jpg"}
                alt="about-image2"
                width={500}
                height={400}
                className="rounded-3xl"
              />
            </div>

            <p className="text-xl font-normal w-full lg:w-[45%]">
              We design homes for how people live. Centered Design is our
              philosophy, our approach to creating spaces that energize and
              inspire. Our floor plan designs focus on three elements: natural
              light, color, and clean air all qualities that support your
              wellbeing and energy levels. When you walk into our homes, you’ll
              see design that puts people first, and more importantly, you’ll
              feel it.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center w-full gap-10 bg-primary py-10 px-6 rounded-4xl my-12">
          <div className="flex items-center flex-col justify-center gap-5 text=center">
            <h1 className="lg:text-5xl text-4xl font-bold text-white">Why  <span className="text-amber-600">Choose</span>  us?</h1>
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
               <p className="text-lg font-light text-purple-200">{data.content}</p>
               <div><Image 
               width={400} 
               height={500}
               src={data.imgSrc} 
               alt="images" 
               className="w-full rounded-2xl"
               /></div>
             </div>
            </SwiperSlide>
          ))}
        </Swiper>

          
        </div>
      </Container>
    </MainLayout>
  );
}
