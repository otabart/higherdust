# SWAPDUST - Bulk Dust Token Swapper

A comprehensive Web3 application for swapping dust tokens to HIGHER tokens on Base network with advanced token detection and robust error handling.

## 🚀 Features

### ✅ **Comprehensive Token Detection**
- **Multi-source detection**: CoinGecko API, block scanning, known tokens
- **Robust error handling**: Retry mechanisms, fallback strategies
- **Real-time validation**: ERC-20 token validation with batch processing
- **Performance optimized**: Parallel scanning with individual error handling

### ✅ **Advanced RPC Configuration**
- **Multiple RPC endpoints**: 6+ reliable Base RPC providers
- **Automatic fallback**: Seamless switching on RPC failures
- **Enhanced reliability**: Retry logic with exponential backoff
- **Performance monitoring**: RPC status tracking and debugging

### ✅ **Client-Only Architecture**
- **Hydration mismatch prevention**: ClientOnly wrapper for blockchain components
- **Smooth loading states**: Professional loading skeleton
- **Clean architecture**: Separation of concerns with proper error boundaries
- **Better UX**: No SSR issues with wallet connections

### ✅ **Security & Performance**
- **Security headers**: CSP, X-Frame-Options, Content-Type protection
- **Webpack optimizations**: Bundle optimization for blockchain apps
- **Image optimization**: WebP/AVIF support for better performance
- **Environment configuration**: Flexible env vars for different deployments

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Blockchain**: Wagmi v2, Viem, Base Network
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **State Management**: React Query, Zustand
- **Deployment**: Vercel (optimized)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/higherdust.git
cd higherdust

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CHAIN_NAME=Base
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Optional API Keys
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# App Configuration
NEXT_PUBLIC_APP_NAME=SWAPDUST
NEXT_PUBLIC_APP_DESCRIPTION=Bulk swap dust tokens to HIGHER
NEXT_PUBLIC_APP_URL=https://swapdust.vercel.app

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

### Next.js Configuration

The app includes optimized Next.js configuration for blockchain applications:

- **Security headers** for Web3 apps
- **Webpack optimizations** for client-side rendering
- **Image optimization** with WebP/AVIF support
- **Performance optimizations** with SWC minification
- **Bundle analysis** support (optional)

## 🏗️ Architecture

### Component Structure

```
<ClientOnly fallback={<LoadingSkeleton />}>
  <ErrorBoundary>
    <NetworkGuard>
      <SwapDustInterface />
    </NetworkGuard>
  </ErrorBoundary>
</ClientOnly>
```

### Token Detection Flow

1. **CoinGecko API** (Primary) - 250+ Base tokens
2. **Known Tokens** (Fallback) - Essential tokens
3. **Block Scanning** (Always Active) - Comprehensive detection
4. **Validation** - ERC-20 token verification

### RPC Management

- **6+ RPC endpoints** with automatic failover
- **Failed RPC tracking** and intelligent switching
- **Performance monitoring** and debugging tools
- **Retry mechanisms** with exponential backoff

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod
```

### Environment Variables for Production

Set these in your Vercel dashboard:

- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_ENABLE_DEBUG_MODE`

## 🔍 Debugging

### Development Mode

```bash
# Enable debug mode
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true npm run dev

# Bundle analysis
ANALYZE=true npm run build
```

### Console Logs

The app provides detailed console logging:

- **Token detection progress**
- **RPC switching events**
- **Error handling details**
- **Performance metrics**

## 📊 Performance

### Optimizations

- **Client-only rendering** for blockchain components
- **Bundle optimization** with tree shaking
- **Image optimization** with modern formats
- **Security headers** for Web3 compatibility
- **Caching strategies** for API responses

### Monitoring

- **RPC performance** tracking
- **Token detection** metrics
- **Error rate** monitoring
- **User experience** analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This README

---

Built with ❤️ for the Base ecosystem 