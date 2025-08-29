"use client";
import Container from "@/components/Container";
import HeroSlider from "../../components/slider/HeroSlider";

import { FeatureList } from "./FeatureList";
import { SearchFilter } from "@/components/SearchFilter";
import { About } from "./About";
import { Service } from "./Service";
import { Testimonial } from "./Testimonial";
import { CardDetails } from "./CardDetails";

export const HomePage = () => {
  return (
    <div className="w-full h-full">
      <div className="relative  w-full rounded-bl-3xl rounded-br-3xl  bg-secondary-color py-10 mb-60 lg:mb-40 ">
        <Container>
          <HeroSlider />
          <div className="absolute w-[85%] mx-auto bottom-[-220px] lg:bottom-[-50px]">
            <SearchFilter />
          </div>
        </Container>
      </div>
      <Container>
        <div className="space-y-10">
          <FeatureList />
          <About />
          <Service />
        </div>
      </Container>
      <Testimonial />
    </div>
  );
};
