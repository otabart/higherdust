"use client"

import { useConnect, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function WalletConnect() {
  const { connect, connectors, isPending } = useConnect()
  const { isConnected } = useAccount()
  const [walletError, setWalletError] = useState<string>("")
  const [detectedWallets, setDetectedWallets] = useState<string[]>([])
  const [connectorStatus, setConnectorStatus] = useState<any[]>([])

  // Enhanced wallet detection and connector debugging
  useEffect(() => {
    console.log('🔍 WalletConnect mounted')
    console.log(`  Total connectors: ${connectors.length}`)
    console.log(`  Ready connectors: ${connectors.filter(c => c.ready).length}`)
    
    // Log detailed connector status
    const status = connectors.map((connector, index) => ({
      index: index + 1,
      name: connector.name,
      ready: connector.ready,
      id: connector.id
    }))
    setConnectorStatus(status)
    console.log('🔍 Connector Status:', status)
    
    if (typeof window !== 'undefined') {
      const wallets: string[] = []
      
      // Check for specific wallet extensions with error handling
      try {
        if (window.ethereum) {
          console.log('🔍 Window.ethereum detected:', {
            exists: !!window.ethereum,
            isMetaMask: window.ethereum.isMetaMask,
            isRainbow: window.ethereum.isRainbow,
            isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
            providers: window.ethereum.providers?.length || 0
          })
          
          if (window.ethereum.isMetaMask) wallets.push('MetaMask')
          if (window.ethereum.isRainbow) wallets.push('Rainbow')
          if (window.ethereum.isCoinbaseWallet) wallets.push('Coinbase Wallet')
          if (window.ethereum.providers) {
            window.ethereum.providers.forEach((provider: any) => {
              if (provider.isMetaMask && !wallets.includes('MetaMask')) wallets.push('MetaMask')
              if (provider.isRainbow && !wallets.includes('Rainbow')) wallets.push('Rainbow')
              if (provider.isCoinbaseWallet && !wallets.includes('Coinbase Wallet')) wallets.push('Coinbase Wallet')
            })
          }
          
          // If no specific wallets detected, add generic browser wallet
          if (wallets.length === 0) wallets.push('Browser Wallet')
        }
      } catch (error) {
        console.log('⚠️ Error detecting wallets (possibly EVM Ask extension conflict):', error)
        wallets.push('Browser Wallet') // Fallback
      }
      
      setDetectedWallets(wallets)
      console.log('🔍 Detected wallets:', wallets)
    }
  }, [connectors])

  const handleConnect = async () => {
    try {
      setWalletError("")
      
      // Find ready connectors
      const readyConnectors = connectors.filter(connector => connector.ready)
      
      if (readyConnectors.length === 0) {
        // Try to connect with any connector, even if not ready
        if (connectors.length > 0) {
          const connector = connectors[0]
          console.log(`🔗 Attempting to connect with non-ready connector: ${connector.name}`)
          await connect({ connector })
          return
        }
        
        setWalletError("No wallet connectors available. Please install a wallet extension (MetaMask, Rainbow, etc.)")
        return
      }

      // Try to connect with the first ready connector
      const connector = readyConnectors[0]
      console.log(`🔗 Attempting to connect with: ${connector.name}`)
      
      await connect({ connector })
      
    } catch (error) {
      console.error('❌ Connection error:', error)
      // Handle Chrome extension errors gracefully
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet"
      if (errorMessage.includes('chrome.runtime.sendMessage')) {
        setWalletError("Wallet extension communication error. Please try refreshing the page or reconnecting.")
      } else {
        setWalletError(errorMessage)
      }
    }
  }

  const handleTestConnection = async () => {
    console.log('🧪 Testing connection manually...')
    console.log('Available connectors:', connectors.map(c => ({ name: c.name, ready: c.ready })))
    
    // Try to connect with any connector, even if not ready
    if (connectors.length > 0) {
      const connector = connectors[0]
      console.log(`🔗 Testing connection with: ${connector.name}`)
      try {
        await connect({ connector })
      } catch (error) {
        console.error('❌ Test connection failed:', error)
        // Don't show Chrome extension errors to user during test
        if (!(error instanceof Error && error.message.includes('chrome.runtime.sendMessage'))) {
          setWalletError(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-green-600">✅ Connected</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleConnect}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </Button>
      
      <Button 
        onClick={handleTestConnection}
        variant="outline"
        size="sm"
        className="w-full"
      >
        Test Connection
      </Button>
      
      {walletError && (
        <p className="text-sm text-red-600 mt-2">
          {walletError}
        </p>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <div>Available: {connectors.filter(c => c.ready).length}/{connectors.length} connectors</div>
        {detectedWallets.length > 0 && (
          <div>Detected: {detectedWallets.join(', ')}</div>
        )}
        {connectorStatus.length > 0 && (
          <div className="mt-1">
            <div>Connector Status:</div>
            {connectorStatus.map((connector, index) => (
              <div key={index} className="ml-2">
                {connector.name}: {connector.ready ? '✅ Ready' : '❌ Not Ready'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
