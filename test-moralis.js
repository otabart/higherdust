// test-moralis.js - Test script to verify Moralis integration
const { getTokensFromMoralis, testMoralisConnection } = require('./utils/moralis.js');

async function runTest() {
    console.log("🧪 Testing Moralis Integration");
    console.log("==============================");
    
    // Test with a wallet that should have the expected dust tokens
    const testWallet = "0xe8bB2E08e6f52f11D8B65e2A3db772DaA60e117e";
    
    // Test 1: Connection
    console.log("\n1️⃣ Testing API connection...");
    const connectionOK = await testMoralisConnection(testWallet);
    
    if (!connectionOK) {
        console.log("❌ Connection test failed - check API key");
        return;
    }
    
    // Test 2: Token detection with raw data
    console.log("\n2️⃣ Testing token detection with raw data...");
    
    // Test the API directly to see raw response
    const API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
    if (API_KEY) {
        try {
            const url = `https://deep-index.moralis.io/api/v2.2/${testWallet}/erc20?chain=base&exclude_spam=true`;
            console.log(`📡 Direct API call: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-API-Key': API_KEY
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`📊 Raw API response: ${data.length} tokens found`);
                
                if (data.length > 0) {
                    console.log(`\n🔍 Sample tokens:`);
                    data.slice(0, 5).forEach((token, index) => {
                        console.log(`   ${index + 1}. ${token.symbol} (${token.name}): ${token.balance_formatted || 'Calculating...'}`);
                    });
                }
            } else {
                console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error("❌ Direct API call failed:", error);
        }
    }
    
    // Test 3: Processed token detection
    console.log("\n3️⃣ Testing processed token detection...");
    const tokens = await getTokensFromMoralis(testWallet);
    
    if (tokens && tokens.length > 0) {
        console.log(`✅ SUCCESS! Found ${tokens.length} tokens:`);
        
        tokens.forEach((token, index) => {
            console.log(`   ${index + 1}. ${token.symbol}: ${token.balanceFormatted} tokens`);
        });
        
        // Check for known tokens
        const knownTokens = ['BETRMINT', 'Ight', 'Oxen', 'frog', 'BRND', 'RTCHT', 'smiles'];
        const foundKnown = tokens.filter(token => 
            knownTokens.some(known => token.symbol.toLowerCase().includes(known.toLowerCase()))
        );
        
        console.log(`\n🎯 Found ${foundKnown.length} of your expected tokens:`);
        foundKnown.forEach(token => {
            console.log(`   ✅ ${token.symbol}: ${token.balanceFormatted}`);
        });
        
        if (foundKnown.length > 0) {
            console.log("\n🎉 MORALIS INTEGRATION SUCCESSFUL!");
            console.log("✅ Your dust tokens are now detectable!");
        }
        
    } else {
        console.log("❌ No tokens found - this might indicate an issue");
    }
}

// Run the test
runTest().catch(error => {
    console.error("❌ Test failed:", error);
});
