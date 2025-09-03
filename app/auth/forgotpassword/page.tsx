'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {  Mail,  ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/navbar/Logo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, forgotPassword } from '@/store/slices/authSlice';

export default function ForgotPassword() {
     const router = useRouter();
      const dispatch = useAppDispatch();
      const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
      
      const [formData, setFormData] = useState({
        email: '',
      });
      const [currentNotification, setCurrentNotification] = useState(0);
    
      // Rotating notifications
      const notifications = [
        {
          title: "Premium Properties",
          description: "Discover luxury apartments and exclusive real estate opportunities"
        },
        {
          title: "Expert Guidance",
          description: "Get personalized advice from our experienced property consultants"
        },
        {
          title: "Smart Search",
          description: "Advanced filters to find your perfect property match"
        },
        {
          title: "Secure Platform",
          description: "Your data is protected with enterprise-grade security"
        }
      ];
    
      // Rotate notifications every 3 seconds
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentNotification((prev) => (prev + 1) % notifications.length);
        }, 3000);
        return () => clearInterval(interval);
      }, [notifications.length]);
    
      // Redirect if already authenticated
      useEffect(() => {
        if (isAuthenticated) {
          router.push('/home');
        }
      }, [isAuthenticated, router]);
    
      // Clear errors when component unmounts
      useEffect(() => {
        return () => {
          dispatch(clearError());
        };
      }, [dispatch]);
    
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());
        
        try {
          console.log('Starting forgot password with data:', formData);
          const result = await dispatch(forgotPassword(formData)).unwrap();
          console.log('Forgot password successful:', result);
          
          // Store email for reset password page
          localStorage.setItem('pendingResetEmail', formData.email);
          
          console.log('Navigating to reset password page...');
          router.push(`/auth/reset-password?email=${encodeURIComponent(formData.email)}`);
        } catch (error) {
          console.error('Forgot password failed:', error);
        }
      };
    
   
    
  return (
     <div className="min-h-screen flex">
          {/* Left Side - Image with Fade-Changing Notifications */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/assets/images/auth-bg.jpg" 
                alt="Luxury property background" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/40 to-slate-800/60"></div>
            </div>
    
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
    
            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-between h-full p-12">
              {/* Top Section - Logo/Brand */}
              <div className="flex flex-col  justify-center animate-fadeInDown">
                <div className="transform hover:scale-105 transition-transform duration-300">
                <Logo />
                </div>
                <p className="text-xl text-purple-200 font-medium my-8">
                  Premium Property Platform
                </p>
              </div>
    
              {/* Bottom Right - Fade-Changing Notifications */}
              <div className="self-end max-w-sm animate-fadeInUp">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {notifications[currentNotification].title}
                    </h3>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      {notifications[currentNotification].description}
                    </p>
                  </div>
                  
                  {/* Notification Indicators */}
                  <div className="flex justify-center space-x-2 mt-4">
                    {notifications.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          index === currentNotification
                            ? 'bg-purple-400 w-6'
                            : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
    
            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-1000"></div>
              <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping delay-2000"></div>
              <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping delay-3000"></div>
            </div>
          </div>
    
          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-purple-50 to-purple-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
    
            {/* Main Container */}
            <div className="relative w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8 animate-fadeInDown">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                 Forgot Password
                </h1>
                <p className="text-slate-600">
                  Enter the email address you use to open Awari
                </p>
              </div>
    
              {/* Login Form */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-200/30 shadow-2xl animate-fadeInUp">
                <form onSubmit={handleSubmit} className="space-y-6">          
    
                  {/* Email Field */}
                  <div className="space-y-2">
                    {/* <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </label> */}
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/60 border border-purple-200/50 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                
    
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm animate-shake">
                      {error}
                    </div>
                  )}
    
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none group"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Send Reset Code</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    )}
                  </button>
                </form>
    
            
              </div>
            </div>
          </div>
        </div>
  )
}
