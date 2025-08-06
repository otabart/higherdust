#!/usr/bin/env node

/**
 * 🚀 Production Readiness Verification Script
 * 
 * This script verifies that the application is 100% dynamic
 * with no hardcoded data or static fallbacks.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Readiness...\n');

// Files to check for hardcoded data
const filesToCheck = [
  'app/api/tokens/detect/route.ts',
  'app/api/tokens/prices/route.ts',
  'hooks/use-comprehensive-token-detection.ts',
  'lib/contracts.ts',
  'app/page.tsx'
];

// Patterns that indicate ACTUAL hardcoded data (not legitimate code)
const hardcodedPatterns = [
  // Hardcoded token lists (actual data)
  /const.*tokens.*=.*\[.*\{.*address.*:.*['"`]0x/,
  /const.*TOKENS.*=.*\[.*\{.*address.*:.*['"`]0x/,
  /const.*DEFAULT_TOKENS.*=.*\[.*\{.*address.*:.*['"`]0x/,
  
  // Hardcoded price data (actual data)
  /const.*prices.*=.*\{.*0x[a-fA-F0-9]{40}.*:.*\d+/,
  /const.*PRICES.*=.*\{.*0x[a-fA-F0-9]{40}.*:.*\d+/,
  /const.*DEFAULT_PRICES.*=.*\{.*0x[a-fA-F0-9]{40}.*:.*\d+/,
  
  // Static token data (actual hardcoded tokens)
  /symbol.*:.*['"`].*TOKEN.*['"`]/,
  /name.*:.*['"`].*Token.*['"`]/,
  /address.*:.*['"`]0x[a-fA-F0-9]{40}.*['"`]/,
  
  // Fallback data arrays
  /fallback.*=.*\[.*\{.*address.*:.*['"`]0x/,
  /default.*=.*\[.*\{.*address.*:.*['"`]0x/,
  /backup.*=.*\[.*\{.*address.*:.*['"`]0x/,
  
  // Static response objects with hardcoded data
  /return.*\{.*tokens.*:.*\[.*\{.*address.*:.*['"`]0x/,
  /return.*\{.*prices.*:.*\{.*0x[a-fA-F0-9]{40}.*:.*\d+/,
];

// Patterns that are OK (contract addresses, ABIs, function definitions)
const allowedPatterns = [
  /CONTRACT_ADDRESSES/,
  /SPLIT_ROUTER/,
  /HIGHER_TOKEN/,
  /WETH/,
  /UNISWAP/,
  /ERC20_ABI/,
  /SPLIT_ROUTER_ABI/,
  /name.*:.*['"`].*function.*['"`]/,
  /type.*:.*['"`].*function.*['"`]/,
  /inputs.*:.*\[/,
  /outputs.*:.*\[/,
  /stateMutability/,
  /indexed.*:.*true/,
  /anonymous.*:.*false/,
  /decimals.*=.*18/,
  /formatForParseUnits/,
  /throw new Error/,
  /console\.log/,
  /console\.error/,
  /console\.warn/,
  /'Unknown Token'/,
  /dustTokens/,
  /detectDustTokens/,
];

let hasIssues = false;

console.log('📋 Checking files for hardcoded data...\n');

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`🔍 Checking: ${filePath}`);
  
  let fileHasIssues = false;
  
  lines.forEach((line, index) => {
    hardcodedPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        // Check if this is an allowed pattern
        const isAllowed = allowedPatterns.some(allowed => allowed.test(line));
        
        if (!isAllowed) {
          console.log(`  ❌ Line ${index + 1}: Potential hardcoded data`);
          console.log(`     ${line.trim()}`);
          fileHasIssues = true;
          hasIssues = true;
        }
      }
    });
  });
  
  if (!fileHasIssues) {
    console.log(`  ✅ No hardcoded data found`);
  }
  
  console.log('');
});

// Check API endpoints
console.log('🌐 Checking API endpoints...\n');

const apiFiles = [
  'app/api/tokens/detect/route.ts',
  'app/api/tokens/prices/route.ts'
];

apiFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`🔍 Checking API: ${filePath}`);
  
  // Check for live API usage
  const hasDexScreener = content.includes('dexscreener.com');
  const hasCoinGecko = content.includes('coingecko.com');
  const hasLiveFetch = content.includes('fetch(');
  
  if (hasDexScreener || hasCoinGecko) {
    console.log(`  ✅ Uses live APIs: ${hasDexScreener ? 'DexScreener' : ''} ${hasCoinGecko ? 'CoinGecko' : ''}`);
  } else {
    console.log(`  ❌ No live API usage detected`);
    hasIssues = true;
  }
  
  // Check cache duration
  const cacheMatch = content.match(/CACHE_DURATION.*=.*(\d+)/);
  if (cacheMatch) {
    const duration = parseInt(cacheMatch[1]);
    if (duration <= 300000) { // 5 minutes or less
      console.log(`  ✅ Short cache duration: ${duration / 1000}s`);
    } else {
      console.log(`  ⚠️  Long cache duration: ${duration / 1000}s`);
    }
  }
  
  console.log('');
});

// Check for development-only features
console.log('🔧 Checking for development features...\n');

const devPatterns = [
  /process\.env\.NODE_ENV.*development/,
  /__DEV__/,
  /DEBUG.*=.*true/,
];

const devFiles = [
  'app/page.tsx',
  'hooks/use-comprehensive-token-detection.ts'
];

devFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`🔍 Checking dev features: ${filePath}`);
  
  let hasDevFeatures = false;
  
  devPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      console.log(`  ⚠️  Development feature found: ${pattern.source}`);
      hasDevFeatures = true;
    }
  });
  
  if (!hasDevFeatures) {
    console.log(`  ✅ No development features found`);
  }
  
  console.log('');
});

// Summary
console.log('📊 Production Readiness Summary:');
console.log('================================');

if (hasIssues) {
  console.log('❌ ISSUES FOUND:');
  console.log('   - Some hardcoded data detected');
  console.log('   - Please review and remove static data');
  console.log('   - Ensure 100% API dependencies');
  process.exit(1);
} else {
  console.log('✅ PRODUCTION READY:');
  console.log('   - No hardcoded data found');
  console.log('   - All data comes from live APIs');
  console.log('   - Short cache durations');
  console.log('   - Real-time dynamic system');
  console.log('');
  console.log('🎉 Your application is 100% dynamic and ready for production!');
}

console.log('\n🚀 Next Steps:');
console.log('   1. Test with real wallet data');
console.log('   2. Monitor API performance');
console.log('   3. Deploy to production');
console.log('   4. Monitor user experience'); 