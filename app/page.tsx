import HeroSlider from "@/components/slider/HeroSlider";
import { Navbar } from "@/components/navbar/Navbar";
import Image from "next/image";
import HomeScreen from "./home/page";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    // <div className="bg-white  text-primary flex flex-col gap-5 items-center justify-center w-full h-screen">
    //   <Image
    //   src={'/assets/images/logo.png'}
    //   width={200}
    //   height={100}
    //   className=""
    //   alt="logo"  />
    //    <h1 className="text-3xl text-center font-bold">THE WEBSITE IS UNDER CONSTRUCTION</h1>
    //    <div>
    //     <Image
    //      src="/assets/images/contruction.png"
    //      alt="contruction image"
    //      width={"500"}
    //      height={"300"}
    //      className=""
    //      /></div>
    // </div>

    <div className="">     
      <HomeScreen />
    </div>
  );
}
