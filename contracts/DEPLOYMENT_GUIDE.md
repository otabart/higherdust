# 🚀 HigherDust Smart Contract Deployment Guide

## ✅ Pre-Deployment Checklist

Your smart contracts are ready for deployment! Here's what we've accomplished:

- ✅ **Smart Contracts Compiled**: `SplitRouter.sol` and `SplitRouterQuoter.sol`
- ✅ **Tests Passing**: 15/15 tests passing
- ✅ **Base Sepolia Support**: Network configuration added
- ✅ **Deployment Scripts**: Ready for Base Sepolia deployment

## 📋 Deployment Steps

### 1. Set Up Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
# Base Sepolia Testnet Configuration
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 2. Get Required Credentials

**A. Private Key:**
- Export your wallet's private key (the account that will deploy the contracts)
- Make sure this account has some Base Sepolia ETH for gas fees

**B. BaseScan API Key:**
- Go to [BaseScan Sepolia](https://sepolia.basescan.org/)
- Create an account and get an API key for contract verification

### 3. Get Base Sepolia ETH

You'll need some Base Sepolia ETH for deployment. Get it from:
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Base Bridge](https://bridge.base.org/)

### 4. Update Contract Addresses (IMPORTANT)

Before deploying, you need to update the addresses in `scripts/deploy-testnet.js`:

```javascript
// Update these with actual Base Sepolia addresses:
const HIGHER_TOKEN = "0x..."; // Actual HIGHER token address on Base Sepolia
const ETH_HIGHER_POOL = "0x..."; // Actual ETH/HIGHER pool address on Base Sepolia
const ETH_USD_PRICE_FEED = "0x..."; // Actual Chainlink ETH/USD price feed on Base Sepolia
```

### 5. Deploy to Base Sepolia

```bash
npx hardhat run scripts/deploy-testnet.js --network baseSepolia
```

## 🔧 Contract Details

### SplitRouter.sol
- **Purpose**: Main contract for executing 80/18/2 split swaps
- **Functions**: `executeSwap()`, `executeBulkSwap()`, `emergencyWithdraw()`
- **Split Logic**: 80% to user, 18% to LP, 2% to dev wallet

### SplitRouterQuoter.sol
- **Purpose**: Get quotes and detect dust tokens
- **Functions**: `getSwapQuote()`, `getBulkSwapQuote()`, `isDustToken()`
- **Dust Threshold**: $3 USD

## 🧪 Testing After Deployment

1. **Verify Contracts**: Check that contracts are deployed correctly on BaseScan
2. **Test Single Swaps**: Try swapping a single token
3. **Test Bulk Swaps**: Try swapping multiple dust tokens
4. **Verify Split**: Check that 80/18/2 split is working correctly
5. **Check Fees**: Verify platform fees go to dev wallet

## 📊 Network Information

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org/
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

## 🔗 Useful Links

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [BaseScan Sepolia](https://sepolia.basescan.org/)
- [Base Bridge](https://bridge.base.org/)
- [Uniswap V3 on Base](https://app.uniswap.org/)

## 🚨 Important Notes

⚠️ **Address Updates Required**: The deployment script currently uses placeholder addresses. You must update:
- `HIGHER_TOKEN`: Actual HIGHER token address on Base Sepolia
- `ETH_HIGHER_POOL`: Actual ETH/HIGHER pool address on Base Sepolia
- `ETH_USD_PRICE_FEED`: Actual Chainlink ETH/USD price feed address on Base Sepolia

⚠️ **Test First**: Always test on Base Sepolia before deploying to mainnet

⚠️ **Security**: Never share your private key and always use a dedicated deployment wallet

## 🎯 Next Steps

1. Set up your `.env` file
2. Get Base Sepolia ETH
3. Update contract addresses
4. Deploy to Base Sepolia
5. Test thoroughly
6. Deploy to Base mainnet (when ready)

Your smart contracts are ready for deployment! 🚀 