#!/usr/bin/env node

const { ethers } = require('ethers');

async function testContractInteraction() {
  console.log('🧪 Testing Contract Interaction...\n');

  // Contract addresses
  const SPLIT_ROUTER = "0x4125F70c83ACCfceE7107264560EA23A6BeEde7f";
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";

  // Simple ABI for testing
  const abi = [
    {
      inputs: [
        { name: "tokens", type: "address[]" },
        { name: "amounts", type: "uint256[]" },
        { name: "minReceive", type: "uint256" },
      ],
      name: "executeBulkSwap",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { name: "tokens", type: "address[]" },
        { name: "amounts", type: "uint256[]" },
      ],
      name: "getBulkSwapQuote",
      outputs: [
        { name: "totalAmountOut", type: "uint256" },
        { name: "individualQuotes", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    }
  ];

  try {
    // Connect to Base mainnet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    console.log('✅ Connected to Base mainnet');
    console.log(`📋 Contract: ${SPLIT_ROUTER}`);
    console.log(`🎯 HIGHER Token: ${HIGHER_TOKEN}\n`);

    // Create contract instance
    const contract = new ethers.Contract(SPLIT_ROUTER, abi, provider);
    
    console.log('🔍 Testing contract methods...');

    // Test view function (should work)
    try {
      const testTokens = [HIGHER_TOKEN];
      const testAmounts = [ethers.parseUnits('1', 18)];
      
      console.log('📊 Testing getBulkSwapQuote...');
      const quote = await contract.getBulkSwapQuote(testTokens, testAmounts);
      console.log('✅ Quote function works:', quote.toString());
    } catch (error) {
      console.log('❌ Quote function failed:', error.message);
    }

    // Test gas estimation for write function
    try {
      const testTokens = [HIGHER_TOKEN];
      const testAmounts = [ethers.parseUnits('1', 18)];
      const minReceive = ethers.parseUnits('0.9', 18);
      
      console.log('\n⛽ Testing gas estimation...');
      const gasEstimate = await contract.executeBulkSwap.estimateGas(
        testTokens, 
        testAmounts, 
        minReceive
      );
      console.log('✅ Gas estimate:', gasEstimate.toString());
      console.log('💰 Estimated gas cost:', ethers.formatEther(gasEstimate * BigInt(1000000000)), 'ETH');
    } catch (error) {
      console.log('❌ Gas estimation failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContractInteraction().catch(console.error); 