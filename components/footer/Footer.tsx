"use client";
import { MailIcon } from "lucide-react";
import Container from "../Container";
import { Logo } from "../navbar/Logo";
import { Button } from "../ui/Button";

export const Footer = () => {
  return (
    <div>
    <Container>
      <div className="w-full gap-6 py-20 grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-lg font-light">
            Rapidiously myocardinate cross-platform intellectual capital model.
            Appropriately create interactive infrastructures
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-primary">
            {" "}
            Our <span className="font-normal">Services</span>
          </h2>
          <ul className="text-lg font-light space-y-3">
            <li>Rental</li>
            <li>Sales</li>
            <li>Shortlet & Hotels</li>
          </ul>
        </div>

        <div className=" font-bold flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-primary">
            Quick <span className="font-normal">Links</span>
          </h2>
          <ul className="text-lg font-light space-y-3">
            <li>About Us</li>
            <li>Contact</li>
            <li>FAQ</li>
            <li>Blog</li>
            <li>Terms of service</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div className=" font-bold flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-primary">
            News<span className="font-normal">letter</span>
          </h2>
          <div className="flex flex-col gap-4">
            <p className="text-lg font-light ">
              Subscribe to our newsletter to get your weeekly dose of news,
              updates, tips and special offers
            </p>
           
            <div className="w-full px-4 py-2 flex flex-row items-center gap-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition">
              <MailIcon size={20} className="text-secondary-color" />
              <input
                type="text"
                placeholder="saharmbuemo@gmail.com"
                className="w-full outline-none text-primary placeholder:text-secondary-color"
              />
            </div>
            <Button label="Subscribe" />
          </div>
        </div>
      </div>

      
    </Container>
     <div className="bg-secondary-color py-4 text-center">
        <p className="text-sm font-mono">copyright 2025 reserved</p>
     
    </div>
     </div>
  );
};
