import { NextRequest, NextResponse } from 'next/server'

interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  price?: number
  source: string
}

// Cache for token list (shorter duration for more dynamic updates)
let tokenCache: {
  tokens: TokenInfo[]
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - keep dynamic

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 🚀 FULLY DYNAMIC: Live Base token discovery
const fetchLiveDynamicTokens = async (): Promise<TokenInfo[]> => {
  try {
    console.log('🚀 Starting LIVE dynamic token discovery...')
    
    const tokens: TokenInfo[] = []
    const seenAddresses = new Set<string>()

    // Method 1: Get LIVE trending Base tokens (most efficient for discovery)
    try {
      console.log('📈 Fetching LIVE trending Base tokens...')
      const trendingResponse = await fetchWithTimeout(
        'https://api.dexscreener.com/latest/dex/pairs/base?sort=h24Volume&order=desc&limit=500',
        {},
        5000
      )
      
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json()
        
        if (trendingData.pairs && Array.isArray(trendingData.pairs)) {
          trendingData.pairs.forEach((pair: any) => {
            if (pair.baseToken?.address && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              
              if (!seenAddresses.has(address)) {
                seenAddresses.add(address)
                tokens.push({
                  address,
                  symbol: pair.baseToken.symbol || 'UNKNOWN',
                  name: pair.baseToken.name || 'Unknown Token',
                  decimals: parseInt(pair.baseToken.decimals) || 18,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-live-trending'
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn('⚠️ Live trending tokens failed:', error)
    }

    // Method 2: Get comprehensive Base token list (much more efficient)
    console.log('🔍 Fetching comprehensive Base token list...')
    
    try {
      // Get ALL Base pairs with comprehensive parameters
      const allTokensResponse = await fetchWithTimeout(
        'https://api.dexscreener.com/latest/dex/pairs/base?limit=2000',
        {},
        10000
      )
      
      if (allTokensResponse.ok) {
        const allTokensData = await allTokensResponse.json()
        
        if (allTokensData.pairs && Array.isArray(allTokensData.pairs)) {
          console.log(`📊 Found ${allTokensData.pairs.length} total Base pairs`)
          
          allTokensData.pairs.forEach((pair: any) => {
            if (pair.baseToken?.address && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              
              if (!seenAddresses.has(address)) {
                seenAddresses.add(address)
                tokens.push({
                  address,
                  symbol: pair.baseToken.symbol || 'UNKNOWN',
                  name: pair.baseToken.name || 'Unknown Token',
                  decimals: parseInt(pair.baseToken.decimals) || 18,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-comprehensive'
                })
              }
            }
          })
          
          console.log(`✅ Added ${tokens.length} unique tokens from comprehensive fetch`)
        }
      } else {
        console.warn('⚠️ Comprehensive fetch failed, falling back to trending tokens')
        // Fallback to trending tokens if comprehensive fetch fails
        const trendingResponse = await fetchWithTimeout(
          'https://api.dexscreener.com/latest/dex/pairs/base?sort=h24Volume&order=desc&limit=500',
          {},
          5000
        )
        
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json()
          
          if (trendingData.pairs && Array.isArray(trendingData.pairs)) {
            trendingData.pairs.forEach((pair: any) => {
              if (pair.baseToken?.address && pair.priceUsd) {
                const address = pair.baseToken.address.toLowerCase()
                
                if (!seenAddresses.has(address)) {
                  seenAddresses.add(address)
                  tokens.push({
                    address,
                    symbol: pair.baseToken.symbol || 'UNKNOWN',
                    name: pair.baseToken.name || 'Unknown Token',
                    decimals: parseInt(pair.baseToken.decimals) || 18,
                    price: parseFloat(pair.priceUsd),
                    source: 'dexscreener-trending-fallback'
                  })
                }
              }
            })
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Comprehensive token fetch failed:', error)
      
      // Final fallback to trending tokens
      try {
        console.log('🔄 Using final fallback to trending tokens...')
        const fallbackResponse = await fetchWithTimeout(
          'https://api.dexscreener.com/latest/dex/pairs/base?sort=h24Volume&order=desc&limit=300',
          {},
          5000
        )
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          
          if (fallbackData.pairs && Array.isArray(fallbackData.pairs)) {
            fallbackData.pairs.forEach((pair: any) => {
              if (pair.baseToken?.address && pair.priceUsd) {
                const address = pair.baseToken.address.toLowerCase()
                
                if (!seenAddresses.has(address)) {
                  seenAddresses.add(address)
                  tokens.push({
                    address,
                    symbol: pair.baseToken.symbol || 'UNKNOWN',
                    name: pair.baseToken.name || 'Unknown Token',
                    decimals: parseInt(pair.baseToken.decimals) || 18,
                    price: parseFloat(pair.priceUsd),
                    source: 'dexscreener-final-fallback'
                  })
                }
              }
            })
          }
        }
      } catch (fallbackError) {
        console.error('❌ All token fetch methods failed:', fallbackError)
      }
    }

    // Method 3: Get LIVE new token listings
    try {
      console.log('🆕 Fetching LIVE new Base tokens...')
      const newTokensResponse = await fetchWithTimeout(
        'https://api.dexscreener.com/latest/dex/pairs/base?sort=pairCreatedAt&order=desc&limit=200',
        {},
        4000
      )
      
      if (newTokensResponse.ok) {
        const newTokensData = await newTokensResponse.json()
        
        if (newTokensData.pairs && Array.isArray(newTokensData.pairs)) {
          newTokensData.pairs.forEach((pair: any) => {
            if (pair.baseToken?.address && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              
              if (!seenAddresses.has(address)) {
                seenAddresses.add(address)
                tokens.push({
                  address,
                  symbol: pair.baseToken.symbol || 'UNKNOWN',
                  name: pair.baseToken.name || 'Unknown Token',
                  decimals: parseInt(pair.baseToken.decimals) || 18,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-live-new'
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn('⚠️ Live new tokens failed:', error)
    }
    
    // Method 4: Get tokens by market cap (diverse coverage)
    try {
      console.log('📊 Fetching tokens by market cap...')
      const marketCapResponse = await fetchWithTimeout(
        'https://api.dexscreener.com/latest/dex/pairs/base?sort=marketCap&order=desc&limit=300',
        {},
        4000
      )
      
      if (marketCapResponse.ok) {
        const marketCapData = await marketCapResponse.json()
        
        if (marketCapData.pairs && Array.isArray(marketCapData.pairs)) {
          marketCapData.pairs.forEach((pair: any) => {
            if (pair.baseToken?.address && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              
              if (!seenAddresses.has(address)) {
                seenAddresses.add(address)
                tokens.push({
                  address,
                  symbol: pair.baseToken.symbol || 'UNKNOWN',
                  name: pair.baseToken.name || 'Unknown Token',
                  decimals: parseInt(pair.baseToken.decimals) || 18,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-market-cap'
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn('⚠️ Market cap tokens failed:', error)
    }
    
    // Method 5: Get tokens by liquidity (more diverse)
    try {
      console.log('💧 Fetching tokens by liquidity...')
      const liquidityResponse = await fetchWithTimeout(
        'https://api.dexscreener.com/latest/dex/pairs/base?sort=liquidity&order=desc&limit=200',
        {},
        4000
      )
      
      if (liquidityResponse.ok) {
        const liquidityData = await liquidityResponse.json()
        
        if (liquidityData.pairs && Array.isArray(liquidityData.pairs)) {
          liquidityData.pairs.forEach((pair: any) => {
            if (pair.baseToken?.address && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              
              if (!seenAddresses.has(address)) {
                seenAddresses.add(address)
                tokens.push({
                  address,
                  symbol: pair.baseToken.symbol || 'UNKNOWN',
                  name: pair.baseToken.name || 'Unknown Token',
                  decimals: parseInt(pair.baseToken.decimals) || 18,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-liquidity'
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn('⚠️ Liquidity tokens failed:', error)
    }
    
    // Method 6: Get recent tokens (last 24h)
    try {
      console.log('🕐 Fetching recent tokens...')
      const recentResponse = await fetchWithTimeout(
        'https://api.dexscreener.com/latest/dex/pairs/base?sort=pairCreatedAt&order=desc&limit=150',
        {},
        3000
      )
      
      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        
        if (recentData.pairs && Array.isArray(recentData.pairs)) {
          recentData.pairs.forEach((pair: any) => {
            if (pair.baseToken?.address && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              
              if (!seenAddresses.has(address)) {
                seenAddresses.add(address)
                tokens.push({
                  address,
                  symbol: pair.baseToken.symbol || 'UNKNOWN',
                  name: pair.baseToken.name || 'Unknown Token',
                  decimals: parseInt(pair.baseToken.decimals) || 18,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-recent'
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn('⚠️ Recent tokens failed:', error)
    }

    // Method 7: Removed - now covered by comprehensive fetch above
    
    console.log(`✅ LIVE dynamic discovery found ${tokens.length} tokens`)
    return tokens
    
  } catch (error) {
    console.error('❌ Error in live dynamic token fetch:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clearCache = searchParams.get('clear')
    const forceRefresh = searchParams.get('refresh')
    
    if (clearCache === '1' || forceRefresh === '1') {
      tokenCache = null
      console.log('🗑️ Cache cleared - will fetch LIVE data')
    }
    
    // Check cache first (but with shorter duration for more dynamic updates)
    if (tokenCache && Date.now() - tokenCache.timestamp < CACHE_DURATION) {
      console.log(`⚡ Returning ${tokenCache.tokens.length} cached LIVE tokens`)
      return NextResponse.json({
        success: true,
        tokens: tokenCache.tokens,
        metadata: {
          totalTokens: tokenCache.tokens.length,
          sources: ['cache-live'],
          timestamp: new Date(tokenCache.timestamp).toISOString(),
          cacheExpiry: new Date(tokenCache.timestamp + CACHE_DURATION).toISOString(),
        },
      })
    }
    
    console.log('🔄 Fetching LIVE dynamic tokens...')
    
    // Always fetch live data - no static tokens
    const tokens = await fetchLiveDynamicTokens()
    
    // Cache the LIVE results
    if (tokens.length > 0) {
      tokenCache = {
        tokens,
        timestamp: Date.now()
      }
    }
    
    console.log(`✅ Returning ${tokens.length} LIVE tokens`)
    
    return NextResponse.json({
      success: true,
      tokens,
      metadata: {
        totalTokens: tokens.length,
        sources: ['dexscreener-live'],
        timestamp: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + CACHE_DURATION).toISOString(),
      },
    })
    
  } catch (error) {
    console.error('❌ LIVE API Error:', error)
    
    return NextResponse.json({
      success: false,
      tokens: [],
      metadata: {
        totalTokens: 0,
        sources: [],
        timestamp: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + CACHE_DURATION).toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error in live fetch'
      },
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}