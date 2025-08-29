"use client";
import { CheckCircle2, PhoneIcon } from "lucide-react";
import Image from "next/image";

const About = () => {
  return (
    <div className="bg-primary px-6 py-8 rounded-3xl w-full min-h-screen lg:h-screen flex lg:flex-row flex-col items-center justify-center lg:justify-around">
      <div className="lg:w-[45%] w-full hidden lg:flex">
        <Image
          src={"/assets/images/slider4.jpg"}
          alt="about image"
          width={500}
          height={500}
          className="w-full rounded-2xl"
        />
      </div>
      <div className="lg:w-[45%] w-full flex flex-col gap-3">
        <h4 className="text-lg font-light text-secondary-color">ABOUT US</h4>
        <h2 className="text-4xl lg:text-5xl font-bold text-white">About Our Property</h2>
        <p className="text-xl font-light text-secondary-color ">
          We are a real estate firm with over 20 years of expertise, and our
          main goal is to provide amazing locations to our partners.
        </p>
        <div className="lg:w-[45%] w-full lg:hidden flex">
        <Image
          src={"/assets/images/slider4.jpg"}
          alt="about image"
          width={500}
          height={500}
          className="w-full rounded-2xl"
        />
      </div>
        <div className="border-t-[1px] py-8 mt-10 gap-8 border-secondary-color flex flex-col lg:flex-row  w-full">
        <div className=" text-secondary-color flex flex-col gap-4 w-full lg:w-[50%]">
         <div className="flex gap-2"><CheckCircle2/> <p>Quality real estate services</p></div>
         <div className="flex gap-2"><CheckCircle2/> <p>100% Satisfaction guarantee</p></div>
         <div className="flex gap-2"><CheckCircle2/> <p>Highly professional team</p></div>
         <div className="flex gap-2"><CheckCircle2/> <p>Dealing always on time</p></div>
        </div>

        <div className="flex flex-col items-start justify-center gap-3 w-full lg:w-[50%]">
          <div className=" hover:bg-white rounded-full p-4 bg-secondary-color shadow-md cursor-pointer hover:scale-110 transition"><PhoneIcon  size={25} className="text-primary" /></div>
          <p className="text-secondary-color">Call Us 24/7</p>
          <p className="text-2xl font-bold text-white">+01 345 67890</p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default About;
