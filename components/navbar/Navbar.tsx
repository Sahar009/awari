"use client";

import { useState, useEffect } from "react";
import { MenuIcon, X, Search, Bell, MessageCircle, Home, Building2, HomeIcon, DollarSign, Hotel, Info, Phone, HelpCircle, User } from "lucide-react";
import { Button } from "../ui/Button";
import { Logo } from "./Logo";
import { useRouter } from 'next/navigation'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const router = useRouter()

  return (
    <>
    
      <div className={`fixed z-50 w-full py-4 transition-all duration-300 ease-out ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-slate-200/50' 
          : 'bg-white shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row items-center justify-between">
            <div className="transform hover:scale-105 transition-transform duration-300">
        <Logo />
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              {[
                { name: "Properties", href: "#properties", description: "Browse listings" },
                { name: "Rentals", href: "#rentals", description: "Find your home" },
                { name: "Sales", href: "#sales", description: "Buy property" },
                { name: "Shortlets", href: "#shortlets", description: "Book stays" },
                { name: "About", href: "#about", description: "Learn more" },
              ].map((item, index) => (
                <div key={item.name} className="group relative">
                  <a
                    href={item.href}
                    className="flex flex-col items-center text-slate-700 hover:text-primary transition-all duration-300 ease-out transform hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInDown 0.6s ease-out forwards'
                    }}
                  >
                    <span className="font-medium text-base relative">
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.description}
                    </span>
                  </a>
                  
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"></div>
                </div>
              ))}
            </div>

        <div className="flex flex-row items-center gap-4">
              <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 cursor-pointer transform hover:scale-110">
                <Search size={20} className="text-slate-600" />
              </div>

              <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 cursor-pointer transform hover:scale-110 relative">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              </div>

              <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 cursor-pointer transform hover:scale-110 relative">
                <MessageCircle size={20} className="text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-color rounded-full animate-pulse"></span>
              </div>

              <div className="hidden lg:flex transform hover:scale-105 transition-transform duration-300">
                <Button 
                  variant="primary" 
                  label="Sign In" 
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push('/auth/login')}
                />
          </div>

              <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              </div>

              <div 
                className="lg:hidden cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-all duration-300 transform hover:scale-110" 
                onClick={() => setIsOpen(true)}
              >
                <MenuIcon size={24} className="text-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="transform hover:scale-105 transition-transform duration-300">
          <Logo />
          </div>
          <div 
            className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-300 cursor-pointer transform hover:scale-110"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} className="text-slate-700" />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-6 py-6">
          {[
            { name: "Home", href: "#home", description: "Welcome to AWARI", icon: Home },
            { name: "Properties", href: "#properties", description: "Browse all listings", icon: Building2 },
            { name: "Rentals", href: "#rentals", description: "Find your perfect home", icon: HomeIcon },
            { name: "Sales", href: "#sales", description: "Buy your dream property", icon: DollarSign },
            { name: "Shortlets & Hotels", href: "#shortlets", description: "Book amazing stays", icon: Hotel },
            { name: "About", href: "#about", description: "Learn about AWARI", icon: Info },
            { name: "Contact", href: "#contact", description: "Get in touch", icon: Phone },
            { name: "FAQ", href: "#faq", description: "Find answers", icon: HelpCircle },
          ].map((item, index) => (
            <a
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary-color/5 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-md"
              onClick={() => setIsOpen(false)}
              style={{
                animationDelay: `${index * 0.05}s`,
                animation: 'slideInLeft 0.6s ease-out forwards'
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-all duration-300">
                <item.icon size={18} className="text-slate-600 group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 group-hover:text-primary transition-colors duration-300">
                  {item.name}
                </span>
                <span className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
                  {item.description}
                </span>
              </div>
            </a>
          ))}
          
          <div className="mt-6 p-4">
            <Button 
              variant="primary" 
              label="Sign Up Now" 
              onClick={() => router.push('/auth/register')}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};
