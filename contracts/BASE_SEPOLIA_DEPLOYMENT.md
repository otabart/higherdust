# Base Sepolia Deployment Guide

## 🚀 Deploying to Base Sepolia Testnet

### Prerequisites

1. **Private Key**: Export your wallet's private key (the account that will deploy the contracts)
2. **Base Sepolia ETH**: Get some Base Sepolia ETH for gas fees
3. **BaseScan API Key**: Get an API key from [BaseScan Sepolia](https://sepolia.basescan.org/)

### Setup Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
# Base Sepolia Testnet Configuration
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### Get Base Sepolia ETH

You can get Base Sepolia ETH from:
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Base Sepolia Bridge](https://bridge.base.org/)

### Deploy Contracts

```bash
npx hardhat run scripts/deploy-testnet.js --network baseSepolia
```

### Important Notes

⚠️ **Address Updates Required**: The deployment script currently uses placeholder addresses for:
- `HIGHER_TOKEN`: Update with actual HIGHER token address on Base Sepolia
- `ETH_HIGHER_POOL`: Update with actual ETH/HIGHER pool address on Base Sepolia  
- `ETH_USD_PRICE_FEED`: Update with actual Chainlink ETH/USD price feed address on Base Sepolia

### Network Information

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org/
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Testing After Deployment

1. Verify contracts are deployed correctly
2. Test single token swaps
3. Test bulk dust swaps
4. Verify 80/18/2 split is working
5. Check platform fees go to dev wallet

### Contract Verification

The deployment script will automatically attempt to verify contracts on BaseScan Sepolia. If verification fails, you can manually verify using the contract addresses and constructor arguments provided in the deployment output. 