"use client"

import { useConnect, useAccount, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function WalletConnect() {
  const { connect, connectors, isPending } = useConnect()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const [walletError, setWalletError] = useState<string>("")

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
      }
      
      // If no connectors are marked as ready, try detecting manually
      if (readyConnectors.length === 0 && typeof window !== 'undefined') {
        const { ethereum } = window as any
        
        if (ethereum) {
          // Try to find an injected connector that might work
          const injectedConnector = connectors.find(c => 
            c.id === 'injected' || 
            c.id === 'metaMaskSDK' || 
            c.name === 'MetaMask' ||
            c.name === 'Browser Wallet'
          )
          
          if (injectedConnector) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔗 Using fallback injected connector:', injectedConnector.name)
            }
            await connect({ connector: injectedConnector })
            return
          }
          
          // Try WalletConnect as backup
          const wcConnector = connectors.find(c => c.id === 'walletConnect')
          if (wcConnector) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔗 Using fallback WalletConnect connector')
            }
            await connect({ connector: wcConnector })
            return
          }
        }
        
        // If all else fails, try the first available connector
        const firstConnector = connectors[0]
        if (firstConnector) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔗 Last resort: trying first connector:', firstConnector.name)
          }
          await connect({ connector: firstConnector })
          return
        }
        
        setWalletError("Wallet detected but connection failed. Please try refreshing the page.")
        return
      }

      if (readyConnectors.length === 0) {
        setWalletError("No wallet found. Please install MetaMask, Rainbow, or another Ethereum wallet.")
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

  return (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          SwapDust lets you bulk swap your dusty tokens ($0.10 - $3.00) into HIGHER token
        </p>
      </div>
      <Button 
        onClick={() => handleConnect()}
        disabled={isPending}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm tracking-wide rounded-none"
      >
        {isPending ? "Connecting..." : isFarcasterEnvironment ? "Connect Farcaster Wallet" : "Connect Wallet"}
      </Button>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Debug: {connectors.length} connectors detected
          </p>
        </div>
      )}
      
      {walletError && (
        <p className="font-mono text-xs text-destructive">
          {walletError}
        </p>
      )}
    </div>
  )
}