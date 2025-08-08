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
      if (preferredConnector) {
        await connect({ connector: preferredConnector })
        return
      }

      // Priority 1: Try Farcaster Mini App connector first
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.name.includes('Farcaster'))
      if (farcasterConnector) {
        await connect({ connector: farcasterConnector })
        return
      }

      // Priority 2: Find ready connectors for fallback
      const readyConnectors = connectors.filter(connector => connector.ready)
      if (readyConnectors.length === 0) {
        setWalletError("No wallet connectors available. Please install a wallet extension.")
        return
      }

      const connector = readyConnectors[0]
      await connect({ connector })
    } catch (error) {
      console.error('Connection failed:', error)
      if (error instanceof Error && !error.message.includes('chrome.runtime.sendMessage')) {
        setWalletError(error.message)
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
        className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm rounded-none"
      >
        {isPending ? "Connecting..." : isFarcasterEnvironment ? "Connect Farcaster Wallet" : "Connect Wallet"}
      </Button>
      
      {walletError && (
        <p className="font-mono text-xs text-destructive">
          {walletError}
        </p>
      )}
    </div>
  )
}