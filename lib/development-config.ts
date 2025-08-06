// Simple development configuration without console overrides
export const developmentConfig = {
  // Suppress specific development errors (for logging only)
  suppressErrors: [
    'chrome-extension',
    'runtime.sendmessage',
    'nextjs_original-stack-frame',
    'react_devtools',
    'bundle.js',
    'scheduling',
    'webpack',
    'hot reload',
    'fast refresh'
  ],

  // Suppress specific development warnings (for logging only)
  suppressWarnings: [
    'chrome-extension',
    'react_devtools',
    'webpack',
    'Hydration failed',
    'Text content does not match',
    'Expected server HTML to contain'
  ],

  // Development error handling
  errorHandling: {
    // Maximum number of retries for failed requests
    maxRetries: 3,
    
    // Retry delay in milliseconds
    retryDelay: 1000,
    
    // Timeout for API requests in development
    requestTimeout: 10000,
    
    // Suppress unhandled promise rejections
    suppressUnhandledRejections: true,
  },

  // Performance monitoring
  performance: {
    // Enable performance monitoring in development
    enabled: process.env.NODE_ENV === 'development',
    
    // Log performance metrics
    logMetrics: true,
    
    // Monitor bundle size
    monitorBundleSize: true,
  },

  // Development debugging
  debugging: {
    // Enable detailed logging
    detailedLogging: process.env.NODE_ENV === 'development',
    
    // Log component renders
    logRenders: false,
    
    // Log API calls
    logApiCalls: true,
    
    // Log state changes
    logStateChanges: false,
  }
}

// Initialize development configuration (safe version)
export function initializeDevelopmentConfig() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Only handle unhandled promise rejections (no console overrides)
  if (developmentConfig.errorHandling.suppressUnhandledRejections) {
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || event.reason || ''
      const messageStr = String(message).toLowerCase()
      
      const shouldSuppress = developmentConfig.suppressErrors.some(pattern =>
        messageStr.includes(pattern)
      )

      if (shouldSuppress) {
        console.warn('🔄 Suppressed unhandled promise rejection:', message)
        event.preventDefault()
        return
      }
    })
  }

  // Log initialization
  console.log('🔧 Development configuration initialized (safe mode)')
}

// Export default configuration
export default developmentConfig 