# Environment Variables Setup Guide

## 📋 **Required Environment Variables**

Create a `.env.local` file in the root directory with the following variables:

```bash
# Required Environment Variables
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=84387a208a33faa3a607f56ffe1e07b5
NEXT_PUBLIC_APP_NAME=SWAPDUST
NEXT_PUBLIC_APP_DESCRIPTION=Bulk swap dust tokens to HIGHER on Base
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional Environment Variables
NEXT_PUBLIC_DEBUG=true

# Farcaster Mini App Settings (Optional)
NEXT_PUBLIC_FARCASTER_DEVELOPMENT_MODE=true
NEXT_PUBLIC_FARCASTER_APP_FID=1
NEXT_PUBLIC_FARCASTER_APP_MNEMONIC=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
```

## 🔧 **Environment Variable Descriptions**

### **Required Variables:**

- **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`**: Your WalletConnect project ID (32+ characters)
- **`NEXT_PUBLIC_APP_NAME`**: Application name displayed to users
- **`NEXT_PUBLIC_APP_DESCRIPTION`**: App description for Farcaster
- **`NEXT_PUBLIC_APP_URL`**: Your app's URL (use tunnel URL for Warpcast testing)
- **`NODE_ENV`**: Environment mode (development/production)

### **Optional Variables:**

- **`NEXT_PUBLIC_DEBUG`**: Enable debug logging (true/false)
- **`NEXT_PUBLIC_FARCASTER_DEVELOPMENT_MODE`**: Enable Farcaster dev mode
- **`NEXT_PUBLIC_FARCASTER_APP_FID`**: Your Farcaster app FID
- **`NEXT_PUBLIC_FARCASTER_APP_MNEMONIC`**: Development mnemonic

## 🚀 **Production Setup**

For production deployment, update these values:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

## 🔍 **Validation**

The app will validate environment variables on startup:

- ✅ **Development**: Optional variables allowed with defaults
- ❌ **Production**: All required variables must be set

## 📝 **Troubleshooting**

### **Common Issues:**

1. **Missing WalletConnect Project ID**: Get one from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. **Invalid App URL**: Must be HTTPS for production
3. **Environment Variables Not Loading**: Restart the development server

### **Debug Commands:**

```bash
# Check environment variables
npm run dev

# Clear Next.js cache
rm -rf .next && npm run dev
``` 