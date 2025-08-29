"use client";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navbar/Navbar";
import React from "react";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> 
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
