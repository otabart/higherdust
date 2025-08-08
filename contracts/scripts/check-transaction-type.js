const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Analyzing transaction type...");
  
  const txHash = "0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f";
  const walletAddress = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  
  try {
    const alchemyProvider = new ethers.JsonRpcProvider("https://base-mainnet.g.alchemy.com/v2/dTxr0wyeId8QtiuPENJXt");
    
    const tx = await alchemyProvider.getTransaction(txHash);
    const receipt = await alchemyProvider.getTransactionReceipt(txHash);
    
    if (tx) {
      console.log("\n📋 Transaction Analysis:");
      console.log("  From:", tx.from);
      console.log("  To:", tx.to);
      console.log("  Value:", ethers.formatEther(tx.value), "ETH");
      console.log("  Data:", tx.data);
      
      // Check if this is a contract interaction
      if (tx.data && tx.data !== "0x") {
        console.log("⚠️  This appears to be a contract interaction, not a simple ETH transfer!");
        console.log("  The 'data' field contains:", tx.data);
        console.log("  This might explain why the balance isn't showing up as expected.");
      } else {
        console.log("✅ This is a simple ETH transfer (no contract data)");
      }
      
      if (receipt) {
        console.log("\n📋 Receipt Analysis:");
        console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
        console.log("  Gas Used:", receipt.gasUsed.toString());
        console.log("  Logs:", receipt.logs.length, "log entries");
        
        if (receipt.logs.length > 0) {
          console.log("⚠️  Transaction has logs - this indicates contract interaction");
        }
      }
    }
  } catch (error) {
    console.log("❌ Error analyzing transaction:", error.message);
  }
  
  console.log("\n💡 Possible explanations:");
  console.log("1. Transaction might be a contract interaction (bridge, swap, etc.)");
  console.log("2. ETH might be locked in a contract");
  console.log("3. There might be a significant RPC delay");
  console.log("4. The transaction might have been reverted despite showing success");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
