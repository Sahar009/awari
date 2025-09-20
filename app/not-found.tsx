'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import MainLayout from '@/app/mainLayout';

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* 404 Illustration */}
            <div className="relative mb-8">
              <div className="text-9xl sm:text-[12rem] lg:text-[16rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-6 shadow-2xl border-4 border-blue-100">
                  <AlertTriangle className="h-16 w-16 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4 mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Oops! Page Not Found
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                The page you&apos;re looking for seems to have wandered off into the digital void. 
                Don&apos;t worry, even the best explorers sometimes take a wrong turn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleGoHome}
                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home className="h-5 w-5" />
                <span className="font-semibold">Go Home</span>
              </button>

              <button
                onClick={handleGoBack}
                className="group flex items-center gap-3 px-8 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">Go Back</span>
              </button>

              <button
                onClick={handleRefresh}
                className="group flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="font-semibold">Refresh</span>
              </button>
            </div>

            {/* Search Suggestions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Search className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Maybe you were looking for:</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/"
                  className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium text-gray-900">Home</h3>
                      <p className="text-sm text-gray-500">Back to the main page</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/browse-listing"
                  className="group p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium text-gray-900">Browse Properties</h3>
                      <p className="text-sm text-gray-500">Find your dream property</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/about"
                  className="group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium text-gray-900">About Us</h3>
                      <p className="text-sm text-gray-500">Learn more about our platform</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/contact"
                  className="group p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="font-medium text-gray-900">Contact Support</h3>
                      <p className="text-sm text-gray-500">Get help from our team</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Fun Facts or Tips */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl mb-2">🏠</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Property Search</h3>
                  <p className="text-sm text-gray-600">Find the perfect home with our advanced filters</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl mb-2">🔑</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Booking</h3>
                  <p className="text-sm text-gray-600">Book properties with just a few clicks</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-2xl mb-2">💬</div>
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-sm text-gray-600">We&apos;re here to help you anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;
