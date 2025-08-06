// Contract addresses (Base Sepolia Testnet)
export const CONTRACT_ADDRESSES_TESTNET = {
  // Base Sepolia - Test contracts (will be updated after deployment)
  SPLIT_ROUTER: "0x0000000000000000000000000000000000000000", // TODO: Update after deployment
  HIGHER_TOKEN: "0x0000000000000000000000000000000000000000", // TODO: Update after deployment
  
  // Uniswap V3 on Base Sepolia
  UNISWAP_V3_FACTORY: "0x0227628f3F023bb0B980b67D528571c951c9bC62",
  UNISWAP_V3_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481",
  UNISWAP_V3_QUOTER: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  UNISWAP_V3_POSITION_MANAGER: "0x03a520b32C04BF3bE551Fcac6619C22f1B9C6Fd6",
  
  // Token addresses
  WETH: "0x4200000000000000000000000000000000000006",
  
  // ETH/HIGHER pool (placeholder for testing)
  ETH_HIGHER_POOL: "0x0000000000000000000000000000000000000000",
  
  // Price feeds
  ETH_USD_PRICE_FEED: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
} as const;

// SplitRouter ABI - Same as mainnet
export const SPLIT_ROUTER_ABI = [
  // Main swap function for single token
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "minReceive", type: "uint256" },
    ],
    name: "executeSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Bulk swap function for multiple tokens
  {
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "minReceive", type: "uint256" },
    ],
    name: "executeBulkSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // View function to get swap quote
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    name: "getSwapQuote",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // View function to get bulk swap quote
  {
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    name: "getBulkSwapQuote",
    outputs: [
      { name: "totalAmountOut", type: "uint256" },
      { name: "individualQuotes", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "tokenIn", type: "address" },
      { indexed: false, name: "amountIn", type: "uint256" },
      { indexed: false, name: "amountOut", type: "uint256" },
      { indexed: false, name: "polAmount", type: "uint256" },
      { indexed: false, name: "platformFee", type: "uint256" },
    ],
    name: "SwapExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "tokens", type: "address[]" },
      { indexed: false, name: "amounts", type: "uint256[]" },
      { indexed: false, name: "totalAmountOut", type: "uint256" },
    ],
    name: "BulkSwapExecuted",
    type: "event",
  },
] as const;

// ERC20 ABI for token approvals and balances
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Constants
export const DUST_THRESHOLD_USD = 3; // $3
export const SLIPPAGE_BPS = 300; // 3%
export const SPLIT_80_BPS = 8000; // 80%
export const SPLIT_18_BPS = 1800; // 18%
export const SPLIT_2_BPS = 200; // 2%
export const POOL_FEE = 3000; // 0.3%

// Dev wallet for platform fees
export const DEV_WALLET = "0x1831510811Ddd00E6180C345F00F12C4536abaa3";

// No hardcoded tokens - all tokens come from live APIs 