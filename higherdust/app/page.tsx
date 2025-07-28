"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { base } from "wagmi/chains"
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/hooks/use-toast"
import { WalletConnect } from "@/components/wallet-connect"
import { strings } from "@/lib/strings"

// Mock dust tokens for demo - in production, this would come from an API
const MOCK_DUST_TOKENS = [
  { address: "0x1234567890123456789012345678901234567890", symbol: "USDC", balance: "2.45", decimals: 6, price: 1.0 },
  {
    address: "0x2345678901234567890123456789012345678901",
    symbol: "WETH",
    balance: "0.0008",
    decimals: 18,
    price: 3200.0,
  },
  { address: "0x3456789012345678901234567890123456789012", symbol: "DAI", balance: "1.23", decimals: 18, price: 1.0 },
  { address: "0x4567890123456789012345678901234567890123", symbol: "USDT", balance: "0.87", decimals: 6, price: 1.0 },
]

const ROUTER_ADDRESS = "0x1234567890123456789012345678901234567890" // Mock router address
const SLIPPAGE_BPS = 300 // 3%

export default function DustSwapApp() {
  const { address, isConnected } = useAccount()
  const [dustTokens] = useState(MOCK_DUST_TOKENS)
  const [isFactsOpen, setIsFactsOpen] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>(MOCK_DUST_TOKENS.map((token) => token.address)) // Start with all selected

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const toggleTokenSelection = (tokenAddress: string) => {
    setSelectedTokens((prev) =>
      prev.includes(tokenAddress) ? prev.filter((addr) => addr !== tokenAddress) : [...prev, tokenAddress],
    )
  }

  const toggleSelectAll = () => {
    const allAddresses = dustTokens.map((token) => token.address)
    setSelectedTokens((prev) => (prev.length === allAddresses.length ? [] : allAddresses))
  }

  const isAllSelected = selectedTokens.length === dustTokens.length

  // Calculate totals for selected tokens only
  const selectedTokensData = dustTokens.filter((token) => selectedTokens.includes(token.address))
  const totalValue = selectedTokensData.reduce((sum, token) => sum + Number.parseFloat(token.balance) * token.price, 0)
  const higherAmount = totalValue * 0.8
  const liquidityAmount = totalValue * 0.2
  const netAfterFees = totalValue * 0.997 // After 0.3% DEX fee
  const minReceived = higherAmount * 0.97 // 3% slippage protection

  useEffect(() => {
    if (isSuccess && hash) {
      setIsSwapping(false)
      toast({
        title: strings.success.title,
        description: strings.success.description,
      })
    }
  }, [isSuccess, hash])

  useEffect(() => {
    if (error) {
      setIsSwapping(false)
      toast({
        title: strings.error.title,
        description: error.message || strings.error.description,
        variant: "destructive",
      })
    }
  }, [error])

  const handleSwap = async () => {
    if (!isConnected || selectedTokens.length === 0) return

    setIsSwapping(true)

    try {
      const tokenAddresses = selectedTokens.map((address) => address as `0x${string}`)

      await writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: [
          {
            name: "bulkSwap",
            type: "function",
            inputs: [
              { name: "tokens", type: "address[]" },
              { name: "slippageBps", type: "uint256" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "bulkSwap",
        args: [tokenAddresses, BigInt(SLIPPAGE_BPS)],
        chainId: base.id,
      })
    } catch (err) {
      setIsSwapping(false)
      console.error("Swap error:", err)
      toast({
        title: strings.error.title,
        description: strings.error.description,
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-black mb-6">{strings.app.title}</h1>
          <WalletConnect />
        </div>
      </div>
    )
  }

  const isLoading = isPending || isConfirming || isSwapping

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[750px] mx-auto p-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <h1 className="text-2xl font-bold text-black mb-2">{strings.app.title}</h1>
            <p className="text-gray-600">{strings.app.subtitle}</p>
          </div>

          {/* Dust Tokens List */}
          <Card className="border border-gray-200 rounded-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-black">{strings.tokens.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-[#00c389] hover:text-[#00a876] hover:bg-gray-50 h-8 px-3"
              >
                {isAllSelected ? strings.tokens.deselectAll : strings.tokens.selectAll}
              </Button>
            </div>

            <div className="space-y-3">
              {dustTokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`token-${index}`}
                      checked={selectedTokens.includes(token.address)}
                      onChange={() => toggleTokenSelection(token.address)}
                      className="w-4 h-4 text-[#00c389] bg-white border-gray-300 rounded focus:ring-[#00c389] focus:ring-2"
                    />
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">{token.symbol[0]}</span>
                    </div>
                    <label htmlFor={`token-${index}`} className="font-medium text-black cursor-pointer">
                      {token.symbol}
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-black">{token.balance}</div>
                    <div className="text-sm text-gray-600">
                      ${(Number.parseFloat(token.balance) * token.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedTokens.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {strings.tokens.selected
                    .replace("{count}", selectedTokens.length.toString())
                    .replace("{total}", dustTokens.length.toString())}
                </div>
              </div>
            )}
          </Card>

          {/* Summary */}
          <Card className="border border-gray-200 rounded-sm p-6 bg-gray-50">
            <p className="text-black text-center">
              {selectedTokens.length > 0
                ? strings.summary.text
                    .replace("{count}", selectedTokens.length.toString())
                    .replace("{value}", totalValue.toFixed(2))
                : strings.summary.noSelection}
            </p>
          </Card>

          {/* Collapsible Facts */}
          <Collapsible open={isFactsOpen} onOpenChange={setIsFactsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border border-gray-200 rounded-sm hover:bg-gray-50"
              >
                <span className="font-medium text-black">{strings.facts.title}</span>
                {isFactsOpen ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="border border-gray-200 rounded-sm p-6 mt-2">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{strings.facts.netAfterFees}</span>
                    <span className="font-medium text-black">${netAfterFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{strings.facts.minReceived}</span>
                    <span className="font-medium text-black">${minReceived.toFixed(2)} HIGHER</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{strings.facts.polShare}</span>
                    <span className="font-medium text-black">${liquidityAmount.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* CTA Button */}
          <Button
            onClick={handleSwap}
            disabled={isLoading || selectedTokens.length === 0}
            className="w-full h-12 bg-[#00c389] hover:bg-[#00a876] text-white font-bold rounded-sm border-0 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {strings.button.loading}
              </div>
            ) : selectedTokens.length === 0 ? (
              strings.button.selectTokens
            ) : (
              strings.button.swap
            )}
          </Button>

          {/* Connected wallet info */}
          <div className="text-center text-sm text-gray-600">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
      </div>
    </div>
  )
}
