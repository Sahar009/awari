"use client";
import React, { Suspense } from "react";
import MainLayout from "../mainLayout";
import dynamic from 'next/dynamic';
import { Loader } from "@/components/ui/Loader";

const CardDetails = dynamic(() => import('@/components/property/CardDetails').then(mod => ({ default: mod.CardDetails })), {
  ssr: false,
  loading: () => <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-center"><Loader /></div>
});

const page = () => {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
          <Loader />
        </div>
      }>
        <CardDetails />
      </Suspense>
    </MainLayout>
  );
};
export default page;
