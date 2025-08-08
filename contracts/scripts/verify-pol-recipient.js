const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying POL recipient in deployed contract...");
  
  const contractAddress = "0x387c8227382e14D908F1959ce6eC22df227F229A";
  
  // Get contract instance
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  const contract = SplitRouter.attach(contractAddress);
  
  console.log("📋 Contract Address:", contractAddress);
  
  try {
    // Check POL recipient
    const polRecipient = await contract.POL_RECIPIENT();
    console.log("🎯 POL Recipient:", polRecipient);
    
    if (polRecipient.toLowerCase() === "0xd2a963866bd6d8de525ac726ac79ddf46c287486") {
      console.log("✅ POL Recipient is CORRECT!");
    } else {
      console.log("❌ POL Recipient is INCORRECT!");
      console.log("Expected: 0xD2a963866BD6d8de525aC726Ac79Ddf46c287486");
      console.log("Actual:  ", polRecipient);
    }
    
    // Check other key addresses
    console.log("\n📋 Other Contract Settings:");
    console.log("HIGHER Token:", await contract.HIGHER());
    console.log("WETH:", await contract.WETH());
    console.log("Dev Wallet:", await contract.DEV_WALLET());
    console.log("User Share:", await contract.USER_SHARE(), "%");
    console.log("POL Share:", await contract.POL_SHARE(), "%");
    console.log("Platform Fee:", await contract.PLATFORM_FEE(), "%");
    
  } catch (error) {
    console.error("❌ Error checking contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
