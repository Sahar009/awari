"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import About from "@/pages/about/About";


export default function AboutPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Learn about Awari" location="About Us"/>
      <About/>
    </MainLayout>
  );
}
