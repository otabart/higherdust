const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying transaction using Alchemy RPC...");
  
  const txHash = "0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f";
  const walletAddress = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  
  console.log("Transaction Hash:", txHash);
  console.log("Wallet Address:", walletAddress);
  console.log("Network: Base mainnet (chainId: 8453)");
  
  try {
    const alchemyProvider = new ethers.JsonRpcProvider("https://base-mainnet.g.alchemy.com/v2/dTxr0wyeId8QtiuPENJXt");
    
    // Verify network
    const network = await alchemyProvider.getNetwork();
    console.log("Connected to network:", network.name, "ChainId:", network.chainId);
    
    // Check transaction details
    const tx = await alchemyProvider.getTransaction(txHash);
    const receipt = await alchemyProvider.getTransactionReceipt(txHash);
    
    if (tx) {
      console.log("\n📋 Transaction Details (Alchemy):");
      console.log("  From:", tx.from);
      console.log("  To:", tx.to);
      console.log("  Value:", ethers.formatEther(tx.value), "ETH");
      console.log("  Gas Price:", ethers.formatUnits(tx.gasPrice, "gwei"), "gwei");
      console.log("  Gas Limit:", tx.gasLimit.toString());
      
      if (receipt) {
        console.log("\n📋 Transaction Receipt (Alchemy):");
        console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
        console.log("  Gas Used:", receipt.gasUsed.toString());
        console.log("  Block Number:", receipt.blockNumber);
        
        if (receipt.status === 0) {
          console.log("❌ Transaction failed - this explains the 0 balance");
        } else {
          console.log("✅ Transaction succeeded - checking if recipient is correct");
          
          // Check if the recipient matches our wallet
          if (tx.to?.toLowerCase() === walletAddress.toLowerCase()) {
            console.log("✅ Recipient address matches our wallet");
          } else {
            console.log("❌ Recipient address mismatch!");
            console.log("  Expected:", walletAddress);
            console.log("  Actual:", tx.to);
          }
        }
      } else {
        console.log("❌ No receipt found - transaction might be pending");
      }
    } else {
      console.log("❌ Transaction not found on Alchemy RPC");
    }
  } catch (error) {
    console.log("❌ Error checking transaction:", error.message);
  }
  
  console.log("\n🔗 Check on BaseScan:");
  console.log("https://basescan.org/tx/0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f");
  
  console.log("\n🔗 Check wallet balance:");
  console.log("https://basescan.org/address/0x0B3520A5C09f27c6ac7702e74a751583024d81A2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
