# 🚀 SWAPDUST Production Setup Guide

## **Base Mainnet Deployment**

### **Prerequisites**

1. **Base ETH**: You need Base ETH for gas fees
2. **Private Key**: Your deployment wallet private key
3. **BaseScan API Key**: For contract verification (optional but recommended)

### **Environment Variables**

Create a `.env` file in the `contracts/` directory:

```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: Custom RPC (if you have one)
# BASE_RPC_URL=https://your-custom-rpc.com
```

### **Deployment Steps**

1. **Navigate to contracts directory:**
   ```bash
   cd contracts
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile contracts:**
   ```bash
   npx hardhat compile
   ```

4. **Deploy to Base mainnet:**
   ```bash
   npm run deploy:production
   ```

### **Post-Deployment**

After successful deployment, update your frontend configuration in `lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  SPLIT_ROUTER: "0x...", // Your deployed router address
  HIGHER_TOKEN: "0x...", // Your deployed token address
  UNISWAP_V3_FACTORY: "0x33128a8fc17869897dce68ed026d694621f6fdfd",
  UNISWAP_V3_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481",
  UNISWAP_V3_QUOTER: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  UNISWAP_V3_POSITION_MANAGER: "0x03a520b32C04BF3bE551Fcac6619C22f1B9C6Fd6",
  WETH: "0x4200000000000000000000000000000000000006",
  ETH_HIGHER_POOL: "0x...", // Set after pool creation
} as const;
```

### **Contract Verification**

1. **Automatic verification** (if BASESCAN_API_KEY is set):
   ```bash
   npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS
   ```

2. **Manual verification** on BaseScan:
   - Go to https://basescan.org
   - Search for your contract address
   - Click "Contract" tab
   - Click "Verify and Publish"

### **Testing Production Contracts**

Create a test script to verify your deployed contracts:

```bash
npm run test:contracts
```

### **Frontend Deployment**

1. **Update environment variables:**
   ```env
   NEXT_PUBLIC_APP_NAME=SWAPDUST
   NEXT_PUBLIC_APP_DESCRIPTION=Bulk swap dust tokens to HIGHER on Base
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. **Deploy to your preferred platform:**
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - Or your preferred hosting service

### **Security Checklist**

- [ ] Private key is secure and not committed to git
- [ ] Contracts are verified on BaseScan
- [ ] Frontend is deployed to HTTPS
- [ ] Environment variables are properly set
- [ ] Test all functionality on mainnet
- [ ] Monitor gas usage and optimize if needed

### **Monitoring**

- **BaseScan**: Monitor transactions and contract interactions
- **Gas Tracker**: Monitor gas prices on Base
- **Error Logging**: Set up error tracking for production

### **Troubleshooting**

**Common Issues:**

1. **Insufficient ETH**: Make sure you have enough Base ETH for deployment
2. **Gas Estimation**: If gas estimation fails, try increasing gas limit
3. **Contract Verification**: Ensure all constructor parameters are correct
4. **RPC Issues**: Try different RPC endpoints if needed

### **Next Steps**

After successful deployment:

1. **Test thoroughly** on mainnet with small amounts
2. **Monitor performance** and gas usage
3. **Gather user feedback** and iterate
4. **Consider Farcaster integration** when ready
5. **Implement analytics** to track usage

---

**🎉 Your SWAPDUST app is now ready for Base mainnet!** 