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

  // Basic headers for development stability
  async headers() {
    const headers = [
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
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
      // Development-friendly CSP for Chrome extensions and Farcaster Mini Apps
      {
        key: 'Content-Security-Policy',
        value: process.env.NODE_ENV === 'development' 
          ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: chrome-extension:; script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension:; connect-src 'self' https: wss: chrome-extension:; img-src 'self' data: blob: https: chrome-extension:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; object-src 'none'; base-uri 'self';"
          : "frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://warpcast.com https://*.warpcast.com; default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; base-uri 'self';",
      },
    ];

    // Don't set X-Frame-Options in production to allow iframe embedding
    // Vercel will not add its own DENY header if we don't set it
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      });
    }

    return [
      {
        source: '/(.*)',
        headers,
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
