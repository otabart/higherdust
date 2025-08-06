# 🧪 **Testing Guide - Base Sepolia Testnet**

## 📋 **Prerequisites**

### **1. Environment Setup**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### **2. Required Environment Variables**
```env
# Base Sepolia Testnet
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional for testing
DEV_WALLET=your_dev_wallet_address
```

### **3. Get Testnet ETH**
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Alternative**: Bridge from Ethereum Sepolia to Base Sepolia

---

## 🚀 **Step-by-Step Testing Process**

### **Step 1: Deploy Test Contracts**
```bash
cd contracts

# Deploy test HIGHER token and SplitRouter
npm run setup:testnet
```

This will:
- Deploy a test HIGHER token
- Deploy the SplitRouter contract
- Verify contracts on BaseScan Sepolia
- Print the contract addresses

### **Step 2: Update Frontend Configuration**
After deployment, update `lib/contracts.ts` with the new addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  SPLIT_ROUTER: "0x...", // New address from deployment
  HIGHER_TOKEN: "0x...", // New address from deployment
  // ... other addresses
} as const;
```

### **Step 3: Test Token Detection**
1. **Connect Wallet** to Base Sepolia
2. **Get Test Tokens** from faucets or bridges
3. **Test Token Detection** - should find your tokens
4. **Verify Dust Filtering** - only tokens < $3 should show

### **Step 4: Test Swap Functionality**
1. **Select Tokens** for swapping
2. **Test Approvals** - tokens should be approved
3. **Test Single Swaps** - small amounts first
4. **Test Bulk Swaps** - multiple tokens
5. **Verify 80/18/2 Split** - check transaction logs

### **Step 5: Monitor Transactions**
- **BaseScan Sepolia**: https://sepolia.basescan.org/
- **Check Contract Events**: Look for `SwapExecuted` events
- **Verify Token Transfers**: Check balances before/after

---

## 🧪 **Testing Checklist**

### **✅ Token Detection**
- [ ] Wallet connects to Base Sepolia
- [ ] Token detection finds your tokens
- [ ] Dust filtering works (< $3 threshold)
- [ ] Token balances display correctly
- [ ] Token prices fetch properly

### **✅ Swap Functionality**
- [ ] Token selection works
- [ ] Approvals execute successfully
- [ ] Single swaps complete
- [ ] Bulk swaps complete
- [ ] Slippage protection works
- [ ] Error handling works

### **✅ Contract Integration**
- [ ] Contract addresses are correct
- [ ] ABI matches deployed contract
- [ ] Events are emitted correctly
- [ ] 80/18/2 split executes properly
- [ ] Platform fees go to dev wallet

### **✅ User Experience**
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Success messages display
- [ ] Network switching works
- [ ] Mobile responsiveness

---

## 🐛 **Common Issues & Solutions**

### **Issue: "Contract Not Found"**
**Solution**: 
- Verify contract deployment was successful
- Check contract addresses in configuration
- Ensure you're on Base Sepolia network

### **Issue: "Insufficient Balance"**
**Solution**:
- Get more Base Sepolia ETH from faucet
- Check token balances in wallet
- Verify token approval amounts

### **Issue: "Swap Failed"**
**Solution**:
- Check if WETH/HIGHER pool exists
- Verify slippage settings
- Ensure sufficient liquidity in pool

### **Issue: "Token Detection Fails"**
**Solution**:
- Check API endpoints are working
- Verify RPC connection
- Clear browser cache and retry

---

## 📊 **Testing Metrics**

### **Performance**
- Token detection time: < 10 seconds
- Swap transaction time: < 30 seconds
- Page load time: < 3 seconds

### **Success Rates**
- Token detection: > 95%
- Swap success: > 90%
- Approval success: > 95%

### **Error Handling**
- Network errors: Graceful fallback
- Contract errors: Clear user messages
- API errors: Retry mechanism

---

## 🔍 **Debugging Tools**

### **Browser Console**
```javascript
// Check wallet connection
console.log('Wallet:', window.ethereum?.selectedAddress)

// Check contract addresses
console.log('Contracts:', CONTRACT_ADDRESSES)

// Check token detection
console.log('Tokens:', tokens)
```

### **BaseScan Sepolia**
- **Contract Verification**: Verify deployed contracts
- **Transaction History**: Monitor all transactions
- **Event Logs**: Check emitted events

### **Network Monitoring**
- **RPC Health**: Check Base Sepolia RPC status
- **Gas Prices**: Monitor gas costs
- **Block Confirmations**: Track transaction confirmations

---

## 🚨 **Important Notes**

### **⚠️ Testnet Limitations**
- **No Real Value**: All tokens are test tokens
- **Limited Liquidity**: Pools may have low liquidity
- **Network Instability**: Testnet may be unstable
- **Contract Updates**: Contracts may be redeployed

### **🔒 Security Considerations**
- **Private Keys**: Never commit private keys to git
- **Test Wallets**: Use separate wallets for testing
- **Small Amounts**: Test with minimal amounts first
- **Backup Data**: Keep deployment addresses safe

### **📈 Production Readiness**
- **Audit Required**: Get professional audit before mainnet
- **Security Review**: Review all security aspects
- **Performance Testing**: Test with realistic loads
- **User Testing**: Get feedback from real users

---

## 🎯 **Next Steps After Testing**

1. **Fix Issues**: Address any problems found
2. **Optimize Performance**: Improve speed and reliability
3. **Security Review**: Audit contracts and frontend
4. **User Testing**: Get feedback from beta users
5. **Mainnet Deployment**: Deploy to Base mainnet

---

## 📞 **Support**

If you encounter issues:
1. Check the console for error messages
2. Verify network and contract configuration
3. Test with smaller amounts
4. Check BaseScan for transaction status
5. Review this guide for common solutions

**Happy Testing! 🚀** 