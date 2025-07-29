"use client"

import { useConnect, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { strings } from "@/lib/strings"

export function WalletConnect() {
  const { connect, connectors, isPending } = useConnect()
  const { isConnected } = useAccount()

  if (isConnected) return null

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.type === "injected")
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleConnect}
        disabled={isPending}
        className="w-full h-12 bg-[#00c389] hover:bg-[#00a876] text-white font-bold rounded-sm border-0"
      >
        {isPending ? "Connecting..." : `${strings.wallet.connect} Wallet`}
      </Button>
      <p className="text-sm text-gray-600 text-center">Make sure you have a Web3 wallet installed</p>
    </div>
  )
}
