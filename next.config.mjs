/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  productionBrowserSourceMaps: false,
  
  // Experimental features for blockchain apps
  experimental: {
    // Optimize for client-side rendering
    optimizePackageImports: ['wagmi', 'viem', 'lucide-react'],
    // Disable problematic development features
    serverComponentsExternalPackages: [],
    // Enable modern React features
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Performance optimizations
  swcMinify: true,
  compress: true,
  
  // Development-specific settings
  ...(process.env.NODE_ENV === 'development' && {
    // Webpack optimizations for development
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Use eval-source-map for better development performance
        config.devtool = 'eval-source-map'
        
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Create a vendor chunk for better caching
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /node_modules/,
                priority: 20,
              },
              // Create a common chunk for shared code
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 10,
                reuseExistingChunk: true,
                enforce: true,
              },
            },
          },
        };
      }
      
      // Web3 fallbacks
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          stream: false,
          url: false,
          zlib: false,
          http: false,
          https: false,
          assert: false,
          os: false,
          path: false,
          buffer: false,
          util: false,
          querystring: false,
          punycode: false,
          string_decoder: false,
          constants: false,
          domain: false,
          events: false,
          timers: false,
          tty: false,
          vm: false,
          worker_threads: false,
        };
      }

      return config;
    },
  }),
  
  // Image optimization with token logo domains
  images: {
    domains: [
      'basescan.org', 
      'etherscan.io',
      'assets.coingecko.com',
      'raw.githubusercontent.com',
      'trustwallet.com',
      '1inch.io',
      'tokens.1inch.io'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers optimized for iframe embedding (Farcaster miniapps)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // IMPORTANT: Do NOT set X-Frame-Options at all to allow iframe embedding
          // Vercel's automatic X-Frame-Options: DENY will be overridden by middleware.ts
          
          // Basic CORS headers for API routes
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  },

  // Static optimization settings
  staticPageGenerationTimeout: 120,
  trailingSlash: false,

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Development error suppression
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
