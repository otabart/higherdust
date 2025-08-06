# SWAPDUST Smart Contracts

## Overview

This directory contains the smart contracts for the SWAPDUST application, which implements a sophisticated 80/20 split router for dust token swapping to HIGHER tokens with Protocol Owned Liquidity (POL) management.

## Architecture

### Core Contracts

1. **SplitRouter.sol** - Main contract handling the 80/20 split logic
2. **SplitRouterQuoter.sol** - Quoter contract for accurate price calculations and dust detection

### Key Features

- ✅ **Accept any ERC-20 on Base** → ETH via Uniswap V3 (0.3% fee tier)
- ✅ **Auto-route via Uniswap's optimal path** to ETH
- ✅ **Execute 80/18/2 split** with slippage protection
- ✅ **80% → HIGHER tokens to user**
- ✅ **18% → 50/50 ETH/HIGHER LP position** in existing Uniswap V3 pool
- ✅ **2% → Platform fee to dev wallet** in ETH
- ✅ **Bulk-swap mode** for dust tokens (<$3 each)
- ✅ **Real-time price feeds** via Chainlink
- ✅ **Transparent fee display** before signing

## Tokenomics Flow (Example: 1 ETH)

```
Input: 1.0000 ETH value (any token)
DEX fee (0.3%): 0.0030 ETH
Net to router: 0.9970 ETH
80% to user: 0.7976 ETH → swap → 7976 $HIGHER
18% to POL: 0.1794 ETH + 1794 $HIGHER (50/50 LP)
2% to dev: 0.0199 ETH (platform fee)
```

## Contract Addresses

### Base Network
- **HIGHER Token**: `0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe`
- **WETH**: `0x4200000000000000000000000000000000000006`
- **ETH/HIGHER Pool**: `0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0`
- **Dev Wallet**: `0x1831510811Ddd00E6180C345F00F12C4536abaa3`

### Uniswap V3 on Base
- **Factory**: `0x33128a8fc17869897dce68ed026d694621f6fdfd`
- **Router**: `0x2626664c2603336E57B271c5C0b26F421741e481`
- **Quoter**: `0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a`
- **Position Manager**: `0x03a520b32C04BF3bE551Fcac6619C22f1B9C6Fd6`

### Price Feeds
- **ETH/USD**: `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70`

## Installation

```bash
cd contracts
npm install
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm run test
```

## Deployment

### Prerequisites

1. Set up environment variables in `.env`:
```env
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASE_GOERLI_RPC_URL=https://goerli.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

2. Ensure you have sufficient ETH for deployment gas fees

### Deploy to Base Mainnet

```bash
npm run deploy:base
```

### Deploy to Base Goerli (Testnet)

```bash
npm run deploy:baseGoerli
```

## Contract Verification

After deployment, contracts are automatically verified on BaseScan. If verification fails, you can manually verify:

```bash
# For SplitRouter
npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS "ROUTER_ADDRESS" "FACTORY_ADDRESS" "POSITION_MANAGER_ADDRESS"

# For SplitRouterQuoter
npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS "QUOTER_ADDRESS" "FACTORY_ADDRESS"
```

## Usage

### Single Token Swap

```solidity
// Execute swap with 80/20 split
splitRouter.executeSwap(
    tokenAddress,    // Input token
    amountIn,        // Amount to swap
    minReceive       // Minimum HIGHER tokens to receive
);
```

### Bulk Dust Swap

```solidity
// Execute bulk swap of dust tokens
splitRouter.executeBulkSwap(
    tokenAddresses,  // Array of dust token addresses
    amounts,         // Array of amounts to swap
    minReceive       // Minimum HIGHER tokens to receive
);
```

### Dust Detection

```solidity
// Detect dust tokens in user's wallet
(dustTokens, dustAmounts, totalValueUSD) = splitRouterQuoter.detectDustTokens(
    userAddress,     // User to check
    tokenAddresses   // Array of tokens to check
);
```

## Security Features

- **ReentrancyGuard** - Prevents reentrancy attacks
- **Ownable** - Admin functions protected
- **Slippage Protection** - Configurable minimum receive amounts
- **Emergency Withdraw** - Owner can recover stuck tokens
- **OpenZeppelin Libraries** - Battle-tested security

## Gas Optimization

- **Single aggregated transaction** for bulk swaps
- **Optimized Solidity version** (0.8.19)
- **Efficient storage patterns**
- **Minimal external calls**

## Events

### SwapExecuted
```solidity
event SwapExecuted(
    address indexed user,
    address[] inputTokens,
    uint256[] inputAmounts,
    uint256 ethReceived,
    uint256 higherToUser,
    uint256 ethToLP,
    uint256 higherToLP,
    uint256 lpTokenId
);
```

### BulkSwapExecuted
```solidity
event BulkSwapExecuted(
    address indexed user,
    address[] dustTokens,
    uint256 totalValueUSD,
    uint256 higherReceived,
    uint256 lpTokenId
);
```

## Frontend Integration

Update your frontend configuration with the deployed contract addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  SPLIT_ROUTER: "DEPLOYED_ROUTER_ADDRESS",
  SPLIT_ROUTER_QUOTER: "DEPLOYED_QUOTER_ADDRESS",
  HIGHER_TOKEN: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
  // ... other addresses
};
```

## License

MIT License - see LICENSE file for details.

## Support

For technical support or questions about the smart contracts, please open an issue in the repository. 