// utils/moralis.js - Moralis API integration for instant token detection

/**
 * Get all ERC-20 tokens for a wallet using Moralis API
 * Returns complete history - all tokens ever received
 */
async function getTokensFromMoralis(walletAddress) {
    console.log("🔍 Fetching complete token history from Moralis API...");
    
    const API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
    
    if (!API_KEY) {
        console.error("❌ Moralis API key not found in environment variables");
        return null;
    }
    
    try {
        const url = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/erc20?chain=base&exclude_spam=true`;
        
        console.log(`📡 Calling: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Moralis API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ Moralis returned ${data.length} total tokens`);
        
        // Transform to app format and filter valid tokens
        const tokens = data
            .filter(token => {
                // Filter out invalid/spam tokens
                // Calculate balance from raw balance and decimals if balance_formatted is missing
                let balance = 0;
                if (token.balance_formatted) {
                    balance = parseFloat(token.balance_formatted);
                } else if (token.balance && token.decimals) {
                    // Convert from wei to human readable format
                    balance = parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals));
                }
                
                return balance > 0 && 
                       !token.possible_spam && 
                       token.symbol && 
                       token.symbol !== 'Unknown';
            })
            .map(token => {
                // Calculate balanceFormatted if missing
                let balanceFormatted = token.balance_formatted;
                if (!balanceFormatted && token.balance && token.decimals) {
                    const balance = parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals));
                    balanceFormatted = balance.toString();
                }
                
                return {
                    address: token.token_address.toLowerCase(),
                    symbol: token.symbol || 'UNKNOWN',
                    name: token.name || 'Unknown Token',
                    decimals: parseInt(token.decimals) || 18,
                    balance: token.balance || '0',
                    balanceFormatted: balanceFormatted || '0',
                    logo: token.logo || null,
                    thumbnail: token.thumbnail || null,
                    verified: token.verified_contract || false,
                    // Additional metadata
                    source: 'moralis'
                };
            });
        
        console.log(`📋 Valid tokens after filtering: ${tokens.length}`);
        
        // Log found tokens for debugging
        tokens.forEach(token => {
            console.log(`   ✅ ${token.symbol}: ${token.balanceFormatted} tokens`);
        });
        
        return tokens;
        
    } catch (error) {
        console.error("❌ Moralis API error:", error);
        return null;
    }
}

/**
 * Get token prices from Moralis API
 */
async function getTokenPricesFromMoralis(tokenAddresses) {
    console.log(`💰 Fetching prices for ${tokenAddresses.length} tokens from Moralis...`);
    
    const API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
    
    if (!API_KEY || !tokenAddresses.length) {
        console.warn("⚠️ No API key or token addresses for price fetch");
        return {};
    }
    
    const prices = {};
    
    try {
        // Get prices for each token (Moralis doesn't support batch price queries)
        for (let i = 0; i < tokenAddresses.length; i++) {
            const address = tokenAddresses[i];
            
            try {
                const url = `https://deep-index.moralis.io/api/v2.2/erc20/${address}/price?chain=base`;
                
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'X-API-Key': API_KEY
                    }
                });
                
                if (response.ok) {
                    const priceData = await response.json();
                    const usdPrice = parseFloat(priceData.usdPrice || 0);
                    
                    prices[address.toLowerCase()] = {
                        usd: usdPrice,
                        native: priceData.nativePrice || null
                    };
                    
                    console.log(`   💲 ${address.slice(0, 8)}...: $${usdPrice}`);
                } else {
                    console.warn(`   ⚠️ Price not found for ${address.slice(0, 8)}...`);
                }
                
                // Rate limiting - Moralis allows 25 req/sec
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                console.warn(`   ❌ Price fetch failed for ${address.slice(0, 8)}...:`, error.message);
            }
        }
        
        console.log(`✅ Fetched prices for ${Object.keys(prices).length}/${tokenAddresses.length} tokens`);
        return prices;
        
    } catch (error) {
        console.error("❌ Moralis price fetch error:", error);
        return {};
    }
}

/**
 * Test Moralis API connection and permissions
 */
async function testMoralisConnection(walletAddress) {
    console.log("🧪 Testing Moralis API connection...");
    
    try {
        const tokens = await getTokensFromMoralis(walletAddress);
        
        if (tokens && tokens.length >= 0) {
            console.log(`✅ Moralis connection successful! Found ${tokens.length} tokens`);
            return true;
        } else {
            console.log("❌ Moralis connection failed or returned invalid data");
            return false;
        }
    } catch (error) {
        console.error("❌ Moralis connection test failed:", error);
        return false;
    }
}

// Export functions for CommonJS
module.exports = {
    getTokensFromMoralis,
    getTokenPricesFromMoralis,
    testMoralisConnection
};
