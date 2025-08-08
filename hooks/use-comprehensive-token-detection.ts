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

  // Fetch ALL tokens from user's wallet (no filtering)
  const fetchAllWalletTokens = useCallback(async (signal: AbortSignal): Promise<{address: string, balance: bigint}[]> => {
    if (!publicClient || !userAddress) {
      return []
    }

    try {
      console.log('🔍 Scanning wallet for ALL tokens...')
      
      // Get token balances in batches
      const batchSize = 50
      const allTokens: {address: string, balance: bigint}[] = []
      
      // Get comprehensive list of Base tokens from API
      const baseTokensResponse = await fetch('https://api.dexscreener.com/latest/dex/pairs/base?limit=1000', { signal })
      let knownBaseTokens: string[] = []
      
      if (baseTokensResponse.ok) {
        const baseTokensData = await baseTokensResponse.json()
        if (baseTokensData.pairs && Array.isArray(baseTokensData.pairs)) {
          knownBaseTokens = baseTokensData.pairs
            .map((pair: any) => pair.baseToken?.address)
            .filter((address: string) => address && address !== '0x0000000000000000000000000000000000000000')
            .slice(0, 500) // Limit to top 500 tokens for performance
        }
      }
      
      // Add major tokens
      knownBaseTokens = [
        '0x0000000000000000000000000000000000000000', // ETH
        '0x4200000000000000000000000000000000000006', // WETH
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
        '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
        ...knownBaseTokens
      ]
      
      for (let i = 0; i < knownBaseTokens.length; i += batchSize) {
        if (signal.aborted) throw new Error('Aborted')
        
        const batch = knownBaseTokens.slice(i, i + batchSize)
        const balancePromises = batch.map(async (address) => {
          try {
            const balance = await publicClient.readContract({
              address: address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [userAddress as `0x${string}`]
            })
            
            return { address, balance: balance as bigint }
          } catch (error) {
            // Token might not exist or have issues
            return null
          }
        })
        
        const batchResults = await Promise.allSettled(balancePromises)
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value && result.value.balance > BigInt(0)) {
            allTokens.push(result.value)
          }
        })
      }
      
      console.log(`💼 Found ${allTokens.length} tokens with balances > 0`)
      return allTokens
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching wallet tokens:', error)
      return []
    }
  }, [publicClient, userAddress])

  // Fetch token metadata (symbol, name, decimals) for given addresses
  const fetchTokenMetadata = useCallback(async (addresses: string[], signal: AbortSignal): Promise<Map<string, {symbol: string, name: string, decimals: number}>> => {
    if (!publicClient) {
      return new Map()
    }

    try {
      console.log(`📋 Fetching metadata for ${addresses.length} tokens...`)
      
      const metadataMap = new Map<string, {symbol: string, name: string, decimals: number}>()
      
      // ERC20 metadata ABI
      const metadataABI = [
        { name: 'symbol', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
        { name: 'name', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
        { name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' }
      ] as const
      
      const metadataPromises = addresses.map(async (address) => {
        try {
          const [symbol, name, decimals] = await Promise.all([
            publicClient.readContract({
              address: address as `0x${string}`,
              abi: metadataABI,
              functionName: 'symbol'
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi: metadataABI,
              functionName: 'name'
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi: metadataABI,
              functionName: 'decimals'
            })
          ])
          
          return {
            address: address.toLowerCase(),
            metadata: {
              symbol: symbol as string,
              name: name as string,
              decimals: decimals as number
            }
          }
        } catch (error) {
          // Token might not support metadata or have issues
          return {
            address: address.toLowerCase(),
            metadata: {
              symbol: 'UNKNOWN',
              name: 'Unknown Token',
              decimals: 18
            }
          }
        }
      })
      
      const results = await Promise.allSettled(metadataPromises)
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          metadataMap.set(result.value.address, result.value.metadata)
        }
      })
      
      console.log(`✅ Fetched metadata for ${metadataMap.size} tokens`)
      return metadataMap
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching token metadata:', error)
      return new Map()
    }
  }, [publicClient])

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

  // Main detection function - NEW APPROACH: Wallet-first, then API validation
  const detectAllTokens = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !userAddress) {
      setTokens([])
      return
    }

    // Check for cached data (unless forcing refresh)
    if (!forceRefresh) {
      const cachedTokens = getCachedTokens()
      if (cachedTokens) {
        setTokens(cachedTokens)
        return
      }
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
      console.log('🔍 Starting wallet-first token detection...')
      
      // Step 1: Get ALL tokens from user's wallet (no filtering yet)
      console.log('📱 Fetching ALL tokens from wallet...')
      const allWalletTokens = await fetchAllWalletTokens(signal)
      console.log(`💼 Found ${allWalletTokens.length} tokens in wallet`)
      
      if (allWalletTokens.length === 0) {
        setTokens([])
        setIsLoading(false)
        return
      }
      
      // Step 2: Get token metadata (symbol, name, decimals) for wallet tokens
      console.log('📋 Fetching token metadata...')
      const tokenMetadata = await fetchTokenMetadata(allWalletTokens.map(t => t.address), signal)
      
      // Step 3: Build complete token list with metadata
      const tokensWithMetadata = allWalletTokens.map(walletToken => {
        const metadata = tokenMetadata.get(walletToken.address.toLowerCase()) || {
          symbol: 'UNKNOWN',
          name: 'Unknown Token',
          decimals: 18
        }
        
        return {
          address: walletToken.address,
          symbol: metadata.symbol,
          name: metadata.name,
          decimals: metadata.decimals,
          balance: walletToken.balance,
          balanceFormatted: formatUnits(walletToken.balance, metadata.decimals),
          price: 0, // Will be fetched in next step
          valueUSD: 0, // Will be calculated in next step
          source: 'wallet-first'
        }
      })
      
      console.log(`📊 Built ${tokensWithMetadata.length} tokens with metadata`)
      
      // Step 4: Fetch real prices for wallet tokens from APIs
      console.log('💰 Fetching real prices for wallet tokens...')
      const priceAddresses = tokensWithMetadata.map(token => token.address)
      const priceMap = await fetchLiveTokenPrices(priceAddresses, signal)
      
      // Step 5: Calculate USD values and filter by requirements
      const finalTokens: TokenBalance[] = tokensWithMetadata.map(token => {
        const price = priceMap.get(token.address.toLowerCase()) || 0
        const valueUSD = price * parseFloat(token.balanceFormatted)
        
        return {
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balance: token.balance,
          balanceFormatted: token.balanceFormatted,
          price,
          valueUSD,
          source: token.source
        }
      })
      
      // Step 6: Filter to tokens between $0.10-$5.00 USD (eligible range)
      const eligibleTokens = finalTokens.filter(token => {
        const value = token.valueUSD || 0
        return value >= 0.1 && value <= 5.0
      })
      
      console.log(`💸 Found ${eligibleTokens.length} tokens between $0.10-$5.00 USD`)
      
      // Cache the results
      if (userAddress) {
        memoryCache[userAddress.toLowerCase()] = {
          tokens: eligibleTokens,
          timestamp: Date.now()
        }
      }
      
      setTokens(eligibleTokens)
      
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