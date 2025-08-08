const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking balance on both Ethereum mainnet and Base mainnet...");
  
  // Use the actual wallet address from the transaction
  const walletAddress = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  console.log("Target address:", walletAddress);
  
  // Check Base mainnet balance
  console.log("\n🌐 Checking Base mainnet balance...");
  try {
    const baseProvider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const baseBalance = await baseProvider.getBalance(walletAddress);
    console.log("💰 Base mainnet balance:", ethers.formatEther(baseBalance), "ETH");
  } catch (error) {
    console.log("❌ Base mainnet check failed:", error.message);
  }
  
  // Check Ethereum mainnet balance
  console.log("\n🔗 Checking Ethereum mainnet balance...");
  try {
    const ethProvider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const ethBalance = await ethProvider.getBalance(walletAddress);
    console.log("💰 Ethereum mainnet balance:", ethers.formatEther(ethBalance), "ETH");
  } catch (error) {
    console.log("❌ Ethereum mainnet check failed:", error.message);
  }
  
  console.log("\n💡 If you have ETH on Ethereum mainnet but not on Base:");
  console.log("1. Use the Base Bridge: https://bridge.base.org");
  console.log("2. Bridge your ETH from Ethereum mainnet to Base mainnet");
  console.log("3. Wait for the bridge transaction to complete (usually 10-20 minutes)");
  console.log("4. Then try deployment again");
  
  console.log("\n🔍 Transaction details:");
  console.log("Hash: 0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f");
  console.log("Network: Base mainnet");
  console.log("Amount: 0.0019 ETH");
  console.log("Recipient: 0x0B3520A5C09f27c6ac7702e74a751583024d81A2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
