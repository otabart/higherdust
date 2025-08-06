const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SWAPDUST SplitRouter to Base Sepolia Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Base Sepolia Testnet Addresses
  const UNISWAP_V3_FACTORY = "0x0227628f3F023bb0B980b67D528571c951c9bC62";
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bE551Fcac6619C22f1B9C6Fd6";
  
  // Testnet token addresses (you'll need to deploy or use existing testnet tokens)
  const HIGHER_TOKEN = "0x0000000000000000000000000000000000000000"; // TODO: Deploy or use existing
  const WETH = "0x4200000000000000000000000000000000000006";
  
  // Testnet pool (you'll need to create this pool)
  const ETH_HIGHER_POOL = "0x0000000000000000000000000000000000000000"; // TODO: Create pool

  console.log("\n📋 Contract Addresses:");
  console.log("Uniswap V3 Factory:", UNISWAP_V3_FACTORY);
  console.log("Uniswap V3 Router:", UNISWAP_V3_ROUTER);
  console.log("Uniswap V3 Quoter:", UNISWAP_V3_QUOTER);
  console.log("Uniswap V3 Position Manager:", UNISWAP_V3_POSITION_MANAGER);
  console.log("HIGHER Token:", HIGHER_TOKEN);
  console.log("WETH:", WETH);
  console.log("ETH/HIGHER Pool:", ETH_HIGHER_POOL);
  console.log("Dev Wallet:", process.env.DEV_WALLET || deployer.address);

  // Check if we have the required tokens
  if (HIGHER_TOKEN === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠️  WARNING: HIGHER_TOKEN address not set!");
    console.log("   You need to either:");
    console.log("   1. Deploy a test HIGHER token");
    console.log("   2. Use an existing token on Base Sepolia");
    console.log("   3. Update the HIGHER_TOKEN address in this script");
    return;
  }

  if (ETH_HIGHER_POOL === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠️  WARNING: ETH_HIGHER_POOL address not set!");
    console.log("   You need to create a WETH/HIGHER pool on Uniswap V3");
    console.log("   or use an existing pool address");
    return;
  }

  // Deploy SplitRouter
  console.log("\n🔧 Deploying SplitRouter...");
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  const router = await SplitRouter.deploy(
    HIGHER_TOKEN,
    WETH,
    ETH_HIGHER_POOL,
    UNISWAP_V3_ROUTER,
    UNISWAP_V3_QUOTER,
    UNISWAP_V3_POSITION_MANAGER
  );
  await router.deployed();
  console.log("✅ SplitRouter deployed to:", router.address);

  // Verify contracts on BaseScan Sepolia
  console.log("\n🔍 Verifying contracts on BaseScan Sepolia...");
  
  try {
    await hre.run("verify:verify", {
      address: router.address,
      constructorArguments: [
        HIGHER_TOKEN,
        WETH,
        ETH_HIGHER_POOL,
        UNISWAP_V3_ROUTER,
        UNISWAP_V3_QUOTER,
        UNISWAP_V3_POSITION_MANAGER
      ],
    });
    console.log("✅ SplitRouter verified on BaseScan Sepolia");
  } catch (error) {
    console.log("❌ Error verifying SplitRouter:", error.message);
  }

  console.log("\n🎉 Testnet deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("SplitRouter:", router.address);
  
  console.log("\n📋 Update your frontend with these addresses:");
  console.log(`SPLIT_ROUTER: "${router.address}"`);
  console.log(`HIGHER_TOKEN: "${HIGHER_TOKEN}"`);
  
  console.log("\n🔗 Contract Links:");
  console.log(`SplitRouter: https://sepolia.basescan.org/address/${router.address}`);
  console.log(`HIGHER Token: https://sepolia.basescan.org/address/${HIGHER_TOKEN}`);
  
  console.log("\n🧪 Next Steps:");
  console.log("1. Test the contract functions");
  console.log("2. Create test transactions");
  console.log("3. Verify everything works before mainnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 