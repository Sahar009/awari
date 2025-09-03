"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import Shortlets from "@/pages/shortlets/Shortlets";


export default function ShortletsPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Book stay" location="Shortlets" />
       <Shortlets/>
    </MainLayout>
  );
}
