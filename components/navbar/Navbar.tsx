"use client";

import { useState } from "react";
import { MenuIcon, X } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Logo } from "./Logo";
import NavList from "./NavList";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navbar Top */}
      <div className="fixed z-50 bg-white w-full py-5 shadow-xl flex flex-row items-center px-4  justify-between lg:justify-around">
        <Logo />
        <NavList />
        <div className="flex flex-row items-center gap-4">
          <div className="hidden lg:flex">
            <Button variant="primary" label="Sign Up" />
          </div>
          <Avatar />
          {/* Hamburger Menu (only on mobile) */}
          <div className="lg:hidden cursor-pointer" onClick={() => setIsOpen(true)}>
            <MenuIcon size={30} color="#000000" />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header inside sidebar */}
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <Logo />
          <X
            size={28}
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Nav Links */}
        <div className="flex flex-col gap-6 px-6 py-6 font-semibold text-lg">
          {[
            "Home",
            "Rentals",
            "Sales",
            "Shortlets & Hotels",
            "About",
            "Contact",
            "FAQ",
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className="hover:text-blue-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
          <Button variant="primary" label="Sign Up" />
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};
