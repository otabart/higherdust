// Contract addresses (Base Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
  // Base Mainnet - Deployed contracts
  SPLIT_ROUTER: "0x07EDd0bf8a04483cFE19a6B0B1d7B755E5B9837D", // NEW: Updated POL recipient contract
  HIGHER_TOKEN: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
  
      // Uniswap V3 on Base mainnet
    UNISWAP_V3_FACTORY: "0x33128a8fc17869897dce68ed026d694621f6fdfd",
    UNISWAP_V3_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481",
    UNISWAP_V3_QUOTER: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    UNISWAP_V3_POSITION_MANAGER: "0x0000000000000000000000000000000000000000",
  
  // Token addresses
  WETH: "0x4200000000000000000000000000000000000006",
  
  // ETH/HIGHER pool (placeholder for testing)
  ETH_HIGHER_POOL: "0x0000000000000000000000000000000000000000",
  
  // Price feeds
  ETH_USD_PRICE_FEED: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
} as const;

// SplitRouter ABI - Updated for proper Uniswap V3 integration
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
  // Function to get swap quote (now uses real Uniswap quotes)
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    name: "getSwapQuote",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Function to get bulk swap quote (now uses real Uniswap quotes)
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
    stateMutability: "nonpayable",
    type: "function",
  },
  // Custom error definitions
  {
    type: "error",
    name: "InsufficientOutputAmount",
    inputs: [
      { name: "expected", type: "uint256" },
      { name: "received", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "AmountTooSmall",
    inputs: [{ name: "amount", type: "uint256" }]
  },
  {
    type: "error",
    name: "SwapOutputWouldBeZero",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientHigherBalance",
    inputs: [
      { name: "required", type: "uint256" },
      { name: "available", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "ArithmeticOverflow",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidTokenAddress",
    inputs: []
  },
  {
    type: "error",
    name: "CannotSwapHigherToHigher",
    inputs: []
  },
  {
    type: "error",
    name: "ArraysLengthMismatch",
    inputs: []
  },
  {
    type: "error",
    name: "EmptyArrays",
    inputs: []
  },
  // Uniswap V3 Router interface
  {
    type: "function",
    name: "exactInputSingle",
    inputs: [
      { name: "params", type: "tuple", components: [
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "recipient", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMinimum", type: "uint256" },
        { name: "sqrtPriceLimitX96", type: "uint160" }
      ]}
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable"
  },
  // Uniswap V3 Quoter interface
  {
    type: "function",
    name: "quoteExactInputSingle",
    inputs: [
      { name: "params", type: "tuple", components: [
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "amountIn", type: "uint256" },
        { name: "sqrtPriceLimitX96", type: "uint160" }
      ]}
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "error",
    name: "InsufficientOutputAmount",
    inputs: []
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: []
  },
  {
    type: "error",
    name: "ApprovalFailed",
    inputs: []
  },
  // ERC20 standard errors
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      { name: "spender", type: "address" },
      { name: "allowance", type: "uint256" },
      { name: "needed", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "ERC20InsufficientBalance",
    inputs: [
      { name: "sender", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "needed", type: "uint256" }
    ]
  },
  {
    type: "error",
    name: "ERC20InvalidSpender",
    inputs: [{ name: "spender", type: "address" }]
  },
  {
    type: "error",
    name: "ERC20InvalidReceiver",
    inputs: [{ name: "receiver", type: "address" }]
  },
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "allowance", type: "uint256" },
      { name: "needed", type: "uint256" }
    ]
  },
  // Custom contract errors
  {
    type: "error",
    name: "SplitRouterOnlyWorksOnBaseNetwork",
    inputs: []
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

// SplitRouterQuoter ABI
export const SPLIT_ROUTER_QUOTER_ABI = [
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    name: "getSwapQuote",
    outputs: [
      { name: "ethReceived", type: "uint256" },
      { name: "higherToUser", type: "uint256" },
      { name: "ethToLP", type: "uint256" },
      { name: "higherToLP", type: "uint256" },
      { name: "platformFee", type: "uint256" },
      { name: "totalValueUSD", type: "uint256" },
      { name: "priceImpact", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    name: "getBulkSwapQuote",
    outputs: [
      { name: "dustTokens", type: "address[]" },
      { name: "dustAmounts", type: "uint256[]" },
      { name: "totalValueUSD", type: "uint256" },
      { name: "totalHigherReceived", type: "uint256" },
      { name: "totalEthToLP", type: "uint256" },
      { name: "totalHigherToLP", type: "uint256" },
      { name: "totalPlatformFee", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "tokens", type: "address[]" },
    ],
    name: "detectDustTokens",
    outputs: [
      { name: "dustTokens", type: "address[]" },
      { name: "dustAmounts", type: "uint256[]" },
      { name: "totalValueUSD", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
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