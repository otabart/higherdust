'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';

interface NetworkGuardProps {
  children: React.ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const [isClient, setIsClient] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  
  // Ensure we only render after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until after hydration
  if (!isClient) {
    return null; // or a loading skeleton
  }

  // Network validation logic only runs on client
  const isCorrectNetwork = chainId === base.id || chainId === 84532; // Base mainnet + Base Sepolia
  
  if (isConnected && !isCorrectNetwork) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Wrong Network
          </h2>
                  <p className="text-red-600 mb-4">
          Please switch to Base network (mainnet or Sepolia) to use this app.
        </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 