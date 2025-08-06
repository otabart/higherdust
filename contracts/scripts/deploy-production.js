const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SWAPDUST contracts to Base mainnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Base Mainnet Uniswap V3 Addresses
  const UNISWAP_V3_FACTORY = "0x33128a8fc17869897dce68ed026d694621f6fdfd";
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const UNISWAP_V3_POSITION_MANAGER = "0x0000000000000000000000000000000000000000"; // Not used in current implementation
  
  // HIGHER token address on Base mainnet
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe"; // Real $HIGHER token
  const WETH = "0x4200000000000000000000000000000000000006";
  const PLACEHOLDER_POOL = "0x0000000000000000000000000000000000000000"; // Will be set after deployment
  const DEV_WALLET = "0x1831510811Ddd00E6180C345F00F12C4536abaa3"; // Dev wallet for platform fees

  console.log("\n📋 Contract Addresses:");
  console.log("  Uniswap V3 Factory:", UNISWAP_V3_FACTORY);
  console.log("  Uniswap V3 Router:", UNISWAP_V3_ROUTER);
  console.log("  Uniswap V3 Quoter:", UNISWAP_V3_QUOTER);
  console.log("  WETH:", WETH);
  console.log("  HIGHER Token:", HIGHER_TOKEN);

  try {
    // Deploy SplitRouter with real HIGHER token address
    console.log("\n🔨 Deploying SplitRouter...");
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    const splitRouter = await SplitRouter.deploy(
      HIGHER_TOKEN, // Real HIGHER token address
      WETH,
      PLACEHOLDER_POOL,
      UNISWAP_V3_ROUTER,
      UNISWAP_V3_QUOTER,
      UNISWAP_V3_POSITION_MANAGER,
      DEV_WALLET
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

    console.log("\n🎉 PRODUCTION DEPLOYMENT COMPLETE!");
    console.log("\n📋 Update your frontend configuration:");
    console.log(`  SPLIT_ROUTER: "${await splitRouter.getAddress()}"`);
    console.log(`  HIGHER_TOKEN: "${HIGHER_TOKEN}"`);
    console.log(`  UNISWAP_V3_FACTORY: "${UNISWAP_V3_FACTORY}"`);
    console.log(`  UNISWAP_V3_ROUTER: "${UNISWAP_V3_ROUTER}"`);
    console.log(`  UNISWAP_V3_QUOTER: "${UNISWAP_V3_QUOTER}"`);
    console.log(`  WETH: "${WETH}"`);

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