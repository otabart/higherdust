const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking wallet balance with alternative method...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Try multiple RPC endpoints
  const rpcUrls = [
    "https://mainnet.base.org",
    "https://base.blockpi.network/v1/rpc/public",
    "https://1rpc.io/base",
    "https://base.meowrpc.com"
  ];
  
  for (let i = 0; i < rpcUrls.length; i++) {
    const rpcUrl = rpcUrls[i];
    console.log(`\n🔧 Trying RPC endpoint ${i + 1}: ${rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(deployer.address);
      console.log(`✅ Balance found: ${ethers.formatEther(balance)} ETH`);
      
      if (balance > 0n) {
        console.log("💰 Sufficient balance for deployment!");
        return;
      } else {
        console.log("❌ Zero balance on this endpoint");
      }
    } catch (error) {
      console.log(`❌ Failed with endpoint ${i + 1}: ${error.message}`);
    }
  }
  
  console.log("\n❌ All RPC endpoints show zero balance or failed");
  console.log("💡 Please ensure ETH has been sent to:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
