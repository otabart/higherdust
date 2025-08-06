// Test Configuration for SWAPDUST SplitRouter
// This file contains test addresses and configuration for Base Goerli

module.exports = {
  // Base Goerli Network Configuration
  NETWORK: {
    name: "Base Goerli",
    chainId: 84531,
    rpcUrl: "https://goerli.base.org",
    explorer: "https://goerli.basescan.org"
  },

  // Uniswap V3 Addresses (Base Goerli)
  UNISWAP: {
    FACTORY: "0x33128a8fc17869897dce68ed026d694621f6fdfd",
    ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481",
    QUOTER: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    POSITION_MANAGER: "0x03a520b32C04BF3bE551Fcac6619C22f1B9C6Fd6"
  },

  // Token Addresses (Base Goerli)
  TOKENS: {
    HIGHER: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
  },

  // Pool Addresses
  POOLS: {
    ETH_HIGHER: "0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0"
  },

  // Platform Configuration
  PLATFORM: {
    DEV_WALLET: "0x1831510811Ddd00E6180C345F00F12C4536abaa3",
    SPLIT_80_BPS: 8000, // 80%
    SPLIT_18_BPS: 1800, // 18%
    SPLIT_2_BPS: 200,   // 2%
    SLIPPAGE_BPS: 300,  // 3%
    DUST_THRESHOLD_USD: 3 // $3
  },

  // Test Configuration
  TEST: {
    // Test amounts
    SMALL_AMOUNT: "0.001", // 0.001 ETH
    MEDIUM_AMOUNT: "0.1",  // 0.1 ETH
    LARGE_AMOUNT: "1.0",   // 1.0 ETH
    
    // Dust amounts (below $3 threshold)
    DUST_AMOUNTS: {
      USDC: "1.5",  // $1.50
      DAI: "0.8",   // $0.80
      USDT: "2.5"   // $2.50
    },
    
    // Non-dust amounts (above $3 threshold)
    NON_DUST_AMOUNTS: {
      USDC: "5.0",  // $5.00
      DAI: "10.0",  // $10.00
      USDT: "7.5"   // $7.50
    }
  },

  // Faucet URLs for testing
  FAUCETS: {
    BASE_GOERLI_ETH: "https://www.coinbase.com/faucets/base-ethereum-goerli-faucet",
    ALTERNATIVE_FAUCET: "https://goerlifaucet.com/"
  },

  // Test Scenarios
  TEST_SCENARIOS: [
    {
      name: "Single Token Swap - Small Amount",
      description: "Test single token swap with 0.001 ETH",
      amount: "0.001",
      expectedSplit: {
        toUser: "0.0008",    // 80%
        toLP: "0.00018",     // 18%
        toDev: "0.00002"     // 2%
      }
    },
    {
      name: "Single Token Swap - Medium Amount",
      description: "Test single token swap with 0.1 ETH",
      amount: "0.1",
      expectedSplit: {
        toUser: "0.08",      // 80%
        toLP: "0.018",       // 18%
        toDev: "0.002"       // 2%
      }
    },
    {
      name: "Bulk Dust Swap",
      description: "Test bulk swap of dust tokens (<$3 each)",
      tokens: ["USDC", "DAI", "USDT"],
      amounts: ["1.5", "0.8", "2.5"],
      totalValue: "4.8"
    }
  ],

  // Expected Events
  EVENTS: {
    SWAP_EXECUTED: "SwapExecuted(address,address[],uint256[],uint256,uint256,uint256,uint256,uint256,uint256)",
    BULK_SWAP_EXECUTED: "BulkSwapExecuted(address,address[],uint256,uint256,uint256,uint256)"
  },

  // Error Messages
  ERRORS: {
    ZERO_AMOUNT: "Amount must be greater than 0",
    HIGHER_TO_HIGHER: "Cannot swap HIGHER to HIGHER",
    LENGTH_MISMATCH: "Length mismatch",
    EMPTY_ARRAY: "Empty tokens array",
    INSUFFICIENT_HIGHER: "Insufficient HIGHER received"
  }
}; 