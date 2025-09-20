'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import MainLayout from '@/app/mainLayout';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, reset }) => {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Error Illustration */}
            <div className="relative mb-8">
              <div className="text-6xl sm:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-20 select-none">
                ERROR
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-6 shadow-2xl border-4 border-red-100">
                  <Bug className="h-16 w-16 text-red-500" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4 mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Something Went Wrong
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                We encountered an unexpected error. Our team has been notified and is working to fix it.
              </p>
              
              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
                  <details className="text-left">
                    <summary className="cursor-pointer font-medium text-red-800 hover:text-red-900">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-2 text-sm text-red-700 font-mono bg-red-100 p-3 rounded border overflow-auto">
                      <div><strong>Message:</strong> {error.message}</div>
                      {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
                      {error.stack && (
                        <div className="mt-2">
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={reset}
                className="group flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="font-semibold">Try Again</span>
              </button>

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
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Need Help?</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Our support team is available 24/7 to help you resolve any issues.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact Us
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </a>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300">
                  <h3 className="font-medium text-gray-900 mb-2">Report Bug</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Help us improve by reporting this issue to our development team.
                  </p>
                  <a
                    href="/contact?subject=bug-report"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    Report Issue
                    <Bug className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Status Code Display */}
            <div className="mt-8 text-sm text-gray-500">
              Error ID: {error.digest || 'Unknown'} • Timestamp: {new Date().toISOString()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ErrorPage;
