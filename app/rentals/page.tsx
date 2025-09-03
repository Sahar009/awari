"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import Rental from "@/pages/rentals/Rental";


export default function RentalPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Find Your Home" location="Rentals" />
      <Rental />
    </MainLayout>
  );
}
