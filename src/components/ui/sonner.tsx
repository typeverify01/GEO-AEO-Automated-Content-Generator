"use client";

import * as React from "react";

// Simple toast context and provider for this environment
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: Toast['type'], duration = 5000) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Simple toast function that can be called from anywhere
let globalAddToast: ((message: string, type: Toast['type'], duration?: number) => void) | null = null;

export const toast = {
  success: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'success', duration);
    else console.log('✅', message);
  },
  error: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'error', duration);
    else console.error('❌', message);
  },
  warning: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'warning', duration);
    else console.warn('⚠️', message);
  },
  warn: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'warning', duration);
    else console.warn('⚠️', message);
  },
  info: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast(message, 'info', duration);
    else console.info('ℹ️', message);
  }
};

export function Toaster() {
  const { toasts, addToast, removeToast } = useToast();
  
  // Set the global toast function
  React.useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-80 max-w-md p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <span>✅</span>}
              {toast.type === 'error' && <span>❌</span>}
              {toast.type === 'warning' && <span>⚠️</span>}
              {toast.type === 'info' && <span>ℹ️</span>}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
