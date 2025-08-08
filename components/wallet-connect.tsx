"use client"

import { useConnect, useAccount, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function WalletConnect() {
  const { connect, connectors, isPending } = useConnect()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const [walletError, setWalletError] = useState<string>("")

  // Auto-connect Farcaster wallet when in Farcaster environment
  useEffect(() => {
    const initializeFarcasterAutoConnect = async () => {
      const isFarcasterEnvironment = typeof window !== 'undefined' && (
        window.location.hostname.includes('farcaster') ||
        window.location.hostname.includes('warpcast') ||
        (window as any).webkit?.messageHandlers?.farcaster
      )

      if (isFarcasterEnvironment && !isConnected && !isPending) {
        const farcasterConnector = connectors.find(c => 
          c.id === 'farcasterMiniApp' || 
          c.id === 'farcaster' || 
          c.name.includes('Farcaster')
        )
        
        if (farcasterConnector) {
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log('🎯 Auto-connecting Farcaster wallet...')
            }
            await connect({ connector: farcasterConnector })
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Farcaster auto-connect failed:", error)
            }
          }
        }
      }
    }

    // Delay auto-connect slightly to ensure connectors are ready
    const timer = setTimeout(initializeFarcasterAutoConnect, 500)
    return () => clearTimeout(timer)
  }, [connect, connectors, isConnected, isPending])

  const handleConnect = async (preferredConnector?: any) => {
    try {
      setWalletError("")
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Attempting wallet connection...')
        console.log('Available connectors:', connectors.map(c => ({ 
          id: c.id, 
          name: c.name, 
          ready: c.ready 
        })))
        console.log('Window.ethereum:', typeof window !== 'undefined' ? !!(window as any).ethereum : 'undefined')
      }
      
      if (preferredConnector) {
        await connect({ connector: preferredConnector })
        return
      }

      // Priority 1: Try Farcaster Mini App connector first
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.name.includes('Farcaster'))
      if (farcasterConnector && farcasterConnector.ready) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎯 Using Farcaster connector')
        }
        await connect({ connector: farcasterConnector })
        return
      }

      // Priority 2: Find ready connectors for fallback
      let readyConnectors = connectors.filter(connector => connector.ready)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Ready connectors:', readyConnectors.map(c => c.name))
        console.log('User agent:', navigator.userAgent)
      }
      
      // Detect mobile environment
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // If no connectors are marked as ready, try mobile-first approach
      if (readyConnectors.length === 0) {
        if (isMobile) {
          // Mobile: Prioritize WalletConnect for mobile wallets
          const wcConnector = connectors.find(c => c.id === 'walletConnect')
          if (wcConnector) {
            if (process.env.NODE_ENV === 'development') {
              console.log('📱 Using WalletConnect for mobile')
            }
            await connect({ connector: wcConnector })
            return
          }
          
          // Try Coinbase Wallet for mobile
          const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK')
          if (coinbaseConnector) {
            if (process.env.NODE_ENV === 'development') {
              console.log('📱 Using Coinbase Wallet for mobile')
            }
            await connect({ connector: coinbaseConnector })
            return
          }
        } else {
          // Desktop: Try injected connectors first
          const { ethereum } = window as any
          
          if (ethereum) {
            const injectedConnector = connectors.find(c => 
              c.id === 'injected' || 
              c.id === 'metaMaskSDK' || 
              c.name === 'MetaMask' ||
              c.name === 'Browser Wallet'
            )
            
            if (injectedConnector) {
              if (process.env.NODE_ENV === 'development') {
                console.log('🖥️ Using injected connector for desktop:', injectedConnector.name)
              }
              await connect({ connector: injectedConnector })
              return
            }
          }
          
          // Desktop fallback to WalletConnect
          const wcConnector = connectors.find(c => c.id === 'walletConnect')
          if (wcConnector) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🖥️ Using WalletConnect fallback for desktop')
            }
            await connect({ connector: wcConnector })
            return
          }
        }
        
        // Last resort: try any available connector
        const firstConnector = connectors[0]
        if (firstConnector) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔗 Last resort: trying first connector:', firstConnector.name)
          }
          await connect({ connector: firstConnector })
          return
        }
        
        if (isMobile) {
          setWalletError("To connect on mobile, please install Rainbow, MetaMask, or Coinbase Wallet app.")
        } else {
          setWalletError("No wallet found. Please install MetaMask browser extension or use WalletConnect.")
        }
        return
      }

      const connector = readyConnectors[0]
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Using connector:', connector.name)
      }
      await connect({ connector })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Connection failed:', error)
      }
      
      if (error instanceof Error) {
        // Filter out common extension errors that don't affect functionality
        if (!error.message.includes('chrome.runtime.sendMessage') && 
            !error.message.includes('Extension ID') &&
            !error.message.includes('User rejected')) {
          setWalletError(error.message || 'Failed to connect wallet')
        } else if (error.message.includes('User rejected')) {
          setWalletError('Connection was cancelled')
        }
      } else {
        setWalletError('Failed to connect wallet')
      }
    }
  }

  if (isConnected) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-mono text-xs text-muted-foreground">Connected</span>
          {address && (
            <span className="font-mono text-xs text-foreground">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
        </div>
        <Button 
          onClick={() => disconnect()}
          variant="ghost"
          size="sm"
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  const isFarcasterEnvironment = typeof window !== 'undefined' && (
    window.location.hostname.includes('farcaster') ||
    window.location.hostname.includes('warpcast') ||
    (window as any).webkit?.messageHandlers?.farcaster
  )

  const isMobile = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          SwapDust lets you bulk swap tokens worth $0.10-$5.00 each, with a total value of $2.00-$5.00, into HIGHER token
        </p>
        {isMobile && !isFarcasterEnvironment && (
          <p className="font-mono text-xs text-muted-foreground">
            📱 Install Rainbow, MetaMask, or Coinbase Wallet app first
          </p>
        )}
      </div>
      <Button 
        onClick={() => handleConnect()}
        disabled={isPending}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm tracking-wide rounded-none"
      >
        {isPending ? "Connecting..." : 
         isFarcasterEnvironment ? "Connect Farcaster Wallet" : 
         isMobile ? "Connect Mobile Wallet" : "Connect Wallet"}
      </Button>
      
      {walletError && (
        <p className="font-mono text-xs text-destructive">
          {walletError}
        </p>
      )}
    </div>
  )
}