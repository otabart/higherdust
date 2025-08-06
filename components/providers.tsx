'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi-config';
import { Toaster } from '@/components/ui/toaster';
import { validateEnvironment } from '@/lib/env-validation';
import { initializeDevelopmentConfig } from '@/lib/development-config';

// Create a static QueryClient with retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize development configuration and validate environment
  useEffect(() => {
    console.log('🚀 Providers initializing with environment validation...')
    
    // Initialize development-specific configuration
    if (process.env.NODE_ENV === 'development') {
      initializeDevelopmentConfig()
    }
    
    // Validate environment
    validateEnvironment()
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
} 