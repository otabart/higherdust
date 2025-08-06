// Wallet preferences and selection utilities

export interface WalletInfo {
  id: string
  name: string
  priority: number
  description: string
  icon?: string
}

// Define wallet preferences with priority order
export const WALLET_PREFERENCES: WalletInfo[] = [
  {
    id: 'metaMask',
    name: 'MetaMask',
    priority: 1,
    description: 'Most popular Ethereum wallet',
    icon: '🦊'
  },
  {
    id: 'coinbaseWallet',
    name: 'Coinbase Wallet',
    priority: 2,
    description: 'Official Coinbase wallet',
    icon: '🪙'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    priority: 3,
    description: 'Beautiful, simple wallet',
    icon: '🌈'
  },
  {
    id: 'injected',
    name: 'Browser Wallet',
    priority: 4,
    description: 'Brave, Opera, or other browser wallets',
    icon: '🌐'
  }
]

// Get wallet by ID
export function getWalletById(id: string): WalletInfo | undefined {
  return WALLET_PREFERENCES.find(wallet => wallet.id === id)
}

// Get wallet by name
export function getWalletByName(name: string): WalletInfo | undefined {
  return WALLET_PREFERENCES.find(wallet => 
    wallet.name.toLowerCase().includes(name.toLowerCase())
  )
}

// Get preferred wallet order
export function getPreferredWalletOrder(): string[] {
  return WALLET_PREFERENCES
    .sort((a, b) => a.priority - b.priority)
    .map(wallet => wallet.id)
}

// Check if a wallet is preferred
export function isPreferredWallet(walletId: string): boolean {
  return WALLET_PREFERENCES.some(wallet => wallet.id === walletId)
}

// Get wallet display name with icon
export function getWalletDisplayName(walletId: string): string {
  const wallet = getWalletById(walletId)
  if (wallet) {
    return `${wallet.icon} ${wallet.name}`
  }
  return walletId
}

// Log wallet preferences for debugging
export function logWalletPreferences() {
  console.log('🎯 Wallet Preferences:')
  WALLET_PREFERENCES.forEach(wallet => {
    console.log(`   ${wallet.priority}. ${wallet.icon} ${wallet.name} (${wallet.id})`)
    console.log(`      ${wallet.description}`)
  })
} 