#!/usr/bin/env node

const { ethers } = require('ethers');

async function debugTokenDetection() {
  console.log('🔍 Debugging Token Detection...\n');

  // User's wallet address (from the image)
  const userAddress = "0xD2a9...7486"; // Replace with actual address
  
  // Tokens from the user's wallet (from the image)
  const userTokens = [
    { symbol: "SAGE", address: "0x...", value: 2.87 }, // Oxsim by Virtuals
    { symbol: "Base is for everyone", address: "0x...", value: 0.71 },
    { symbol: "BASED", address: "0x...", value: 0.68 },
    { symbol: "lower", address: "0x...", value: 0.65 },
    { symbol: "DEGEN", address: "0x...", value: 0.33 },
    { symbol: "cbXRP", address: "0x...", value: 0.00 },
    { symbol: "POV", address: "0x...", value: 0.00 },
    { symbol: "CITIZEN", address: "0x...", value: 0.00 }
  ];

  console.log('📋 User has these tokens under $3:');
  userTokens.forEach(token => {
    console.log(`  - ${token.symbol}: $${token.value}`);
  });

  console.log('\n🔍 Testing API endpoints...');

  // Test 1: Check token database
  try {
    console.log('\n1️⃣ Testing token database...');
    const response = await fetch('http://localhost:3000/api/tokens/detect');
    const data = await response.json();
    
    console.log(`✅ API returned ${data.tokens?.length || 0} tokens`);
    
    // Check if user's tokens are in the database
    const userTokenSymbols = userTokens.map(t => t.symbol);
    const foundTokens = data.tokens?.filter(token => 
      userTokenSymbols.some(symbol => 
        token.symbol?.toLowerCase().includes(symbol.toLowerCase()) ||
        token.name?.toLowerCase().includes(symbol.toLowerCase())
      )
    ) || [];
    
    console.log(`📊 Found ${foundTokens.length} user tokens in database:`);
    foundTokens.forEach(token => {
      console.log(`  - ${token.symbol} (${token.name})`);
    });
    
  } catch (error) {
    console.log('❌ Token database test failed:', error.message);
  }

  // Test 2: Check price API
  try {
    console.log('\n2️⃣ Testing price API...');
    const testAddresses = ["0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe"]; // HIGHER token
    
    const response = await fetch('http://localhost:3000/api/tokens/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: testAddresses })
    });
    
    const data = await response.json();
    console.log(`✅ Price API returned ${data.prices?.length || 0} prices`);
    
  } catch (error) {
    console.log('❌ Price API test failed:', error.message);
  }

  // Test 3: Check specific token addresses
  console.log('\n3️⃣ Testing specific token addresses...');
  
  // Common Base token addresses
  const testAddresses = [
    "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe", // HIGHER
    "0x4200000000000000000000000000000000000006", // WETH
    "0x52b492a33e447cdb854c7fc19f1e57e8bfa1777d", // PEPE
  ];

  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  
  for (const address of testAddresses) {
    try {
      const balance = await provider.getBalance(userAddress);
      console.log(`  ${address}: ${ethers.formatEther(balance)} ETH`);
    } catch (error) {
      console.log(`  ${address}: Error - ${error.message}`);
    }
  }

  console.log('\n🎯 Recommendations:');
  console.log('1. Check if user tokens are in the API database');
  console.log('2. Verify token addresses are correct');
  console.log('3. Test balance checking for specific tokens');
  console.log('4. Check price fetching for user tokens');
}

debugTokenDetection().catch(console.error); 