const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SWAPDUST contracts with retry mechanism...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Try multiple RPC endpoints for deployment
  const rpcUrls = [
    "https://1rpc.io/base",
    "https://mainnet.base.org",
    "https://base.blockpi.network/v1/rpc/public"
  ];
  
  for (let i = 0; i < rpcUrls.length; i++) {
    const rpcUrl = rpcUrls[i];
    console.log(`\n🔧 Attempt ${i + 1}: Using RPC endpoint ${i + 1}: ${rpcUrl}`);
    
    try {
      // Create a new provider for this attempt
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      
      // Check balance with this provider
      const balance = await provider.getBalance(deployer.address);
      console.log(`💰 Balance on endpoint ${i + 1}: ${ethers.formatEther(balance)} ETH`);
      
      if (balance > 0n) {
        console.log("✅ Sufficient balance found! Proceeding with deployment...");
        
        // Deploy the contract
        const SplitRouter = await ethers.getContractFactory("SplitRouter", signer);
        
        console.log("🔨 Deploying SplitRouter with custom addresses...");
        
        const CUSTOM_DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
        const CUSTOM_POL_WALLET = "0xD2a963866BD6d8de525aC726Ac79Ddf46c287486";
        
        const splitRouter = await SplitRouter.deploy(CUSTOM_DEV_WALLET, CUSTOM_POL_WALLET);
        await splitRouter.waitForDeployment();
        
        const deployedAddress = await splitRouter.getAddress();
        console.log("✅ SplitRouter deployed to:", deployedAddress);
        
        console.log("\n📋 Deployment Summary:");
        console.log("  🎯 Custom Dev Wallet (2% platform fee):", CUSTOM_DEV_WALLET);
        console.log("  🎯 Custom POL Wallet (18% POL share):", CUSTOM_POL_WALLET);
        console.log("  📄 Contract Address:", deployedAddress);
        
        return;
      } else {
        console.log("❌ Zero balance on this endpoint, trying next...");
      }
    } catch (error) {
      console.log(`❌ Failed with endpoint ${i + 1}: ${error.message}`);
    }
  }
  
  console.log("\n❌ All deployment attempts failed");
  console.log("💡 The transaction may still be pending. Please wait a few more minutes and try again.");
  console.log("🔍 Transaction hash: 0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
