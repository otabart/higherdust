"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'

// Types for the new MVP flow
interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: bigint
  balanceFormatted: string
  priceUSD?: number
  valueUSD?: number
  isEligible: boolean
  error?: string
}

interface TokenSelection {
  [address: string]: boolean
}

interface SwapValidation {
  isValid: boolean
  message: string
  totalValue: number
  selectedCount: number
}

// ERC-20 ABI for token operations
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  }
] as const

// Cache duration for performance
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const memoryCache: { [key: string]: { tokens: TokenInfo[], timestamp: number } } = {}

export function useComprehensiveTokenDetection() {
  const { address: userAddress, isConnected } = useAccount()
  const publicClient = usePublicClient()
  
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [selectedTokens, setSelectedTokens] = useState<TokenSelection>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [swapValidation, setSwapValidation] = useState<SwapValidation>({
    isValid: false,
    message: '',
    totalValue: 0,
    selectedCount: 0
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check for cached tokens
  const getCachedTokens = useCallback((): TokenInfo[] | null => {
    if (!userAddress) return null
    
    const cached = memoryCache[userAddress.toLowerCase()]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.tokens
    }
    
    return null
  }, [userAddress])

  // Robust on-chain token scanning with RPC fallbacks
  const scanWalletTokens = useCallback(async (signal: AbortSignal): Promise<{address: string, balance: bigint}[]> => {
    if (!publicClient || !userAddress) {
      return []
    }

    try {
      console.log('🔍 Scanning wallet for ERC-20 tokens...')
      
      // Get user's ETH balance
      let ethBalance: bigint
      try {
        ethBalance = await publicClient.getBalance({ 
          address: userAddress as `0x${string}` 
        })
      } catch (error) {
        console.warn('⚠️ Failed to get ETH balance:', error)
        ethBalance = BigInt(0)
      }
      
      const allTokens: {address: string, balance: bigint}[] = []
      
      // Add ETH if user has any
      if (ethBalance > BigInt(0)) {
        allTokens.push({ 
          address: '0x0000000000000000000000000000000000000000', 
          balance: ethBalance 
        })
      }

      // Dynamic token detection using Transfer events with chunked scanning
      let tokenAddresses = new Set<string>()
      
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const startBlock = currentBlock - BigInt(5000) // Last 5k blocks
        const CHUNK_SIZE = 500 // 1RPC allows 500 block range
        
        console.log('📊 Scanning Transfer events in chunks (500 blocks each)...')
        
        let allLogs: any[] = []
        
        // Scan in chunks to avoid "Block range is too large" error
        for (let fromBlock = startBlock; fromBlock < currentBlock; fromBlock += BigInt(CHUNK_SIZE)) {
          const toBlock = fromBlock + BigInt(CHUNK_SIZE - 1) > currentBlock 
            ? currentBlock 
            : fromBlock + BigInt(CHUNK_SIZE - 1)
          
          try {
            console.log(`   Scanning blocks ${fromBlock.toString()} to ${toBlock.toString()}`)
            
            const chunkLogs = await publicClient.getLogs({
              address: userAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'Transfer',
                inputs: [
                  { type: 'address', name: 'from', indexed: true },
                  { type: 'address', name: 'to', indexed: true },
                  { type: 'uint256', name: 'value', indexed: false }
                ]
              },
              fromBlock,
              toBlock
            })
            
            allLogs = allLogs.concat(chunkLogs)
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 100))
            
          } catch (chunkError: any) {
            console.warn(`⚠️ Chunk ${fromBlock.toString()}-${toBlock.toString()} failed:`, chunkError.message)
            // Continue with other chunks
          }
        }
        
        // Extract unique token addresses from all logs
        allLogs.forEach(log => {
          tokenAddresses.add(log.address.toLowerCase())
        })
        
        console.log(`📋 Found ${tokenAddresses.size} unique tokens from Transfer events`)
        
      } catch (error: any) {
        console.error('❌ Transfer event scan failed:', error)
        
        // Check if it's an RPC error with undefined result
        if (error?.response?.data) {
          const responseData = error.response.data
          console.error('🔍 RPC Error Details:', {
            error: responseData.error,
            message: responseData.message,
            code: responseData.code,
            raw: responseData
          })
        }
        
        console.log('📋 No tokens found - user may not have interacted with any tokens recently')
        return allTokens // Return only ETH if any
      }

      // Check balances for found tokens with retry logic
      console.log(`💼 Checking balances for ${tokenAddresses.size} tokens...`)
      
      const balancePromises = Array.from(tokenAddresses).map(async (address) => {
        let retries = 3
        let lastError: any
        
        while (retries > 0) {
          try {
            const balance = await publicClient.readContract({
              address: address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [userAddress as `0x${string}`]
            })
            
            return { address, balance: balance as bigint }
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
        console.warn(`⚠️ Failed to get balance for ${address} after 3 retries:`, lastError)
        
        // Log RPC error details if available
        if (lastError?.response?.data) {
          const responseData = lastError.response.data
          console.error('🔍 RPC Balance Check Error:', {
            address,
            error: responseData.error,
            message: responseData.message,
            code: responseData.code
          })
        }
        
        return null
      })

      const balanceResults = await Promise.allSettled(balancePromises)
      balanceResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value && result.value.balance > BigInt(0)) {
          allTokens.push(result.value)
        }
      })

      console.log(`💼 Found ${allTokens.length} tokens with balances > 0`)
      return allTokens
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error scanning wallet tokens:', error)
      return []
    }
  }, [publicClient, userAddress])

  // Fetch token metadata
  const fetchTokenMetadata = useCallback(async (
    addresses: string[], 
    signal: AbortSignal
  ): Promise<Map<string, {symbol: string, name: string, decimals: number}>> => {
    if (!publicClient || addresses.length === 0) {
      return new Map()
    }

    try {
      console.log(`📋 Fetching metadata for ${addresses.length} tokens...`)
      
      const metadataMap = new Map<string, {symbol: string, name: string, decimals: number}>()
      
      // Fetch metadata for each token with retry logic and null address validation
      const metadataPromises = addresses.map(async (address) => {
        // Validate address first
        if (!address || 
            address === "0x0000000000000000000000000000000000000000" ||
            address === "0x0000000000000000000000000000000000000000") {
          console.warn(`⚠️ Skipping invalid token address: ${address}`)
          return null
        }
        
        // Validate it's a contract
        try {
          const code = await publicClient.getBytecode({ address: address as `0x${string}` })
          if (!code || code === "0x") {
            console.warn(`⚠️ Address ${address} is not a contract`)
            return null
          }
        } catch (error) {
          console.warn(`⚠️ Cannot check contract code for ${address}:`, error)
          return null
        }
        
        let retries = 3
        let lastError: any
        
        while (retries > 0) {
          try {
            const [symbol, name, decimals] = await Promise.all([
              publicClient.readContract({
                address: address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'symbol'
              }),
              publicClient.readContract({
                address: address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'name'
              }),
              publicClient.readContract({
                address: address as `0x${string}`,
                abi: ERC20_ABI,
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
            lastError = error
            retries--
            
            if (retries > 0) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 500 * (3 - retries)))
            }
          }
        }
        
        // All retries failed - use defaults
        console.warn(`⚠️ Failed to get metadata for ${address} after 3 retries:`, lastError)
        return {
          address: address.toLowerCase(),
          metadata: {
            symbol: 'UNKNOWN',
            name: 'Unknown Token',
            decimals: 18
          }
        }
      })

      const results = await Promise.allSettled(metadataPromises)
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value !== null) {
          metadataMap.set(result.value.address, result.value.metadata)
        }
      })

      console.log(`✅ Fetched metadata for ${metadataMap.size} tokens`)
      return metadataMap
      
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      return new Map()
    }
  }, [publicClient])

  // Batch fetch USD prices from APIs
  const fetchTokenPrices = useCallback(async (
    addresses: string[], 
    signal: AbortSignal
  ): Promise<Map<string, number>> => {
    if (addresses.length === 0) {
      return new Map()
    }

    try {
      console.log(`💰 Fetching prices for ${addresses.length} tokens...`)
      
      const priceMap = new Map<string, number>()
      
      // Batch addresses for API calls
      const batchSize = 20
      for (let i = 0; i < addresses.length; i += batchSize) {
        if (signal.aborted) throw new Error('Aborted')
        
        const batch = addresses.slice(i, i + batchSize)
        
        try {
          // Try DexScreener first (Base DEX prices)
          const dexScreenerResponse = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${batch.join(',')}`,
            { signal }
          )
          
          if (dexScreenerResponse.ok) {
            const data = await dexScreenerResponse.json()
            
            if (data.pairs) {
              data.pairs.forEach((pair: any) => {
                if (pair.baseToken?.address && pair.priceUsd) {
                  const address = pair.baseToken.address.toLowerCase()
                  const price = parseFloat(pair.priceUsd)
                  
                  if (price > 0) {
                    priceMap.set(address, price)
                  }
                }
              })
            }
          }
          
          // Fallback to CoinGecko for tokens not found on DexScreener
          const missingTokens = batch.filter(addr => !priceMap.has(addr))
          
          if (missingTokens.length > 0) {
            try {
              const coingeckoResponse = await fetch(
                `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${missingTokens.join(',')}&vs_currencies=usd`,
                { signal }
              )
              
              if (coingeckoResponse.ok) {
                const data = await coingeckoResponse.json()
                
                Object.entries(data).forEach(([address, priceData]: [string, any]) => {
                  if (priceData.usd) {
                    priceMap.set(address.toLowerCase(), priceData.usd)
                  }
                })
              }
            } catch (error) {
              console.warn('⚠️ CoinGecko fallback failed:', error)
            }
          }
          
        } catch (error) {
          console.warn(`⚠️ Price fetch failed for batch ${i}-${i + batchSize}:`, error)
        }
      }

      console.log(`✅ Fetched prices for ${priceMap.size} tokens`)
      return priceMap
      
    } catch (error) {
      console.error('Error fetching token prices:', error)
      return new Map()
    }
  }, [])

  // Main token detection function
  const detectTokens = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !userAddress) {
      setTokens([])
      setSelectedTokens({})
      return
    }

    // Check cache unless forcing refresh
    if (!forceRefresh) {
      const cachedTokens = getCachedTokens()
      if (cachedTokens) {
        setTokens(cachedTokens)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      console.log('🚀 Starting comprehensive token detection...')
      
      // Step 1: Scan wallet for tokens
      const walletTokens = await scanWalletTokens(signal)
      
      if (walletTokens.length === 0) {
        setTokens([])
        setIsLoading(false)
        return
      }

      // Step 2: Get token metadata
      const tokenMetadata = await fetchTokenMetadata(
        walletTokens.map(t => t.address), 
        signal
      )

      // Step 3: Build token list with metadata
      const tokensWithMetadata = walletTokens.map(walletToken => {
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
          priceUSD: 0,
          valueUSD: 0,
          isEligible: false,
          error: undefined
        }
      })

      // Step 4: Fetch prices
      const priceMap = await fetchTokenPrices(
        tokensWithMetadata.map(t => t.address), 
        signal
      )

      // Step 5: Calculate USD values and filter
      const finalTokens: TokenInfo[] = tokensWithMetadata.map(token => {
        const price = priceMap.get(token.address.toLowerCase()) || 0
        const valueUSD = price * parseFloat(token.balanceFormatted)
        const isEligible = valueUSD >= 0.1 && valueUSD <= 5.0

        return {
          ...token,
          priceUSD: price,
          valueUSD,
          isEligible,
          error: price === 0 ? 'No price data available' : undefined
        }
      })

      // Filter to only eligible tokens
      const eligibleTokens = finalTokens.filter(token => token.isEligible)

      console.log(`💸 Found ${eligibleTokens.length} eligible tokens (${finalTokens.length} total)`)

      // Cache results
      if (userAddress) {
        memoryCache[userAddress.toLowerCase()] = {
          tokens: eligibleTokens,
          timestamp: Date.now()
        }
      }

      setTokens(eligibleTokens)
      setSelectedTokens({}) // Reset selection
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Token detection error:', error)
      setError('Failed to detect tokens. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, userAddress, getCachedTokens, scanWalletTokens, fetchTokenMetadata, fetchTokenPrices])

  // Validate swap selection
  const validateSwapSelection = useCallback(() => {
    const selectedAddresses = Object.keys(selectedTokens).filter(addr => selectedTokens[addr])
    const selectedTokenInfos = tokens.filter(token => selectedAddresses.includes(token.address))
    
    const totalValue = selectedTokenInfos.reduce((sum, token) => sum + (token.valueUSD || 0), 0)
    const selectedCount = selectedTokenInfos.length
    
    let isValid = false
    let message = ''
    
    if (selectedCount === 0) {
      message = 'Please select tokens to swap'
    } else if (totalValue < 2.0) {
      message = `Select more tokens to reach the $2.00 minimum (current: $${totalValue.toFixed(2)})`
    } else if (totalValue > 5.0) {
      message = `Remove some tokens to stay under the $5.00 maximum (current: $${totalValue.toFixed(2)})`
    } else {
      isValid = true
      message = `Ready to swap ${selectedCount} tokens worth $${totalValue.toFixed(2)}`
    }
    
    setSwapValidation({
      isValid,
      message,
      totalValue,
      selectedCount
    })
  }, [selectedTokens, tokens])

  // Update validation when selection changes
  useEffect(() => {
    validateSwapSelection()
  }, [validateSwapSelection])

  // Toggle token selection
  const toggleTokenSelection = useCallback((address: string) => {
    setSelectedTokens(prev => ({
      ...prev,
      [address]: !prev[address]
    }))
  }, [])

  // Select all eligible tokens
  const selectAllTokens = useCallback(() => {
    const newSelection: TokenSelection = {}
    tokens.forEach(token => {
      newSelection[token.address] = true
    })
    setSelectedTokens(newSelection)
  }, [tokens])

  // Deselect all tokens
  const deselectAllTokens = useCallback(() => {
    setSelectedTokens({})
  }, [])

  // Get selected tokens for swap
  const getSelectedTokens = useCallback(() => {
    return tokens.filter(token => selectedTokens[token.address])
  }, [tokens, selectedTokens])

  return {
    tokens,
    selectedTokens,
    isLoading,
    error,
    swapValidation,
    detectTokens,
    toggleTokenSelection,
    selectAllTokens,
    deselectAllTokens,
    getSelectedTokens
  }
}