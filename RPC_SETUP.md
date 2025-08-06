# 🚀 RPC Provider Setup Guide

## Critical Issue: RPC Rate Limiting

The app is currently using public Base RPC endpoints which have strict rate limits, causing:
- 429 "over rate limit" errors
- Failed balance checks
- Failed transaction executions
- Poor user experience

## 🔧 Solution: Premium RPC Providers

### Option 1: Alchemy (Recommended)
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app for Base mainnet
4. Copy your API key
5. Add to `.env.local`:
```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### Option 2: QuickNode
1. Go to [QuickNode](https://www.quicknode.com/)
2. Create a free account
3. Create a Base mainnet endpoint
4. Copy your endpoint URL
5. Add to `.env.local`:
```bash
NEXT_PUBLIC_QUICKNODE_URL=https://your-quicknode-endpoint.com
```

### Option 3: Infura
1. Go to [Infura](https://infura.io/)
2. Create a free account
3. Create a Base mainnet project
4. Copy your project ID
5. Add to `.env.local`:
```bash
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id_here
```

## 🛠️ Implementation Details

### RPC Priority Order:
1. **Alchemy** (best performance, 300M requests/month free)
2. **QuickNode** (good performance, 25M requests/month free)
3. **Infura** (reliable, 100K requests/day free)
4. **Public RPCs** (fallback only)

### Features Added:
- ✅ **Retry Logic**: 3 attempts with exponential backoff
- ✅ **Multiple Fallbacks**: Automatic failover between providers
- ✅ **Rate Limit Handling**: Proper error handling for 429 errors
- ✅ **Precision Buffer**: 1000 wei buffer for rounding errors

## 🎯 Expected Results

After setup:
- ✅ No more 429 rate limit errors
- ✅ Reliable balance checking
- ✅ Successful transaction execution
- ✅ Better user experience

## 📝 Environment Variables

Add to your `.env.local`:
```bash
# Choose ONE of these:
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
# OR
NEXT_PUBLIC_QUICKNODE_URL=your_quicknode_url
# OR
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_id
```

## 🚨 Priority

**This is blocking all swaps** - set up a premium RPC provider immediately! 