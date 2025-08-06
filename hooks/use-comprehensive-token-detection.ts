"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'

interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  price?: number
  source: string
}

interface TokenBalance {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: bigint
  balanceFormatted: string
  price?: number
  valueUSD?: number
  source: string
}

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// Cache for token detection results
const MEMORY_CACHE_DURATION = 3 * 60 * 1000 // 3 minutes
let memoryCache: {
  [userAddress: string]: {
    tokens: TokenBalance[]
    timestamp: number
  }
} = {}

export function useComprehensiveTokenDetection() {
  const { address: userAddress, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check for cached tokens
  const getCachedTokens = useCallback((): TokenBalance[] | null => {
    if (!userAddress) return null
    
    const cached = memoryCache[userAddress.toLowerCase()]
    if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_DURATION) {
      return cached.tokens
    }
    
    return null
  }, [userAddress])

  // Fetch token database from API
  const fetchLiveTokenDatabase = useCallback(async (signal: AbortSignal): Promise<TokenInfo[]> => {
    try {
      const response = await fetch('/api/tokens/detect', { signal })
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      return data.tokens || []
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching token database:', error)
      throw error
    }
  }, [])

  // Check user token balances
  const fetchUserTokenBalances = useCallback(async (
    tokenAddresses: string[], 
    signal: AbortSignal
  ): Promise<Map<string, bigint>> => {
    if (!publicClient || !userAddress) {
      return new Map()
    }

    const batchSize = 30
    const balanceMap = new Map<string, bigint>()
    
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      if (signal.aborted) throw new Error('Aborted')
      
      const batch = tokenAddresses.slice(i, i + batchSize)
      
      // Parallel balance checks within batch with retry logic
      const balancePromises = batch.map(async (tokenAddress) => {
        let retries = 3
        let lastError: any
        
        while (retries > 0) {
          try {
            const balance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [userAddress as `0x${string}`],
            })
            
            const balanceBigInt = balance as bigint
            
            if (balanceBigInt > BigInt(0)) {
              return { address: tokenAddress, balance: balanceBigInt }
            } else {
              return { address: tokenAddress, balance: BigInt(0) }
            }
          } catch (error) {
            lastError = error
            retries--
            
            if (retries > 0) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
            }
          }
        }
        
        // All retries failed - skip this token
        console.warn(`Failed to get balance for ${tokenAddress} after 3 retries:`, lastError)
        return { address: tokenAddress, balance: BigInt(0) }
      })

      const results = await Promise.allSettled(balancePromises)
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.balance > BigInt(0)) {
          balanceMap.set(result.value.address, result.value.balance)
        }
      })
      
      // Minimal delay for RPC health
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    return balanceMap
  }, [publicClient, userAddress])



  // Validate tokens
  const validateTokens = useCallback((tokensWithBalances: TokenInfo[]): TokenInfo[] => {
    const validTokens = tokensWithBalances.filter(token => {
      return (
        token.address && 
        token.address.length === 42 && 
        token.address.startsWith('0x') &&
        token.symbol &&
        token.symbol.length > 0
      )
    })
    
    return validTokens
  }, [])

  // Fetch token prices
  const fetchLiveTokenPrices = useCallback(async (
    addresses: string[], 
    signal: AbortSignal
  ): Promise<Map<string, number>> => {
    if (addresses.length === 0) return new Map()
    
    try {
      const response = await fetch('/api/tokens/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
        signal
      })
      
      if (!response.ok) {
        throw new Error(`Price API failed: ${response.status}`)
      }
      
      const data = await response.json()
      const priceMap = new Map<string, number>()
      
      data.prices?.forEach((price: any) => {
        if (price.address && price.price) {
          priceMap.set(price.address.toLowerCase(), price.price)
        }
      })
      
      return priceMap
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching prices:', error)
      return new Map()
    }
  }, [])

  // Main detection function
  const detectAllTokens = useCallback(async () => {
    if (!isConnected || !userAddress) {
      setTokens([])
      return
    }

    // Check for cached data
    const cachedTokens = getCachedTokens()
    if (cachedTokens) {
      setTokens(cachedTokens)
      return
    }

    // Abort any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Fetch token database (API method only - no hardcoded fallbacks)
      const allTokens = await fetchLiveTokenDatabase(signal)
      
      if (allTokens.length === 0) {
        setTokens([])
        setIsLoading(false)
        return
      }
      
      console.log(`📊 Found ${allTokens.length} tokens from API database`)
      
      // Step 4: Check balances for all tokens
      const tokenAddresses = allTokens.map(token => token.address)
      const balanceMap = await fetchUserTokenBalances(tokenAddresses, signal)
      
      // Step 5: Filter to tokens with balances
      const tokensWithBalances = allTokens.filter(token => 
        balanceMap.has(token.address.toLowerCase())
      )
      
      console.log(`💰 Found ${tokensWithBalances.length} tokens with balances`)
      
      if (tokensWithBalances.length === 0) {
        setTokens([])
        setIsLoading(false)
        return
      }
      
      // Step 6: Validate tokens
      const validTokens = validateTokens(tokensWithBalances)
      
      // Step 7: Fetch prices
      const priceAddresses = validTokens.map(token => token.address)
      const priceMap = await fetchLiveTokenPrices(priceAddresses, signal)
      
      // Step 8: Build final token list
      const finalTokens: TokenBalance[] = validTokens.map(token => {
        const balance = balanceMap.get(token.address.toLowerCase()) || BigInt(0)
        const price = priceMap.get(token.address.toLowerCase()) || token.price || 0
        
        const balanceFormatted = formatUnits(balance, token.decimals)
        const valueUSD = price * parseFloat(balanceFormatted)
        
        return {
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balance,
          balanceFormatted,
          price,
          valueUSD,
          source: token.source
        }
      })
      
      // Step 9: Filter to tokens between $0.1-$3 USD (dust range)
      const dustTokens = finalTokens.filter(token => {
        const value = token.valueUSD || 0
        return value >= 0.1 && value <= 3.0
      })
      
      console.log(`💸 Found ${dustTokens.length} tokens between $0.1-$3 USD`)
      
      // Cache the results
      if (userAddress) {
        memoryCache[userAddress.toLowerCase()] = {
          tokens: dustTokens,
          timestamp: Date.now()
        }
      }
      
      setTokens(dustTokens)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      console.error('Token detection error:', error)
      setError(error instanceof Error ? error.message : 'Failed to detect tokens')
      setTokens([])
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, userAddress, getCachedTokens, fetchLiveTokenDatabase, fetchUserTokenBalances, validateTokens, fetchLiveTokenPrices])

  // Clear cache when user changes
  useEffect(() => {
    if (!userAddress) {
      setTokens([])
    }
  }, [userAddress])

  // Auto-detect when wallet connects
  useEffect(() => {
    if (isConnected && userAddress) {
      detectAllTokens()
    } else {
      setTokens([])
    }
  }, [isConnected, userAddress, detectAllTokens])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    tokens,
    isLoading,
    error,
    refetch: detectAllTokens,
  }
}