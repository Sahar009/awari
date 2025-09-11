"use client";

import { useToast as useToastContext } from './Toast';

// Simple hook for easier usage
export const useToast = () => {
  const { addToast, removeToast, clearAllToasts } = useToastContext();
  
  return {
    success: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'info', title, message, duration }),
    remove: removeToast,
    clear: clearAllToasts,
  };
};

export default useToast;

