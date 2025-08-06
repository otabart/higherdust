import { NextRequest, NextResponse } from 'next/server'

interface PriceData {
  address: string
  price: number
  source: string
  timestamp: number
}

interface PriceResponse {
  success: boolean
  prices: PriceData[]
  metadata: {
    totalPrices: number
    sources: string[]
    timestamp: string
    cacheExpiry: string
    errors?: string[]
  }
}

// 🚀 LIVE CACHE: Shorter duration for more dynamic prices
let priceCache: {
  prices: { [address: string]: PriceData }
  timestamp: number
} | null = null

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for live price updates

// 🚀 OPTIMIZED: Faster timeouts for live data
const fetchWithTimeout = async (url: string, timeout: number = 2000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SWAPDUST/1.0',
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// 🚀 LIVE DEXSCREENER: Optimized for real-time prices
const fetchLiveDexScreenerPrices = async (addresses: string[]): Promise<PriceData[]> => {
  try {
    console.log(`📊 LIVE DexScreener fetch for ${addresses.length} addresses...`)
    
    // Larger batches for better efficiency
    const chunkSize = 40
    const chunks = []
    for (let i = 0; i < addresses.length; i += chunkSize) {
      chunks.push(addresses.slice(i, i + chunkSize))
    }
    
    const allPrices: PriceData[] = []
    
    // Parallel processing for maximum speed
    const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
      try {
        console.log(`📦 Processing LIVE chunk ${chunkIndex + 1}/${chunks.length} (${chunk.length} addresses)`)
        
        const addressString = chunk.join(',')
        const response = await fetchWithTimeout(
          `https://api.dexscreener.com/latest/dex/tokens/${addressString}`,
          3000
        )
        
        if (!response.ok) {
          console.warn(`LIVE DexScreener chunk ${chunkIndex + 1} failed: ${response.status}`)
          return []
        }
        
        const data = await response.json()
        const chunkPrices: PriceData[] = []
        
        if (data.pairs) {
          const now = Date.now()
          
          data.pairs.forEach((pair: any) => {
            if (pair.baseToken && pair.priceUsd) {
              const address = pair.baseToken.address.toLowerCase()
              if (chunk.includes(address)) {
                chunkPrices.push({
                  address,
                  price: parseFloat(pair.priceUsd),
                  source: 'dexscreener-live',
                  timestamp: now
                })
              }
            }
          })
        }
        
        console.log(`✅ LIVE chunk ${chunkIndex + 1} found ${chunkPrices.length} prices`)
        return chunkPrices
        
      } catch (error) {
        console.error(`❌ LIVE DexScreener chunk ${chunkIndex + 1} error:`, error)
        return []
      }
    })
    
    // Wait for all chunks in parallel
    const results = await Promise.allSettled(chunkPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allPrices.push(...result.value)
      }
    })
    
    console.log(`✅ LIVE DexScreener complete: ${allPrices.length} prices`)
    return allPrices
    
  } catch (error) {
    console.error('❌ Error in LIVE DexScreener fetch:', error)
    return []
  }
}

// 🚀 LIVE COINGECKO: Optimized for real-time prices
const fetchLiveCoinGeckoPrices = async (addresses: string[]): Promise<PriceData[]> => {
  try {
    console.log(`📊 LIVE CoinGecko fetch for ${addresses.length} addresses...`)
    
    // Optimized batch size for CoinGecko
    const chunkSize = 15
    const chunks = []
    for (let i = 0; i < addresses.length; i += chunkSize) {
      chunks.push(addresses.slice(i, i + chunkSize))
    }
    
    const allPrices: PriceData[] = []
    
    // Parallel with minimal staggering for rate limits
    const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
      try {
        // Minimal stagger for API limits
        await new Promise(resolve => setTimeout(resolve, chunkIndex * 100))
        
        const addressString = chunk.join(',')
        const response = await fetchWithTimeout(
          `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${addressString}&vs_currencies=usd`,
          3000
        )
        
        if (!response.ok) {
          console.warn(`LIVE CoinGecko chunk ${chunkIndex + 1} failed: ${response.status}`)
          return []
        }
        
        const data = await response.json()
        const chunkPrices: PriceData[] = []
        const now = Date.now()
        
        Object.entries(data).forEach(([address, priceData]: [string, any]) => {
          if (priceData.usd) {
            chunkPrices.push({
              address: address.toLowerCase(),
              price: priceData.usd,
              source: 'coingecko-live',
              timestamp: now
            })
          }
        })
        
        console.log(`✅ LIVE CoinGecko chunk ${chunkIndex + 1} found ${chunkPrices.length} prices`)
        return chunkPrices
        
      } catch (error) {
        console.error(`❌ LIVE CoinGecko chunk ${chunkIndex + 1} error:`, error)
        return []
      }
    })
    
    const results = await Promise.allSettled(chunkPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allPrices.push(...result.value)
      }
    })
    
    console.log(`✅ LIVE CoinGecko complete: ${allPrices.length} prices`)
    return allPrices
    
  } catch (error) {
    console.error('❌ Error in LIVE CoinGecko fetch:', error)
    return []
  }
}

// 🚀 LIVE PRICE MERGING: Prioritize most recent data
const mergeLivePrices = (prices: PriceData[][]): PriceData[] => {
  const priceMap = new Map<string, PriceData>()
  
  prices.flat().forEach(price => {
    const existing = priceMap.get(price.address)
    
    if (!existing) {
      priceMap.set(price.address, price)
    } else {
      // Prioritize most recent timestamp for live data
      if (price.timestamp > existing.timestamp) {
        priceMap.set(price.address, price)
      } else if (price.timestamp === existing.timestamp) {
        // If same timestamp, prefer DexScreener for DEX tokens
        if (price.source.includes('dexscreener') && !existing.source.includes('dexscreener')) {
          priceMap.set(price.address, price)
        }
      }
    }
  })
  
  return Array.from(priceMap.values())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { addresses } = body
    
    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: addresses array required'
      }, { status: 400 })
    }
    
    // Increased limit for better batch processing
    const limitedAddresses = addresses.slice(0, 150).map(addr => addr.toLowerCase())
    
    console.log(`🔍 LIVE price request for ${limitedAddresses.length} addresses`)
    
    // 🚀 LIVE CACHE: Only use cache if very recent (2 minutes)
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      const cachedPrices = limitedAddresses
        .map(addr => priceCache!.prices[addr])
        .filter(Boolean)
      
      // Return cached only if we have good coverage (70% for live data)
      if (cachedPrices.length > limitedAddresses.length * 0.7) {
        console.log(`⚡ Returning ${cachedPrices.length} LIVE cached prices (${Math.round(cachedPrices.length / limitedAddresses.length * 100)}% hit rate)`)
        return NextResponse.json({
          success: true,
          prices: cachedPrices,
          metadata: {
            totalPrices: cachedPrices.length,
            sources: ['cache-live'],
            timestamp: new Date(priceCache!.timestamp).toISOString(),
            cacheExpiry: new Date(priceCache!.timestamp + CACHE_DURATION).toISOString()
          }
        } as PriceResponse)
      }
    }
    
    console.log(`🔄 Fetching LIVE prices for ${limitedAddresses.length} addresses...`)
    
    // 🚀 PARALLEL LIVE FETCHING: Both sources simultaneously
    const [dexScreenerPrices, coinGeckoPrices] = await Promise.allSettled([
      fetchLiveDexScreenerPrices(limitedAddresses),
      fetchLiveCoinGeckoPrices(limitedAddresses)
    ])
    
    // Extract successful results
    const allPrices: PriceData[][] = []
    const sources: string[] = []
    const errors: string[] = []
    
    if (dexScreenerPrices.status === 'fulfilled' && dexScreenerPrices.value.length > 0) {
      allPrices.push(dexScreenerPrices.value)
      sources.push('dexscreener-live')
    } else if (dexScreenerPrices.status === 'rejected') {
      errors.push(`LIVE DexScreener failed: ${dexScreenerPrices.reason}`)
    }
    
    if (coinGeckoPrices.status === 'fulfilled' && coinGeckoPrices.value.length > 0) {
      allPrices.push(coinGeckoPrices.value)
      sources.push('coingecko-live')
    } else if (coinGeckoPrices.status === 'rejected') {
      errors.push(`LIVE CoinGecko failed: ${coinGeckoPrices.reason}`)
    }
    
    let prices: PriceData[]
    
    if (allPrices.length > 0) {
      prices = mergeLivePrices(allPrices)
      console.log(`✅ Merged ${prices.length} LIVE prices from ${sources.length} sources`)
    } else {
      prices = []
      console.log('❌ No LIVE prices found from any source')
    }
    
    // 🚀 UPDATE LIVE CACHE
    if (prices.length > 0) {
      const now = Date.now()
      
      // Initialize cache if needed
      if (!priceCache) {
        priceCache = { prices: {}, timestamp: now }
      }
      
      // Update with fresh LIVE prices
      prices.forEach(price => {
        priceCache!.prices[price.address] = price
      })
      
      // Update timestamp
      priceCache.timestamp = now
    }
    
    const response: PriceResponse = {
      success: true,
      prices,
      metadata: {
        totalPrices: prices.length,
        sources,
        timestamp: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + CACHE_DURATION).toISOString(),
        ...(errors.length > 0 && { errors })
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=120', // 2 minutes for live data
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('❌ Error in LIVE price API:', error)
    
    return NextResponse.json({
      success: false,
      prices: [],
      metadata: {
        totalPrices: 0,
        sources: [],
        timestamp: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + CACHE_DURATION).toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error in LIVE price fetch'
      }
    } as PriceResponse, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
} 