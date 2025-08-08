const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Starting balance retry check (30 minutes max)...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Target address:", deployer.address);
  console.log("Expected balance: 0.0019 ETH (from confirmed transaction)");
  
  const rpcUrls = [
    "https://mainnet.base.org",
    "https://1rpc.io/base",
    "https://base.blockpi.network/v1/rpc/public"
  ];
  
  const maxAttempts = 15; // 30 minutes / 2 minutes = 15 attempts
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`\n⏰ Attempt ${attempt}/${maxAttempts} (${attempt * 2} minutes elapsed)`);
    
    for (let i = 0; i < rpcUrls.length; i++) {
      const rpcUrl = rpcUrls[i];
      console.log(`  🔍 Checking ${rpcUrl}...`);
      
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(deployer.address);
        const balanceEth = ethers.formatEther(balance);
        
        console.log(`    💰 Balance: ${balanceEth} ETH`);
        
        if (parseFloat(balanceEth) > 0) {
          console.log(`\n✅ SUCCESS! Balance found on ${rpcUrl}`);
          console.log(`💰 Available: ${balanceEth} ETH`);
          console.log(`⏱️  Time to sync: ${attempt * 2} minutes`);
          return;
        }
      } catch (error) {
        console.log(`    ❌ Failed: ${error.message}`);
      }
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting 2 minutes before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes
    }
  }
  
  console.log("\n❌ No balance detected after 30 minutes");
  console.log("💡 This suggests a widespread Base RPC sync issue");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
