'use client';

import React, { useEffect } from 'react';
import { Home, AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalErrorPage: React.FC<GlobalErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error);
  }, [error]);

  const handleReset = () => {
    // Clear any cached data and reset the application
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
    }
    reset();
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              {/* Error Illustration */}
              <div className="relative mb-8">
                <div className="text-6xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-20 select-none">
                  CRITICAL
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-6 shadow-2xl border-4 border-red-100">
                    <AlertTriangle className="h-16 w-16 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-4 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Critical Application Error
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We&apos;re experiencing a critical error that has affected the entire application. 
                  Our team has been automatically notified and is working to resolve this issue.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button
                  onClick={handleReset}
                  className="group flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="font-semibold">Reset Application</span>
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-semibold">Go to Homepage</span>
                </button>
              </div>

              {/* Error Details */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Information</h2>
                <div className="space-y-3 text-left">
                  <div>
                    <strong className="text-gray-700">Error ID:</strong>
                    <span className="ml-2 font-mono text-sm text-gray-600">
                      {error.digest || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Timestamp:</strong>
                    <span className="ml-2 font-mono text-sm text-gray-600">
                      {new Date().toISOString()}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Message:</strong>
                    <span className="ml-2 text-sm text-gray-600">{error.message}</span>
                  </div>
                </div>
              </div>

              {/* Support Information */}
              <div className="mt-8 text-sm text-gray-500">
                <p>
                  If this error persists, please contact our support team with the Error ID above.
                </p>
                <p className="mt-2">
                  We apologize for any inconvenience this may cause.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
