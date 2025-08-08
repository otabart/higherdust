const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Attempting deployment with gas optimization...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Contract addresses
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const WETH = "0x4200000000000000000000000000000000000006";
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const UNISWAP_V3_POSITION_MANAGER = "0x0000000000000000000000000000000000000000";
  const CUSTOM_DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
  const CUSTOM_POL_WALLET = "0xD2a963866BD6d8de525aC726Ac79Ddf46c287486";
  
  try {
    // Get gas price
    const gasPrice = await deployer.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
    
    // Estimate gas
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    
    console.log("🔨 Deploying SplitRouter with custom addresses...");
    console.log("  HIGHER Token:", HIGHER_TOKEN);
    console.log("  WETH:", WETH);
    console.log("  POL Wallet:", CUSTOM_POL_WALLET);
    console.log("  Uniswap Router:", UNISWAP_V3_ROUTER);
    console.log("  Uniswap Quoter:", UNISWAP_V3_QUOTER);
    console.log("  Dev Wallet:", CUSTOM_DEV_WALLET);
    
    // Deploy with EIP-1559 gas settings only
    const splitRouter = await SplitRouter.deploy(
      HIGHER_TOKEN,
      WETH,
      CUSTOM_POL_WALLET, // Use custom POL wallet instead of pool address
      UNISWAP_V3_ROUTER,
      UNISWAP_V3_QUOTER,
      UNISWAP_V3_POSITION_MANAGER,
      CUSTOM_DEV_WALLET,
      {
        gasLimit: 500000,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
      }
    );
    
    console.log("⏳ Waiting for deployment...");
    await splitRouter.waitForDeployment();
    
    const deployedAddress = await splitRouter.getAddress();
    console.log("✅ SplitRouter deployed to:", deployedAddress);
    
    console.log("\n📋 Deployment Summary:");
    console.log("  🎯 Custom Dev Wallet (2% platform fee):", CUSTOM_DEV_WALLET);
    console.log("  🎯 Custom POL Wallet (18% POL share):", CUSTOM_POL_WALLET);
    console.log("  📄 Contract Address:", deployedAddress);
    console.log("  ⛽ Gas Used:", await splitRouter.deploymentTransaction().gasLimit.toString());
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Balance check failed. Trying alternative RPC...");
      
      // Try with different RPC
      try {
        const provider = new ethers.JsonRpcProvider("https://1rpc.io/base");
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const balance = await provider.getBalance(deployer.address);
        console.log("💰 Balance on alternative RPC:", ethers.formatEther(balance), "ETH");
        
        if (balance > 0n) {
          console.log("✅ Balance found! Retrying deployment...");
          // Retry deployment logic here
        }
      } catch (altError) {
        console.log("❌ Alternative RPC also failed:", altError.message);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
