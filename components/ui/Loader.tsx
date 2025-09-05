'use client';

import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-purple-200 rounded-full`}></div>
        {/* Spinning gradient ring */}
        <div 
          className={`${sizeClasses[size]} border-4 border-transparent rounded-full animate-spin`}
          style={{
            borderTopColor: '#8b5cf6',
            borderRightColor: '#a855f7',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            background: 'conic-gradient(from 0deg, #8b5cf6, #a855f7, #c084fc, transparent)'
          }}
        ></div>
        {/* Inner glow */}
        <div className={`absolute inset-2 bg-purple-100 rounded-full opacity-20 animate-pulse`}></div>
      </div>
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'} 
                     bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s'
          }}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-ping opacity-75"></div>
      <div className="relative bg-gradient-to-r from-purple-500 to-purple-700 rounded-full w-full h-full flex items-center justify-center">
        <div className="w-1/2 h-1/2 bg-white rounded-full opacity-80"></div>
      </div>
    </div>
  );

  const renderBounce = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={`${size === 'sm' ? 'w-1.5 h-6' : size === 'lg' ? 'w-2 h-10' : size === 'xl' ? 'w-3 h-12' : 'w-2 h-8'} 
                     bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.2s',
            transform: `scaleY(${0.4 + (Math.sin((index * Math.PI) / 4) * 0.6)})`
          }}
        ></div>
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bounce':
        return renderBounce();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && (
        <p className={`${textSizes[size]} font-medium text-slate-600 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loader component
interface PageLoaderProps {
  text?: string;
  variant?: LoaderProps['variant'];
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Loading...', 
  variant = 'spinner' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center p-8">
        <Loader size="xl" variant={variant} text={text} />
        
        {/* Additional decorative elements */}
        <div className="mt-8 flex justify-center space-x-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Auth loading component specifically for authentication checks
export const AuthLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          {/* Main spinner */}
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div 
            className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin"
            style={{
              borderTopColor: '#8b5cf6',
              borderRightColor: '#a855f7',
            }}
          ></div>
          
          {/* Lock icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Verifying Access</h3>
        <p className="text-sm text-slate-600 animate-pulse">Please wait while we check your credentials...</p>
        
        {/* Progress dots */}
        <div className="mt-4 flex justify-center space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${index * 0.3}s`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
