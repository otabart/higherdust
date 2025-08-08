const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking wallet balance via BaseScan API...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // BaseScan API URL
  const apiKey = process.env.BASESCAN_API_KEY || "XTXZXT8SR86YU5PMVFEM8QYENBAUP8PC5X";
  const apiUrl = `https://api.basescan.org/api?module=account&action=balance&address=${deployer.address}&tag=latest&apikey=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.status === "1") {
      const balanceWei = data.result;
      const balanceEth = ethers.formatEther(balanceWei);
      console.log(`✅ BaseScan API Balance: ${balanceEth} ETH`);
      
      if (parseFloat(balanceEth) > 0) {
        console.log("💰 Sufficient balance for deployment!");
        return;
      } else {
        console.log("❌ Zero balance on BaseScan");
      }
    } else {
      console.log("❌ BaseScan API error:", data.message);
    }
  } catch (error) {
    console.log("❌ Failed to check BaseScan API:", error.message);
  }
  
  console.log("\n💡 If you recently sent ETH, it may take 2-5 minutes to confirm on Base");
  console.log("🔍 You can check the transaction status on: https://basescan.org/address/" + deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
