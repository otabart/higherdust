# Manual Deployment Guide for SplitRouter Contract

## Overview
This guide will walk you through manually deploying the SplitRouter contract to Base mainnet using BaseScan's contract deployment interface.

## Prerequisites
- MetaMask wallet with Base mainnet configured
- At least 0.01 ETH in your wallet for deployment gas costs
- The contract bytecode and ABI

## Step 1: Prepare Contract Data

### Constructor Parameters
The SplitRouter constructor requires these parameters in order:

1. **HIGHER Token**: `0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe`
2. **WETH**: `0x4200000000000000000000000000000000000006`
3. **Uniswap Pool**: `0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0`
4. **Uniswap Router**: `0x2626664c2603336E57B271c5C0b26F421741e481`
5. **Uniswap Quoter**: `0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a`
6. **Position Manager**: `0x0000000000000000000000000000000000000000` (not used)
7. **Dev Wallet**: `0x0B3520A5C09f27c6ac7702e74a751583024d81A2`

## Step 2: Generate Contract Bytecode

Run this command to generate the deployment data:

```bash
cd contracts
npx hardhat compile
```

The compiled contract will be in `artifacts/contracts/SplitRouter.sol/SplitRouter.json`

## Step 3: Deploy via BaseScan

### 3.1 Navigate to BaseScan
1. Go to [BaseScan](https://basescan.org)
2. Click "Contract" tab
3. Click "Deploy Contract"

### 3.2 Upload Contract
1. Click "Upload Source Code"
2. Select the `SplitRouter.sol` file from your `contracts/contracts/` directory
3. Click "Continue"

### 3.3 Configure Compiler
1. **Compiler Type**: Solidity (Single file)
2. **Compiler Version**: 0.8.19
3. **Optimization**: Enabled
4. **Optimization Runs**: 200
5. **EVM Version**: paris
6. Click "Compile"

### 3.4 Deploy Contract
1. Click "Deploy" tab
2. **Contract**: Select `SplitRouter`
3. **Constructor Parameters**:
   ```
   _higher: 0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe
   _weth: 0x4200000000000000000000000000000000000006
   _uniswapPool: 0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0
   _uniswapRouter: 0x2626664c2603336E57B271c5C0b26F421741e481
   _uniswapQuoter: 0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a
   _positionManager: 0x0000000000000000000000000000000000000000
   _devWallet: 0x0B3520A5C09f27c6ac7702e74a751583024d81A2
   ```
4. Click "Deploy"
5. Confirm transaction in MetaMask

## Step 4: Verify Contract

### 4.1 Get Contract Address
After deployment, copy the contract address from the transaction receipt.

### 4.2 Verify on BaseScan
1. Go to your contract address on BaseScan
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Fill in the verification form:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: 0.8.19
   - **Optimization**: Yes
   - **Optimization Runs**: 200
   - **Constructor Arguments**: Use the same parameters as deployment
5. Click "Verify and Publish"

## Step 5: Update App Configuration

### 5.1 Update Contract Address
Edit `lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // Replace with your new contract address
  SPLIT_ROUTER: "YOUR_NEW_CONTRACT_ADDRESS_HERE",
  // ... rest remains the same
}
```

### 5.2 Redeploy App
```bash
cd ..  # Go back to project root
npm run build
# Deploy to Vercel
```

## Step 6: Test the Deployment

### 6.1 Verify Contract Functions
1. Go to your contract on BaseScan
2. Click "Contract" tab
3. Test these functions:
   - `executeSwap`
   - `executeBulkSwap`
   - `getSwapQuote`
   - `getBulkSwapQuote`

### 6.2 Test with Small Amount
1. Connect wallet to your app
2. Select a small dust token
3. Try a test swap with minimal amount

## Troubleshooting

### Common Issues

1. **"Out of Gas" Error**
   - Increase gas limit to 5,000,000
   - Set gas price to 0.1 gwei

2. **"Invalid Constructor Arguments"**
   - Double-check all addresses
   - Ensure no extra spaces
   - Verify addresses are checksummed

3. **"Contract Creation Failed"**
   - Check wallet has sufficient ETH
   - Verify you're on Base mainnet
   - Try increasing gas limit

### Verification Issues

1. **"No Contract Source Code"**
   - Ensure you uploaded the correct file
   - Check compiler settings match deployment

2. **"Constructor Arguments Mismatch"**
   - Use the exact same parameters as deployment
   - Check address formatting

## Security Checklist

✅ Contract deployed to correct network (Base mainnet)  
✅ Constructor parameters verified  
✅ Contract verified on BaseScan  
✅ App configuration updated  
✅ Test transactions successful  

## Next Steps

1. **Monitor Contract**: Watch for any unusual activity
2. **Test Thoroughly**: Try various token combinations
3. **User Testing**: Have others test the app
4. **Monitor Gas**: Track gas usage patterns

## Support

If you encounter issues:
1. Check BaseScan transaction status
2. Verify all addresses are correct
3. Ensure sufficient ETH for deployment
4. Test with small amounts first
