const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking wallet balance...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Raw balance:", balance.toString());
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    // Convert to wei for comparison
    const balanceWei = balance.toString();
    const zeroWei = "0";
    
    if (balanceWei === zeroWei) {
      console.log("❌ No ETH found. Please send ETH to:", deployer.address);
      console.log("💡 You can send ETH from any exchange or wallet to this address");
    } else {
      console.log("✅ ETH found! Ready to deploy.");
      console.log("💰 Available for gas:", ethers.formatEther(balance), "ETH");
    }
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    console.log("🔧 Trying alternative method...");
    
    // Try direct RPC call
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL || "https://mainnet.base.org");
      const balance = await provider.getBalance(deployer.address);
      console.log("Alternative check - Balance:", ethers.formatEther(balance), "ETH");
    } catch (altError) {
      console.error("❌ Alternative method also failed:", altError.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
