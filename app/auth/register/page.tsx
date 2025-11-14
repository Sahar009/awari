'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { Logo } from '@/components/navbar/Logo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, googleSignIn, clearError } from '@/store/slices/authSlice';
import { Loader } from '@/components/ui/Loader';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, validationErrors } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: undefined as 'renter' | 'buyer' | 'landlord' | 'agent' | 'hotel_provider' | undefined,
    gender: undefined as 'male' | 'female' | 'other' | undefined
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Rotating notifications
  const notifications = [
    {
      title: "Join Our Community",
      description: "Connect with property experts and fellow investors"
    },
    {
      title: "Exclusive Access",
      description: "Get early access to premium properties and deals"
    },
    {
      title: "Personalized Experience",
      description: "Tailored recommendations based on your preferences"
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance from our dedicated team"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      dispatch(clearError());
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (name === 'role' ? value as 'renter' | 'buyer' | 'landlord' | 'agent' | 'hotel_provider' : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    // Validate role is selected
    if (!formData.role) {
      dispatch(clearError());
      // You might want to set an error here if you have error handling
      return;
    }
    
    try {
      console.log('Starting registration with data:', formData);
      const result = await dispatch(registerUser(formData)).unwrap();
      console.log('Registration successful - Full result:', result);
      
      if (result && result.user && result.token) {
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', formData.email);
        
        console.log('Navigating to verification page...');
        setRegistrationSuccess(true);
        
        // Small delay to show success message then navigate
        setTimeout(() => {
          const targetUrl = `/auth/verify-email?email=${encodeURIComponent(formData.email)}`;
          console.log('Target URL:', targetUrl);
          window.location.href = targetUrl;
        }, 2000);
      } else {
        console.error('Registration response indicates failure:', result);
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    dispatch(clearError());
    
    try {
      const mockGoogleToken = 'mock-google-token';
      await dispatch(googleSignIn({ idToken: mockGoogleToken })).unwrap();
      router.push('/home');
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  // Show success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-purple-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-purple-200/30 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Registration Successful!</h1>
            <p className="text-slate-600 mb-6">
              Please check your email for a verification code. We&apos;re redirecting you to the verification page...
            </p>
            <div className="flex items-center justify-center">
              <Loader size="md" variant="spinner" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-purple-50 to-purple-100 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main Container */}
        <div className="relative w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fadeInDown">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Create Account
            </h1>
            <p className="text-slate-600">
              Join us and discover amazing properties
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-200/30 shadow-2xl animate-fadeInUp">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Google Sign In Button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or sign up with email</span>
                </div>
              </div>
              {/* Basic Information */}
              <div className="space-y-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    First Name *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-3 bg-white/60 border rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                        validationErrors.firstName ? 'border-red-500 focus:border-red-500' : 'border-purple-200/50'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{validationErrors.firstName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Last Name *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-3 bg-white/60 border rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                        validationErrors.lastName ? 'border-red-500 focus:border-red-500' : 'border-purple-200/50'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{validationErrors.lastName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-slate-700">
                    What would you like to do on Awari? *
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role || ''}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-white/60 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none cursor-pointer ${
                        validationErrors.role ? 'border-red-500 focus:border-red-500' : 'border-purple-200/50'
                      }`}
                    >
                      <option value="">Select your role</option>
                      <option value="renter">🏠 Rent a Property</option>
                      <option value="buyer">💰 Buy a Property</option>
                      <option value="landlord">🏘️ List Properties for Rent</option>
                      <option value="agent">👔 Work as a Real Estate Agent</option>
                      <option value="hotel_provider">🏨 Offer Shortlets & Hotels</option>
                    </select>
                    <ArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none -rotate-90" />
                  </div>
                  {validationErrors.role && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validationErrors.role}</span>
                    </p>
                  )}
                  {!validationErrors.role && (
                    <p className="text-xs text-slate-500 mt-1">
                      Choose how you&apos;ll use Awari to help us personalize your experience
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 bg-white/60 border rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                      validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-purple-200/50'
                    }`}
                    placeholder="Enter your email"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validationErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className={`w-full pl-10 pr-12 py-3 bg-white/60 border rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                      validationErrors.password ? 'border-red-500 focus:border-red-500' : 'border-purple-200/50'
                    }`}
                    placeholder="Create a strong password (min 8 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {validationErrors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validationErrors.password}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {(error || Object.keys(validationErrors).length > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  {error && (
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                  )}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <p key={field} className="text-xs text-red-600 flex items-center gap-1">
                          <span>•</span>
                          <span><strong className="capitalize">{field}:</strong> {message}</span>
                        </p>
                      ))}
                    </div>
                  )}
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
