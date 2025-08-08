const { ethers } = require("hardhat");

async function main() {
    const txHash = "0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f";
    const address = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
    
    console.log("🔍 Base Mainnet Balance & Transaction Verification");
    console.log("================================================");
    
    // Test multiple RPC endpoints
    const rpcEndpoints = [
        { name: "Base Official", url: "https://mainnet.base.org" },
        { name: "PublicNode", url: "https://base-rpc.publicnode.com" },
        { name: "LlamaRPC", url: "https://base.llamarpc.com" },
        { name: "1RPC", url: "https://1rpc.io/base" },
        { name: "BlockPI", url: "https://base.blockpi.network/v1/rpc/public" },
        { name: "Alchemy", url: "https://base-mainnet.g.alchemy.com/v2/dTxr0wyeId8QtiuPENJXt" }
    ];
    
    console.log(`\n📊 Checking transaction: ${txHash.slice(0, 10)}...`);
    
    // Check transaction with current provider
    try {
        const tx = await ethers.provider.getTransaction(txHash);
        if (tx) {
            const receipt = await ethers.provider.getTransactionReceipt(txHash);
            console.log("✅ Transaction found in current provider");
            console.log(`   Status: ${receipt?.status === 1 ? 'Success' : 'Failed'}`);
            console.log(`   Block: ${receipt?.blockNumber}`);
            console.log(`   Gas Used: ${receipt?.gasUsed?.toString()}`);
        } else {
            console.log("❌ Transaction not found in current provider");
        }
    } catch (e) {
        console.log("❌ Error checking transaction:", e.message.slice(0, 80));
    }
    
    console.log(`\n💰 Balance check for: ${address.slice(0, 10)}...`);
    console.log("RPC Endpoint".padEnd(20) + "Balance (ETH)".padEnd(15) + "Block Height".padEnd(15) + "Status");
    console.log("-".repeat(70));
    
    for (const rpc of rpcEndpoints) {
        try {
            const provider = new ethers.JsonRpcProvider(rpc.url);
            const balance = await provider.getBalance(address);
            const blockNumber = await provider.getBlockNumber();
            const balanceEth = ethers.formatEther(balance);
            
            console.log(
                rpc.name.padEnd(20) + 
                balanceEth.slice(0, 12).padEnd(15) + 
                blockNumber.toString().padEnd(15) + 
                (parseFloat(balanceEth) > 0 ? "✅" : "❌")
            );
        } catch (error) {
            console.log(
                rpc.name.padEnd(20) + 
                "ERROR".padEnd(15) + 
                "-".padEnd(15) + 
                "❌"
            );
        }
    }
    
    // Additional checks
    console.log("\n🔧 Additional Diagnostics:");
    console.log("- If all show 0 ETH but transaction is successful, likely RPC sync delay");
    console.log("- If some show balance, use those endpoints for deployment");
    console.log("- If none show balance, transaction may have failed/reverted");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

