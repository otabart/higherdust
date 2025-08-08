import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

console.log('🔧 WAGMI CONFIG - Production Setup:')

// Environment variables with fallbacks
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '84387a208a33faa3a607f56ffe1e07b5'
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SWAPDUST'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://swapdust.vercel.app'

console.log(`  WalletConnect Project ID: ${walletConnectProjectId ? 'SET' : 'MISSING'}`)
console.log(`  App Name: ${appName}`)
console.log(`  App URL: ${appUrl}`)

// RPC Configuration with paid Alchemy and fallback
const getRpcUrl = () => {
  // Priority: Alchemy (paid) > 1rpc.io (fallback)
  if (process.env.NEXT_PUBLIC_BASE_RPC_URL) {
    return process.env.NEXT_PUBLIC_BASE_RPC_URL
  }
  
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    return `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  }
  
  // Fallback to 1rpc.io
  return 'https://1rpc.io/base'
}

// Create transport with retry logic and exponential backoff
const createRetryTransport = () => {
  const rpcUrl = getRpcUrl()
  console.log('🔧 RPC Configuration:')
  console.log('  Base RPC URL:', process.env.NEXT_PUBLIC_BASE_RPC_URL ? 'SET' : 'MISSING')
  console.log('  Alchemy API Key:', process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? 'SET' : 'MISSING')
  console.log('  RPC URL:', rpcUrl)
  console.log('🌐 Using RPC:', rpcUrl.includes('alchemy') ? 'Alchemy' : rpcUrl.includes('1rpc.io') ? '1rpc.io' : 'Custom RPC')
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

// Create connectors with comprehensive mobile and desktop support
const connectors = [
  // Farcaster Mini App connector (PRIORITY - always available for auto-connect)
  farcasterConnector,
  
  // WalletConnect - Universal mobile wallet support (Rainbow, Trust, etc.)
  walletConnect({
    projectId: walletConnectProjectId,
    metadata: {
      name: appName,
      description: 'Swap your dust tokens into HIGHER on Base',
      url: appUrl,
      icons: [`${appUrl}/favicon.ico`]
    },
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'light',
      themeVariables: {
        '--wcm-z-index': '1000'
      }
    }
  }),
  
  // Coinbase Wallet - Popular mobile wallet
  coinbaseWallet({
    appName: appName,
    appLogoUrl: `${appUrl}/favicon.ico`,
    preference: 'all', // Support both mobile app and browser extension
  }),
  
  // Generic injected connector (MetaMask, Rainbow browser extension, etc.)
  injected({
    shimDisconnect: true,
  }),
  
  // Specific MetaMask connector (backup)
  metaMask(),
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