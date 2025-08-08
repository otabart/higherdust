const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 Preparing contract for manual deployment...");
  
  // Compile contracts
  await hre.run("compile");
  
  // Get the SplitRouter contract
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  
  // Get constructor arguments
  const CUSTOM_DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  const CUSTOM_POL_WALLET = "0xD2a963866BD6d8de525aC726Ac79Ddf46c287486";
  
  console.log("📋 Constructor Arguments:");
  console.log("  Dev Wallet:", CUSTOM_DEV_WALLET);
  console.log("  POL Wallet:", CUSTOM_POL_WALLET);
  
  // Get bytecode and ABI
  const bytecode = SplitRouter.bytecode;
  const abi = SplitRouter.interface.format();
  
  // Create deployment data
  const deploymentData = {
    contractName: "SplitRouter",
    constructorArgs: [CUSTOM_DEV_WALLET, CUSTOM_POL_WALLET],
    bytecode: bytecode,
    abi: abi,
    network: "Base Mainnet",
    chainId: 8453,
    gasEstimate: "~500,000 gas",
    deploymentInstructions: [
      "1. Go to https://basescan.org/address/0x0000000000000000000000000000000000000000#writeContract",
      "2. Connect your wallet (MetaMask)",
      "3. Paste the bytecode in the 'Contract Creation Code' field",
      "4. Add constructor arguments:",
      `   - Dev Wallet: ${CUSTOM_DEV_WALLET}`,
      `   - POL Wallet: ${CUSTOM_POL_WALLET}`,
      "5. Set gas limit to 500,000",
      "6. Deploy the contract"
    ]
  };
  
  // Save to file
  const outputPath = path.join(__dirname, "../manual-deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  
  console.log("\n✅ Manual deployment data saved to:", outputPath);
  console.log("\n📄 For Remix IDE:");
  console.log("1. Open https://remix.ethereum.org");
  console.log("2. Create new file: SplitRouter.sol");
  console.log("3. Paste the contract source code");
  console.log("4. Compile and deploy with constructor arguments");
  
  console.log("\n🔗 Useful Links:");
  console.log("- BaseScan: https://basescan.org");
  console.log("- Remix IDE: https://remix.ethereum.org");
  console.log("- Base Bridge: https://bridge.base.org");
  
  console.log("\n⚠️  IMPORTANT: Keep your private key secure!");
  console.log("   Private Key: 0x10d7528cf816ce4bee3ce841e3bd2f186afdcdbdca4087d9ed972ac5bba1d4bf");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
