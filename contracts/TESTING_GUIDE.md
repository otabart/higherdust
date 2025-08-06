# HigherDust SplitRouter Testing Guide

## 🧪 Testing Strategy

This guide covers comprehensive testing of the HigherDust SplitRouter contracts before production deployment.

## 📋 Prerequisites

### 1. Environment Setup
```bash
cd contracts
npm install
```

### 2. Environment Variables
Create `.env` file:
```env
PRIVATE_KEY=your_test_private_key_here
BASE_GOERLI_RPC_URL=https://goerli.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

### 3. Test Wallet Setup
- Get Base Goerli ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Ensure you have at least 0.1 ETH for testing

## 🚀 Testing Phases

### Phase 1: Local Testing

#### 1.1 Compile Contracts
```bash
npm run compile
```

#### 1.2 Run Unit Tests
```bash
npm run test
```

#### 1.3 Run Test Coverage
```bash
npm run test:coverage
```

**Expected Results:**
- All tests should pass
- Coverage should be >90%
- No compilation errors

### Phase 2: Testnet Deployment

#### 2.1 Deploy to Base Goerli
```bash
npm run deploy:baseGoerli
```

#### 2.2 Verify Contracts
```bash
npm run verify:baseGoerli
```

**Expected Results:**
- Contracts deploy successfully
- Contracts verify on BaseScan Goerli
- No deployment errors

### Phase 3: Integration Testing

#### 3.1 Test Single Token Swap

**Test Case 1: Small Amount (0.001 ETH)**
```javascript
// Expected 80/18/2 split:
// 80% → 0.0008 ETH → HIGHER tokens to user
// 18% → 0.00018 ETH → LP position
// 2% → 0.00002 ETH → Dev wallet
```

**Test Case 2: Medium Amount (0.1 ETH)**
```javascript
// Expected 80/18/2 split:
// 80% → 0.08 ETH → HIGHER tokens to user
// 18% → 0.018 ETH → LP position
// 2% → 0.002 ETH → Dev wallet
```

#### 3.2 Test Bulk Dust Swap

**Test Case: Multiple Dust Tokens**
```javascript
// Test with tokens <$3 each:
// USDC: 1.5 tokens ($1.50)
// DAI: 0.8 tokens ($0.80)
// USDT: 2.5 tokens ($2.50)
// Total: $4.80
```

#### 3.3 Test Dust Detection

**Test Case: Mixed Dust and Non-Dust**
```javascript
// Should detect only tokens <$3:
// Dust: USDC (1.5), DAI (0.8), USDT (2.5)
// Non-dust: USDC (5.0), DAI (10.0) - should be ignored
```

## 🔍 Manual Testing Checklist

### Contract Deployment
- [ ] SplitRouter deploys successfully
- [ ] SplitRouterQuoter deploys successfully
- [ ] Contracts verify on BaseScan
- [ ] All constructor parameters are correct

### Single Token Swap
- [ ] Can swap USDC → HIGHER
- [ ] Can swap DAI → HIGHER
- [ ] Can swap WETH → HIGHER
- [ ] 80% goes to user as HIGHER tokens
- [ ] 18% creates LP position
- [ ] 2% goes to dev wallet
- [ ] Reverts if swapping HIGHER to HIGHER
- [ ] Reverts if amount is zero

### Bulk Swap
- [ ] Can swap multiple dust tokens
- [ ] Correctly aggregates amounts
- [ ] Maintains 80/18/2 split
- [ ] Reverts if arrays have different lengths
- [ ] Reverts if tokens array is empty

### Dust Detection
- [ ] Detects tokens <$3 correctly
- [ ] Ignores tokens >$3
- [ ] Returns correct dust amounts
- [ ] Calculates total value accurately

### Quoter Functions
- [ ] getSwapQuote returns correct values
- [ ] getBulkSwapQuote returns correct values
- [ ] detectDustTokens works correctly
- [ ] Price calculations are accurate

### Events
- [ ] SwapExecuted event fires with correct parameters
- [ ] BulkSwapExecuted event fires with correct parameters
- [ ] All event parameters are accurate

### Access Control
- [ ] Only owner can call emergency functions
- [ ] Non-owner cannot withdraw funds
- [ ] Emergency withdraw works correctly

## 🛠️ Testing Tools

### 1. Hardhat Console
```bash
npx hardhat console --network baseGoerli
```

### 2. BaseScan Goerli
- Monitor transactions: https://goerli.basescan.org
- Verify contract interactions
- Check event logs

### 3. Uniswap Interface
- Test pool liquidity: https://app.uniswap.org/explore/pools/base/0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0
- Verify token prices

## 📊 Expected Test Results

### Gas Usage
- Single swap: ~150,000 gas
- Bulk swap (3 tokens): ~200,000 gas
- Dust detection: ~50,000 gas

### Split Accuracy
- 80% split: ±0.01% tolerance
- 18% split: ±0.01% tolerance
- 2% split: ±0.01% tolerance

### Slippage Protection
- Should revert if output < minReceive
- 3% default slippage tolerance

## 🚨 Common Issues & Solutions

### Issue 1: Insufficient Balance
**Error:** "ERC20: transfer amount exceeds balance"
**Solution:** Ensure test wallet has sufficient token balance

### Issue 2: Insufficient Allowance
**Error:** "ERC20: insufficient allowance"
**Solution:** Approve tokens before swapping

### Issue 3: Slippage Too High
**Error:** "Insufficient HIGHER received"
**Solution:** Increase slippage tolerance or reduce amount

### Issue 4: Pool Not Found
**Error:** "Pool does not exist"
**Solution:** Verify pool address and fee tier

## ✅ Success Criteria

### Before Production Deployment
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Gas usage is acceptable
- [ ] Split calculations are accurate
- [ ] Events fire correctly
- [ ] Access control works
- [ ] Emergency functions work
- [ ] No critical vulnerabilities found

### Performance Benchmarks
- [ ] Single swap completes in <30 seconds
- [ ] Bulk swap completes in <60 seconds
- [ ] Gas costs are within budget
- [ ] No failed transactions

## 🔄 Continuous Testing

### Automated Tests
```bash
# Run tests before each deployment
npm run test
npm run test:coverage
```

### Manual Verification
- Test with different token amounts
- Test with different token types
- Verify split accuracy
- Check dev wallet receives fees

## 📞 Support

If you encounter issues during testing:
1. Check the error logs
2. Verify contract addresses
3. Ensure sufficient test ETH
4. Check token approvals
5. Verify pool liquidity

## 🎯 Next Steps

After successful testing:
1. Deploy to Base mainnet
2. Update frontend contract addresses
3. Test with real tokens
4. Monitor for any issues
5. Gather user feedback 