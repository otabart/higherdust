const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Direct deployment attempt...");
  
  // Use a more reliable RPC endpoint
  const rpcUrl = "https://1rpc.io/base";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  
  const signer = new ethers.Wallet(privateKey, provider);
  const address = await signer.getAddress();
  
  console.log("Deploying with account:", address);
  
  // Check balance
  const balance = await provider.getBalance(address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("❌ No balance found. Please wait a few more minutes for the transaction to be reflected.");
    console.log("🔍 Transaction hash: 0xaa10a6c765f93f146e0448ea15913f5f5b3a08dffe6e9147d94384eb17b8920f");
    return;
  }
  
  console.log("✅ Balance found! Proceeding with deployment...");
  
  // Deploy the contract
  const SplitRouter = await ethers.getContractFactory("SplitRouter", signer);
  
  const CUSTOM_DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  const CUSTOM_POL_WALLET = "0xD2a963866BD6d8de525aC726Ac79Ddf46c287486";
  
  console.log("🔨 Deploying SplitRouter...");
  const splitRouter = await SplitRouter.deploy(CUSTOM_DEV_WALLET, CUSTOM_POL_WALLET);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await splitRouter.waitForDeployment();
  
  const deployedAddress = await splitRouter.getAddress();
  console.log("✅ SplitRouter deployed to:", deployedAddress);
  
  console.log("\n📋 Deployment Summary:");
  console.log("  🎯 Custom Dev Wallet (2% platform fee):", CUSTOM_DEV_WALLET);
  console.log("  🎯 Custom POL Wallet (18% POL share):", CUSTOM_POL_WALLET);
  console.log("  📄 Contract Address:", deployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
