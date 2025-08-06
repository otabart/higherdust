'use client';

import { useEffect } from 'react';

interface DevelopmentErrorSuppressorProps {
  children: React.ReactNode;
}

export function DevelopmentErrorSuppressor({ children }: DevelopmentErrorSuppressorProps) {
  useEffect(() => {
    // Suppress common development errors that don't affect functionality
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress wallet extension errors (common in development)
      if (message.includes('chrome.runtime.sendMessage') || 
          message.includes('Extension ID') ||
          message.includes('wallet extension')) {
        console.warn('⚠️ Wallet extension error suppressed (development only)');
        return;
      }
      
      // Suppress React hydration warnings (common in development)
      if (message.includes('Extra attributes from the server') ||
          message.includes('data-new-gr-c-s-check-loaded')) {
        console.warn('⚠️ React hydration warning suppressed (development only)');
        return;
      }
      
      // Suppress unhandled promise rejections from wallet extensions
      if (message.includes('Unhandled promise rejection') &&
          (message.includes('chrome.runtime') || message.includes('Extension'))) {
        console.warn('⚠️ Wallet extension promise rejection suppressed (development only)');
        return;
      }
      
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress some noisy warnings
      if (message.includes('Download the React DevTools')) {
        return; // Suppress React DevTools suggestion
      }
      
      // Call original console.warn for other warnings
      originalConsoleWarn.apply(console, args);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || '';
      
      if (message.includes('chrome.runtime.sendMessage') || 
          message.includes('Extension ID') ||
          message.includes('wallet extension')) {
        console.warn('⚠️ Wallet extension error detected and suppressed');
        event.preventDefault();
        return;
      }
      
      // For other unhandled rejections, log them but don't break the app
      console.warn('⚠️ Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
} 