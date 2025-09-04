"use client";

import { BreadCrumbs } from "@/components/BreadCrumbs";
import MainLayout from "../mainLayout";
import Container from "@/components/Container";
import { MailOpen, MapIcon, PhoneCall } from "lucide-react";

export default function ContactPage() {
  return (
    <MainLayout>
      <BreadCrumbs header="Get in touch" location="Contact" />
      <Container>
        <div className="my-20 w-full flex flex-col gap-16">
          <div className="w-full flex flex-col gap-4 items-center ">
            <p className="text-xl font-light getintouch text-slate-700">Get in Touch</p>
            <h1 className="md:text-4xl text-3xl text-center font-bold text-slate-900">Our Contact Info</h1>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] w-full gap-6">
            <div className="shadow-xl bg-purple-200 transform hover:scale-105 transition-transform duration-300 border-primary p-6 rounded-xl flex flex-row gap-4 items-start  hover:border-b-4 border-pimary">
              <div className="flex bg-primary justify-center items-center p-4 border-0 rounded-full bg">
                <PhoneCall size={25} className="text-purple-200" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-orange-500">
                  Phone Number
                </h2>
                <div className="text-lg font-light">
                  <p >+234 8163863073</p>
                  <p >+234 9065739223</p>
                </div>
              </div>
            </div>
            <div className="shadow-xl bg-purple-200 transform hover:scale-105 transition-transform duration-300 border-primary p-6 rounded-xl flex flex-row gap-4 items-start  hover:border-b-4 border-pimary">
              <div className="flex bg-primary justify-center items-center p-4 border-0 rounded-full bg">
                <MapIcon size={25} className="text-purple-200" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-orange-500">
                  Our Address
                </h2>
                <p className=" text-lg font-light">
                  2690 Hiltona Street Victoria Road, New York, Canada
                </p>
              </div>
            </div>
            <div className="shadow-xl bg-purple-200 transform hover:scale-105 transition-transform duration-300 border-primary p-6 rounded-xl flex flex-row gap-4 items-start  hover:border-b-4 border-pimary">
              <div className="flex bg-primary justify-center items-center p-4 border-0 rounded-full bg">
                <MailOpen size={25} className="text-purple-200" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-orange-500">
                  Email Address
                </h2>
                <div className=" text-lg font-light">
                  <p>mailfrom@awari.com</p>
                  <p >support4573@awari.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
