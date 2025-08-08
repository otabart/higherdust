const { ethers } = require("hardhat");

async function testBalance() {
    const address = "0xF2D5cDd5637773b1AfeCE21bcFD5694B600239E5";
    
    console.log("🔍 Testing Hardhat RPC Balance Detection");
    console.log("========================================");
    
    try {
        console.log(`📍 Address: ${address}`);
        console.log(`🌐 Network: ${(await ethers.provider.getNetwork()).name}`);
        console.log(`📊 Block: ${await ethers.provider.getBlockNumber()}`);
        
        const balance = await ethers.provider.getBalance(address);
        const balanceEth = ethers.formatEther(balance);
        
        console.log(`💰 Balance: ${balanceEth} ETH`);
        
        if (parseFloat(balanceEth) > 0) {
            console.log("✅ SUCCESS! Balance detected - ready to deploy");
            console.log("🚀 Run: npx hardhat run scripts/deploy-new-wallet.js --network base");
        } else {
            console.log("❌ Still showing 0 ETH - RPC config issue");
            console.log("🔧 Make sure hardhat.config.js uses PublicNode RPC");
        }
        
        // Test gas estimation
        const gasPrice = await ethers.provider.getFeeData();
        console.log(`⛽ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

testBalance().catch(console.error);
