const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking balance using Alchemy RPC on Base mainnet...");
  
  const walletAddress = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  console.log("Target address:", walletAddress);
  console.log("Network: Base mainnet (chainId: 8453)");
  
  try {
    // Explicitly use Base mainnet Alchemy endpoint
    const alchemyProvider = new ethers.JsonRpcProvider("https://base-mainnet.g.alchemy.com/v2/dTxr0wyeId8QtiuPENJXt");
    
    // Verify we're on the correct network
    const network = await alchemyProvider.getNetwork();
    console.log("Connected to network:", network.name, "ChainId:", network.chainId);
    
    if (network.chainId !== 8453n) {
      console.log("❌ Wrong network! Expected Base mainnet (8453), got:", network.chainId);
      return;
    }
    
    const balance = await alchemyProvider.getBalance(walletAddress);
    console.log("💰 Alchemy RPC Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance > 0n) {
      console.log("✅ Balance found! Ready for deployment.");
      return true;
    } else {
      console.log("❌ Zero balance on Alchemy RPC");
      return false;
    }
  } catch (error) {
    console.log("❌ Alchemy RPC check failed:", error.message);
    return false;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
