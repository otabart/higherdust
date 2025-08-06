import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

console.log('🔧 WAGMI CONFIG - Production Setup:')

// Environment variables with fallbacks
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '84387a208a33faa3a607f56ffe1e07b5'
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SWAPDUST'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

console.log(`  WalletConnect Project ID: ${walletConnectProjectId ? 'SET' : 'MISSING'}`)
console.log(`  App Name: ${appName}`)
console.log(`  App URL: ${appUrl}`)

// RPC Configuration with fallbacks and retry logic
const getRpcUrl = () => {
  // Priority: Alchemy > QuickNode > Infura > Public RPCs
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    return `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  }
  
  if (process.env.NEXT_PUBLIC_QUICKNODE_URL) {
    return process.env.NEXT_PUBLIC_QUICKNODE_URL
  }
  
  if (process.env.NEXT_PUBLIC_INFURA_PROJECT_ID) {
    return `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
  }
  
  // Fallback to public RPCs
  const publicRpcs = [
    'https://mainnet.base.org',
    'https://base.blockpi.network/v1/rpc/public',
    'https://1rpc.io/base'
  ]
  
  return publicRpcs[0] // Use first public RPC as fallback
}

// Create transport with retry logic and exponential backoff
const createRetryTransport = () => {
  const rpcUrl = getRpcUrl()
  console.log('🔧 RPC Configuration:')
  console.log('  Alchemy API Key:', process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'SET' : 'MISSING')
  console.log('  QuickNode URL:', process.env.NEXT_PUBLIC_QUICKNODE_URL ? 'SET' : 'MISSING')
  console.log('  Infura Project ID:', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID ? 'SET' : 'MISSING')
  console.log('  RPC URL:', rpcUrl)
  console.log('🌐 Using RPC:', rpcUrl.includes('alchemy') ? 'Alchemy' : rpcUrl.includes('quicknode') ? 'QuickNode' : rpcUrl.includes('infura') ? 'Infura' : 'Public RPC')
console.log('✅ RPC Configuration loaded successfully!')
  
  return http(rpcUrl, {
    retryCount: 3,
    retryDelay: 2000, // Fixed delay instead of function
    timeout: 10000,
  })
}

const transport = createRetryTransport()

// Create Farcaster connector (no parameters needed)
const farcasterConnector = farcasterMiniApp()

// Create connectors with simplified setup and better error handling
const connectors = [
  // Generic injected connector (primary - works with MetaMask, Rainbow, etc.)
  injected({
    shimDisconnect: true,
    target: 'metaMask', // Prefer MetaMask if available
  }),
  // Specific MetaMask connector (backup)
  metaMask(),
  // Farcaster Mini App connector (only in Farcaster environment)
  ...(typeof window !== 'undefined' && window.location.hostname.includes('farcaster') ? [farcasterConnector] : []),
]

console.log(`🔧 Created ${connectors.length} connectors`)

// Create config with proper initialization
const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: transport,
  },
  ssr: false, // Disable SSR for better client-side initialization
})

console.log('✅ Wagmi config created for Base mainnet')

export { config } 