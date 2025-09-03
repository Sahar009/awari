"use client";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import Sales from "@/pages/sales/Sales";


export default function SalesPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Buy Property" location="Sales" />
      <Sales />
    </MainLayout>
  );
}
