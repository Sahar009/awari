"use client";

import { useState, useEffect } from "react";
import { MenuIcon, X, Search, Bell, MessageCircle, Home, Building2, HomeIcon, DollarSign, Hotel, Info, Phone, HelpCircle, User, LogOut, Settings, UserCircle, ChevronDown, PlusCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Logo } from "./Logo";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);
  
  // Check if user has access (either fully authenticated or has token)
  const hasAccess = isAuthenticated || !!token;

  // Debug logging
  useEffect(() => {
    console.log('Navbar Auth State:', { user, isAuthenticated, isLoading });
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // For now, just use Redux logout
      await dispatch(logoutUser()).unwrap();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
              {(hasAccess ? [
                { name: "Dashboard", href: "/home", description: "Your dashboard" },
                { name: "Properties", href: "#properties", description: "Browse listings" },
                { name: "Sell/Rent", href: "/add-property", description: "List your property" },
                { name: "My Listings", href: "/my-listings", description: "Manage properties" },
                { name: "Favorites", href: "/favorites", description: "Saved properties" },
                { name: "Messages", href: "/messages", description: "Your conversations" },
              ] : [
                { name: "Properties", href: "/browse-listing", description: "Browse listings" },
                { name: "Rentals", href: "/rentals", description: "Find your home" },
                { name: "Sales", href: "/sales", description: "Buy property" },
                { name: "Shortlets", href: "/shortlets", description: "Book stays" },
                { name: "About", href: "/about", description: "Learn more" },
              ]).map((item, index) => (
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
              {/* Search Icon - Always visible */}
              <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 cursor-pointer transform hover:scale-110">
                <Search size={20} className="text-slate-600" />
              </div>

              {/* Conditional rendering based on authentication status */}
              {hasAccess ? (
                <>
                  {/* Notifications */}
                  <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 cursor-pointer transform hover:scale-110 relative">
                    <Bell size={20} className="text-slate-600" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                  </div>

                  {/* Messages */}
                  <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 cursor-pointer transform hover:scale-110 relative">
                    <MessageCircle size={20} className="text-slate-600" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-color rounded-full animate-pulse"></span>
                  </div>

                  {/* User Menu */}
                  <div className="relative user-menu-container">
                    <div 
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-all duration-300 cursor-pointer transform hover:scale-105"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm font-medium text-slate-700">
                          {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-slate-500 transition-transform duration-200 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200/50 backdrop-blur-lg z-50">
                        <div className="p-4 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                              {user?.avatarUrl ? (
                                <img 
                                  src={user.avatarUrl} 
                                  alt="Profile" 
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <a
                            href="/profile"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <UserCircle size={20} className="text-slate-600" />
                            <span className="text-slate-700">Profile</span>
                          </a>
                          
                          <a
                            href="/settings"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings size={20} className="text-slate-600" />
                            <span className="text-slate-700">Settings</span>
                          </a>
                          
                          <a
                            href="/my-listings"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Building2 size={20} className="text-slate-600" />
                            <span className="text-slate-700">My Listings</span>
                          </a>
                          
                          <a
                            href="/favorites"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Home size={20} className="text-slate-600" />
                            <span className="text-slate-700">Favorites</span>
                          </a>
                          
                          <div className="border-t border-slate-200 my-2"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut size={20} className="text-red-600" />
                            <span className="text-red-600">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Sign In Button - Only show when not authenticated */}
                  <div className="hidden lg:flex transform hover:scale-105 transition-transform duration-300">
                    <Button 
                      variant="primary" 
                      label="Sign In" 
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => router.push('/auth/login')}
                    />
                  </div>

                  {/* User Icon - Only show when not authenticated */}
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                </>
              )}

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
          {/* User Profile Section - Only show when authenticated */}
          {hasAccess && (
            <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                  </p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Authentication buttons for non-authenticated users - Top of menu */}
          {!hasAccess && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Join AWARI Today</h3>
              <Button 
                variant="primary" 
                label="Sign In" 
                onClick={() => {
                  router.push('/auth/login');
                  setIsOpen(false);
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              />
              <Button 
                variant="secondary" 
                label="Create Account" 
                onClick={() => {
                  router.push('/auth/register');
                  setIsOpen(false);
                }}
                className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              />
            </div>
          )}

          {(hasAccess ? [
            { name: "Dashboard", href: "/home", description: "Your dashboard", icon: Home },
            { name: "Properties", href: "#properties", description: "Browse all listings", icon: Building2 },
            { name: "Sell/Rent", href: "/add-property", description: "List your property", icon: PlusCircle },
            { name: "My Listings", href: "/my-listings", description: "Manage your properties", icon: HomeIcon },
            { name: "Favorites", href: "/favorites", description: "Saved properties", icon: DollarSign },
            { name: "Messages", href: "/messages", description: "Your conversations", icon: MessageCircle },
            { name: "Profile", href: "/profile", description: "Edit your profile", icon: UserCircle },
            { name: "Settings", href: "/settings", description: "Account settings", icon: Settings },
          ] : [
            { name: "Home", href: "/home", description: "Welcome to AWARI", icon: Home },
            { name: "Properties", href: "/browse-listing", description: "Browse all listings", icon: Building2 },
            { name: "Rentals", href: "/rentals", description: "Find your perfect home", icon: HomeIcon },
            { name: "Sales", href: "/sales", description: "Buy your dream property", icon: DollarSign },
            { name: "Shortlets & Hotels", href: "/shortlets", description: "Book amazing stays", icon: Hotel },
            { name: "About", href: "#about", description: "Learn about AWARI", icon: Info },
            { name: "Contact", href: "/contact", description: "Get in touch", icon: Phone },
            { name: "FAQ", href: "/faq", description: "Find answers", icon: HelpCircle },
          ]).map((item, index) => (
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
          
          {/* Bottom section for authenticated users only */}
          {hasAccess && (
            <div className="mt-6 p-4 space-y-3">
              <Button 
                variant="primary" 
                label="Add Property" 
                onClick={() => {
                  router.push('/add-property');
                  setIsOpen(false);
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              />
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
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
