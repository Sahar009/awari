"use client";
import { MailIcon, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import Container from "../Container";
import { Logo } from "../navbar/Logo";
import { Button } from "../ui/Button";

export const Footer = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <Container>
        <div className="w-full gap-8 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-6 group">
            <div className="transform group-hover:scale-105 transition-transform duration-300">
              <Logo />
            </div>
            <p className="text-slate-300 leading-relaxed max-w-xs">
              Discover your perfect property with AWARI Projects. We connect you with verified listings, 
              premium shortlets, and smart property management solutions.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors duration-300 group/item">
                <Phone size={18} className="group-hover/item:scale-110 transition-transform duration-300" />
                <span className="text-sm">+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors duration-300 group/item">
                <MapPin size={18} className="group-hover/item:scale-110 transition-transform duration-300" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors duration-300 group/item">
                <Clock size={18} className="group-hover/item:scale-110 transition-transform duration-300" />
                <span className="text-sm">Mon - Fri: 9AM - 6PM</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 group">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
              Our <span className="font-normal text-white">Services</span>
            </h2>
            <ul className="space-y-3">
              {['Rental', 'Sales', 'Shortlet & Hotels', 'Property Management', 'Investment Advisory'].map((service, index) => (
                <li key={index} className="group/item">
                  <a 
                    href="#" 
                    className="text-slate-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group-hover/item:translate-x-2"
                  >
                    <ArrowRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all duration-300" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6 group">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
              Quick <span className="font-normal text-white">Links</span>
            </h2>
             <ul className="space-y-3">
      {[
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "FAQ", path: "/faq" },
        { name: "Blog", path: "/blog" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Privacy Policy", path: "/privacy" },
      ].map((link, index) => (
        <li key={index} className="group/item">
          <a
            href={link.path}
            className="text-slate-300 hover:text-primary transition-all duration-300 flex items-center gap-2 group-hover/item:translate-x-2"
          >
            <ArrowRight
              size={14}
              className="opacity-0 group-hover/item:opacity-100 transition-all duration-300"
            />
            {link.name}
          </a>
        </li>
      ))}
    </ul>
          </div>

          <div className="flex flex-col gap-6 group">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
              News<span className="font-normal text-white">letter</span>
            </h2>
            <div className="flex flex-col gap-4">
              <p className="text-slate-300 leading-relaxed max-w-xs">
                Subscribe to our newsletter for weekly updates, tips, and exclusive property offers.
              </p>
             
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon size={20} className="text-slate-400 group-focus-within/input:text-primary transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-white placeholder-slate-400"
                />
              </div>
              
              <Button 
                label="Subscribe Now" 
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 pb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm font-medium">Follow us:</span>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 bg-slate-800 hover:bg-primary rounded-full text-slate-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-2 bg-slate-800 hover:bg-primary text-slate-300 hover:text-white rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group"
            >
              <span className="text-sm font-medium">Back to Top</span>
              <ArrowRight size={16} className="rotate-[-90deg] group-hover:translate-y-[-2px] transition-transform duration-300" />
            </button>
          </div>
        </div>
      </Container>
      
      <div className="bg-black/50 py-6 text-center border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-slate-400">
          <p className="text-sm">© 2025 AWARI Projects. All rights reserved.</p>
          <span className="hidden sm:inline">•</span>
          <p className="text-sm">Designed with ❤️ for property seekers</p>
        </div>
      </div>
    </div>
  );
};
