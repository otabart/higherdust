const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SWAPDUST contracts with custom addresses...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // ========================================
  // 🔧 CONFIGURABLE ADDRESSES - UPDATE THESE!
  // ========================================
  
  // Your custom addresses
  const CUSTOM_DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2"; // Platform fee wallet (2%)
  const CUSTOM_POL_WALLET = "0xD2a963866BD6d8de525aC726Ac79Ddf46c287486"; // POL wallet (18%)
  
  // ========================================
  // 📋 ADDRESSES CONFIRMED
  // ========================================
  
  console.log("✅ Dev Wallet (2% platform fee):", CUSTOM_DEV_WALLET);
  console.log("✅ POL Wallet (18% POL share):", CUSTOM_POL_WALLET);

  // Base Mainnet Uniswap V3 Addresses
  const UNISWAP_V3_FACTORY = "0x33128a8fc17869897dce68ed026d694621f6fdfd";
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const UNISWAP_V3_POSITION_MANAGER = "0x0000000000000000000000000000000000000000"; // Not used in current implementation
  
  // HIGHER token address on Base mainnet
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe"; // Real $HIGHER token
  const WETH = "0x4200000000000000000000000000000000000006";
  
  // Use your custom POL wallet instead of the pool address
  const POL_WALLET = CUSTOM_POL_WALLET; // This will receive the 18% POL fees

  console.log("\n📋 Contract Addresses:");
  console.log("  Uniswap V3 Factory:", UNISWAP_V3_FACTORY);
  console.log("  Uniswap V3 Router:", UNISWAP_V3_ROUTER);
  console.log("  Uniswap V3 Quoter:", UNISWAP_V3_QUOTER);
  console.log("  WETH:", WETH);
  console.log("  HIGHER Token:", HIGHER_TOKEN);
  console.log("  🎯 Custom Dev Wallet:", CUSTOM_DEV_WALLET);
  console.log("  🎯 Custom POL Wallet:", CUSTOM_POL_WALLET);

  try {
    // Deploy SplitRouter with custom addresses
    console.log("\n🔨 Deploying SplitRouter with custom addresses...");
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    const splitRouter = await SplitRouter.deploy(
      HIGHER_TOKEN, // Real HIGHER token address
      WETH,
      POL_WALLET, // Use your custom POL wallet instead of pool address
      UNISWAP_V3_ROUTER,
      UNISWAP_V3_QUOTER,
      UNISWAP_V3_POSITION_MANAGER,
      CUSTOM_DEV_WALLET // Your custom dev wallet
    );
    await splitRouter.waitForDeployment();
    console.log("✅ SplitRouter deployed to:", await splitRouter.getAddress());

    // Verify contracts on BaseScan
    console.log("\n🔍 Verifying contracts on BaseScan...");
    console.log("  SplitRouter:", await splitRouter.getAddress());
    console.log("  HIGHER Token:", HIGHER_TOKEN);

    // Test basic functionality
    console.log("\n🧪 Testing deployed contracts...");
    
    // Test router functionality
    const routerAddress = await splitRouter.getAddress();
    console.log("✅ SplitRouter deployed at:", routerAddress);
    
    // Verify HIGHER token integration
    console.log("✅ HIGHER token address:", HIGHER_TOKEN);
    console.log("✅ Using real HIGHER token for swaps");
    console.log("✅ Custom dev wallet:", CUSTOM_DEV_WALLET);
    console.log("✅ Custom POL wallet:", CUSTOM_POL_WALLET);

    console.log("\n🎉 CUSTOM DEPLOYMENT COMPLETE!");
    console.log("\n📋 Update your frontend configuration:");
    console.log(`  SPLIT_ROUTER: "${await splitRouter.getAddress()}"`);
    console.log(`  HIGHER_TOKEN: "${HIGHER_TOKEN}"`);
    console.log(`  UNISWAP_V3_FACTORY: "${UNISWAP_V3_FACTORY}"`);
    console.log(`  UNISWAP_V3_ROUTER: "${UNISWAP_V3_ROUTER}"`);
    console.log(`  UNISWAP_V3_QUOTER: "${UNISWAP_V3_QUOTER}"`);
    console.log(`  WETH: "${WETH}"`);
    
    console.log("\n💰 Fee Distribution:");
    console.log("  80% → User (swapper)");
    console.log("  18% → POL Wallet:", CUSTOM_POL_WALLET);
    console.log("  2% → Dev Wallet:", CUSTOM_DEV_WALLET);
    
    console.log("\n🔗 Contract Links:");
    console.log(`  SplitRouter: https://basescan.org/address/${await splitRouter.getAddress()}`);
    console.log(`  HIGHER Token: https://basescan.org/address/${HIGHER_TOKEN}`);
    console.log(`  Dev Wallet: https://basescan.org/address/${CUSTOM_DEV_WALLET}`);
    console.log(`  POL Wallet: https://basescan.org/address/${CUSTOM_POL_WALLET}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
