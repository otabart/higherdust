const { ethers } = require("hardhat");

async function checkRPCHealth() {
    const rpcEndpoints = [
        { name: "Current Config", url: null }, // Will use hardhat provider
        { name: "Base Official", url: "https://mainnet.base.org" },
        { name: "PublicNode", url: "https://base-rpc.publicnode.com" },
        { name: "LlamaRPC", url: "https://base.llamarpc.com" },
        { name: "1RPC", url: "https://1rpc.io/base" },
        { name: "Alchemy", url: "https://base-mainnet.g.alchemy.com/v2/dTxr0wyeId8QtiuPENJXt" }
    ];
    
    console.log("🏥 Base RPC Health Check");
    console.log("========================");
    
    for (const rpc of rpcEndpoints) {
        console.log(`\n🔍 Testing: ${rpc.name}`);
        
        try {
            const provider = rpc.url ? new ethers.JsonRpcProvider(rpc.url) : ethers.provider;
            
            // Test basic connectivity
            const startTime = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const latency = Date.now() - startTime;
            
            // Test balance query
            const balance = await provider.getBalance("0x0B3520A5C09f27c6ac7702e74a751583024d81A2");
            
            console.log(`  ✅ Block: ${blockNumber}`);
            console.log(`  ⚡ Latency: ${latency}ms`);
            console.log(`  💰 Balance: ${ethers.formatEther(balance)} ETH`);
            
            if (parseFloat(ethers.formatEther(balance)) > 0) {
                console.log(`  🎯 RECOMMENDED: Use this endpoint for deployment`);
            }
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message.slice(0, 60)}...`);
        }
    }
}

checkRPCHealth().catch(console.error);

