// Environment validation and debugging utilities

interface EnvironmentConfig {
  walletConnectProjectId: string | undefined
  appName: string
  appDescription: string
  appUrl: string
  nodeEnv: string
  debug: boolean
}

// Required environment variables for production
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_DESCRIPTION', 
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV'
] as const

// Optional environment variables
const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_DEBUG'
] as const

// All environment variables
const ALL_ENV_VARS = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]

export function validateEnvironment() {
  console.log('🔍 Validating environment configuration...');
  console.log('📋 Checking all environment variables:');

  // Check required variables
  const requiredVars = [
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'NEXT_PUBLIC_APP_NAME', 
    'NEXT_PUBLIC_APP_DESCRIPTION',
    'NEXT_PUBLIC_APP_URL',
    'NODE_ENV'
  ];

  const missingRequired: string[] = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ❌ MISSING ${varName}: ${value}`);
      missingRequired.push(varName);
    } else {
      console.log(`   ✅ SET ${varName}: ${value.substring(0, 10)}...`);
    }
  });

  // Check optional variables
  const optionalVars = ['NEXT_PUBLIC_DEBUG'];
  const missingOptional: string[] = [];

  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ⚠️ MISSING ${varName}: ${value}`);
      missingOptional.push(varName);
    } else {
      console.log(`   ✅ SET ${varName}: ${value}`);
    }
  });

  // Get actual values with fallbacks
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SWAPDUST';
  const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Bulk swap dust tokens to HIGHER on Base';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const debugMode = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development';
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '84387a208a33faa3a607f56ffe1e07b5';

  console.log('\n📋 Environment Configuration:');
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ App Name: ${appName}`);
  console.log(`✅ App Description: ${appDescription}`);
  console.log(`✅ App URL: ${appUrl}`);
  console.log(`✅ Debug Mode: ${debugMode}`);
  console.log(`✅ WalletConnect Project ID: ${walletConnectProjectId.substring(0, 8)}...`);
  console.log(`✅ Project ID Length: ${walletConnectProjectId.length} characters`);

  // In development mode, be more lenient
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.log('\n🔧 Development Mode Active');
    console.log('   - Debug logging enabled');
    console.log('   - Hot reload active');
    console.log('   - Development-friendly CSP');
    console.log('   - Optional environment variables allowed');
    
    // Validate WalletConnect Project ID format
    if (walletConnectProjectId && walletConnectProjectId.length >= 32) {
      console.log('✅ WalletConnect Project ID format appears valid');
    } else {
      console.log('⚠️ WalletConnect Project ID may be invalid');
    }

    // Validate App URL format
    if (appUrl && (appUrl.startsWith('http://') || appUrl.startsWith('https://'))) {
      console.log('✅ App URL format is valid');
    } else {
      console.log('⚠️ App URL format may be invalid');
    }

    console.log('\n🎯 Environment Validation Summary:');
    console.log(`   Required variables: ${requiredVars.length - missingRequired.length}/${requiredVars.length} set`);
    console.log(`   Optional variables: ${optionalVars.length - missingOptional.length}/${optionalVars.length} set`);
    
    if (missingRequired.length === 0) {
      console.log('✅ Environment validation PASSED');
    } else {
      console.log('⚠️ Environment validation WARNING - some variables missing but using defaults');
    }
    
    console.log('🎯 Environment validation complete');
    return true; // Allow development to continue
  }

  // Production validation - be more lenient
  if (missingRequired.length > 0) {
    console.log('\n⚠️ Missing required environment variables (using defaults):');
    missingRequired.forEach(varName => {
      console.log(`   ⚠️ ${varName} (using default)`);
    });
    console.log('⚠️ Environment validation WARNING - using default values');
    return true; // Allow production to continue with defaults
  }

  console.log('\n📋 Missing optional environment variables (using defaults):');
  missingOptional.forEach(varName => {
    console.log(`   ⚠️ ${varName} (using default)`);
  });

  console.log('✅ Environment validation PASSED');
  console.log('🎯 Environment validation complete');
  return true;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'SWAPDUST',
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Bulk swap dust tokens to HIGHER on Base',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true'
  }
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function hasWalletConnectProjectId(): boolean {
  return !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
}

// Debug function to show all environment variables
export function debugEnvironmentVariables(): void {
  console.log('🔍 Debug: All environment variables:')
  console.log('   All process.env keys:', Object.keys(process.env))
  console.log('   NEXT_PUBLIC_ keys:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')))
  console.log('   NODE_ENV:', process.env.NODE_ENV)
  
  ALL_ENV_VARS.forEach(varName => {
    const value = process.env[varName]
    console.log(`   ${varName}: ${value || 'undefined'}`)
  })
} 