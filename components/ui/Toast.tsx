"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Inject keyframes only on client to avoid SSR "document is not defined"
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('toast-progress-keyframes');
    if (existing) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'toast-progress-keyframes';
    styleEl.textContent = `
      @keyframes toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.parentNode?.removeChild(styleEl);
    };
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const normalizedMessage = typeof toast.message === 'string'
      ? toast.message
      : toast.message && typeof toast.message === 'object' && 'message' in toast.message
        ? (toast.message as Error).message
        : toast.message != null
          ? String(toast.message)
          : undefined;
    
    // Ensure duration is always set for auto-removal
    const duration = toast.duration !== undefined ? toast.duration : 5000;
    
    const newToast: Toast = {
      id,
      duration,
      ...toast,
      message: normalizedMessage,
    };
    
    console.log('🍞 Adding new toast:', { id, duration, type: toast.type, title: toast.title });
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-remove after duration with exit animation
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      console.log('🍞 Setting auto-remove timer for toast:', toast.id, 'duration:', toast.duration);
      const timer = setTimeout(() => {
        console.log('🍞 Auto-removing toast:', toast.id, 'after', toast.duration, 'ms');
        setIsLeaving(true);
        // Remove after exit animation completes
        setTimeout(() => {
          console.log('🍞 Actually removing toast:', toast.id);
          onRemove(toast.id);
        }, 300);
      }, toast.duration);
      
      return () => {
        console.log('🍞 Clearing auto-remove timer for toast:', toast.id);
        clearTimeout(timer);
      };
    } else {
      console.log('🍞 Toast has no auto-removal:', toast.id, 'duration:', toast.duration);
    }
  }, [toast.duration, toast.id, onRemove]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 transform";
    
    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }
    
    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100 scale-100`;
    }
    
    return `${baseStyles} translate-x-full opacity-0 scale-95`;
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          container: 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-100/50',
          icon: 'text-emerald-600',
          iconBg: 'bg-emerald-100',
          progress: 'bg-emerald-500'
        };
      case 'error':
        return {
          container: 'bg-red-50/95 border-red-200 text-red-900 shadow-red-100/50',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          container: 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-100/50',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          progress: 'bg-amber-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-100/50',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          progress: 'bg-blue-500'
        };
      default:
        return {
          container: 'bg-slate-50/95 border-slate-200 text-slate-900 shadow-slate-100/50',
          icon: 'text-slate-600',
          iconBg: 'bg-slate-100',
          progress: 'bg-slate-500'
        };
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-emerald-600`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Info className={`${iconClass} text-slate-600`} />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={getToastStyles()}>
      <div className={`p-4 ${styles.container}`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
            {toast.message != null && (
              <p className="text-sm opacity-90 leading-relaxed">{typeof toast.message === 'string' ? toast.message : String(toast.message)}</p>
            )}
            
            {/* Action Button */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress Bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div 
              className={`h-full ${styles.progress} transition-all ease-linear`}
              style={{
                animation: `toast-progress ${toast.duration}ms linear forwards`,
                width: '100%'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Keyframes are injected in a client-only effect inside ToastProvider

// Note: Use useToast hook directly in components instead of these convenience functions

export default ToastItem;
