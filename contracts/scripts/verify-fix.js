const { ethers } = require("hardhat");

async function verifyFix() {
    const address = "0xF2D5cDd5637773b1AfeCE21bcFD5694B600239E5";
    
    console.log("🔍 Verifying RPC Fix");
    console.log("===================");
    
    try {
        // Check balance with new RPC
        const balance = await ethers.provider.getBalance(address);
        const balanceEth = ethers.formatEther(balance);
        
        console.log(`💰 Balance: ${balanceEth} ETH`);
        console.log(`📍 Address: ${address}`);
        
        if (parseFloat(balanceEth) > 0) {
            console.log("✅ SUCCESS! Balance found - ready to deploy");
            
            // Check network details
            const network = await ethers.provider.getNetwork();
            const blockNumber = await ethers.provider.getBlockNumber();
            
            console.log(`🌐 Network: ${network.name} (${network.chainId})`);
            console.log(`📊 Block: ${blockNumber}`);
            
            // Estimate deployment gas
            console.log("\n⛽ Gas Estimation:");
            const gasPrice = await ethers.provider.getFeeData();
            const estimatedGas = 2000000n; // Typical contract deployment
            const estimatedCost = estimatedGas * gasPrice.gasPrice;
            const costEth = ethers.formatEther(estimatedCost);
            
            console.log(`   Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
            console.log(`   Estimated Cost: ${costEth} ETH`);
            console.log(`   Available: ${balanceEth} ETH`);
            
            if (parseFloat(balanceEth) > parseFloat(costEth)) {
                console.log("✅ Sufficient balance for deployment!");
                console.log("\n🚀 Ready to deploy! Run:");
                console.log("   npx hardhat run scripts/deploy-mainnet.js --network base");
            } else {
                console.log("⚠️  Might need more ETH for deployment");
            }
            
        } else {
            console.log("❌ Still showing 0 ETH - RPC issue persists");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main = verifyFix;
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
