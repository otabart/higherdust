# Base Mainnet Deployment Best Practices

## Issue: RPC Synchronization Delays

Base mainnet RPC endpoints can have significant delays (up to 30+ minutes) in reflecting confirmed transactions, causing "insufficient funds" errors during deployment.

## Recommended Solutions

### 1. **Premium RPC Providers** (Recommended)
Use dedicated RPC providers for reliable balance detection:

```bash
# Add to .env file
INFURA_BASE_URL=https://base-mainnet.infura.io/v3/YOUR_PROJECT_ID
ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
QUICKNODE_BASE_URL=https://YOUR_ENDPOINT.base-mainnet.quiknode.pro/YOUR_API_KEY/
ANKR_BASE_URL=https://rpc.ankr.com/base/YOUR_API_KEY
```

### 2. **Balance Retry Strategy**
Run balance checks every 2 minutes for up to 30 minutes:

```bash
npx hardhat run scripts/balance-retry.js --network base
```

### 3. **Manual Deployment via BaseScan**
When RPC issues persist:

1. **BaseScan Contract Creation:**
   - Visit: https://basescan.org/address/0x0000000000000000000000000000000000000000#writeContract
   - Connect MetaMask wallet
   - Paste contract bytecode
   - Add constructor arguments
   - Set gas limit: 500,000
   - Deploy

2. **Remix IDE:**
   - Open: https://remix.ethereum.org
   - Create new file: `SplitRouter.sol`
   - Paste contract source code
   - Compile and deploy with constructor arguments

### 4. **Verification Checklist**

Before deployment:
- [ ] Transaction confirmed on BaseScan
- [ ] Balance visible on BaseScan
- [ ] RPC endpoint tested with multiple providers
- [ ] Gas estimation calculated
- [ ] Constructor arguments prepared

### 5. **Alternative Networks**

For testing, use Base Sepolia testnet:
```bash
npx hardhat run scripts/deploy-custom.js --network baseSepolia
```

## Current Status

**Transaction:** ✅ Confirmed
- Hash: `0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f`
- Amount: 0.0019 ETH
- Recipient: `0x0B3520A5C09f27c6ac7702e74a751583024d81A2`

**RPC Status:** ❌ Delayed
- All public RPC endpoints show 0 balance
- BaseScan shows confirmed transaction
- Estimated sync time: 2-30 minutes

## Next Steps

1. **Wait for RPC sync** (balance-retry.js running)
2. **Try premium RPC providers** if available
3. **Use manual deployment** via BaseScan/Remix
4. **Document sync times** for future deployments

## Useful Links

- [BaseScan](https://basescan.org)
- [Remix IDE](https://remix.ethereum.org)
- [Base Bridge](https://bridge.base.org)
- [Base Documentation](https://docs.base.org)
