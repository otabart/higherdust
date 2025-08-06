const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying HigherDust SplitRouter to Base Mainnet...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  try {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("Account balance: Unable to fetch");
  }

  // Base Mainnet Network Addresses
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32c04bf3be551fcac6619c22f1b9c6fd6";
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe"; // Real $HIGHER token
  const WETH = "0x4200000000000000000000000000000000000006";
  const ETH_HIGHER_POOL = "0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0"; // Real ETH/HIGHER pool
  const ETH_USD_PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
  const DEV_WALLET = "0x1831510811Ddd00E6180C345F00F12C4536abaa3";

  console.log("\n📋 Contract Addresses:");
  console.log("Uniswap V3 Router:", UNISWAP_V3_ROUTER);
  console.log("Uniswap V3 Position Manager:", UNISWAP_V3_POSITION_MANAGER);
  console.log("HIGHER Token:", HIGHER_TOKEN);
  console.log("WETH:", WETH);
  console.log("ETH/HIGHER Pool:", ETH_HIGHER_POOL);
  console.log("ETH/USD Price Feed:", ETH_USD_PRICE_FEED);
  console.log("Dev Wallet:", DEV_WALLET);

  console.log("\n🔧 Deploying SplitRouterQuoter...");
  const SplitRouterQuoter = await ethers.getContractFactory("SplitRouterQuoter");
  const quoter = await SplitRouterQuoter.deploy(HIGHER_TOKEN, WETH, ETH_USD_PRICE_FEED);
  await quoter.waitForDeployment();
  console.log("✅ SplitRouterQuoter deployed to:", await quoter.getAddress());

  console.log("\n🔧 Deploying SplitRouter...");
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  const router = await SplitRouter.deploy(HIGHER_TOKEN, WETH, ETH_HIGHER_POOL, UNISWAP_V3_ROUTER, UNISWAP_V3_POSITION_MANAGER);
  await router.waitForDeployment();
  console.log("✅ SplitRouter deployed to:", await router.getAddress());

  console.log("\n🔍 Verifying contracts on BaseScan...");
  try {
    console.log("Attempting to verify SplitRouterQuoter...");
    await hre.run("verify:verify", {
      address: await quoter.getAddress(),
      constructorArguments: [HIGHER_TOKEN, WETH, ETH_USD_PRICE_FEED],
      network: "base",
    });
    console.log("✅ SplitRouterQuoter verified on BaseScan");
  } catch (error) {
    console.log("⚠️ Error verifying SplitRouterQuoter:", error.message);
    console.log(`📋 Manual verification URL: https://basescan.org/address/${await quoter.getAddress()}#code`);
  }

  try {
    console.log("Attempting to verify SplitRouter...");
    await hre.run("verify:verify", {
      address: await router.getAddress(),
      constructorArguments: [HIGHER_TOKEN, WETH, ETH_HIGHER_POOL, UNISWAP_V3_ROUTER, UNISWAP_V3_POSITION_MANAGER],
      network: "base",
    });
    console.log("✅ SplitRouter verified on BaseScan");
  } catch (error) {
    console.log("⚠️ Error verifying SplitRouter:", error.message);
    console.log(`📋 Manual verification URL: https://basescan.org/address/${await router.getAddress()}#code`);
  }

  console.log("\n🎉 Mainnet Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("SplitRouter:", await router.getAddress());
  console.log("SplitRouterQuoter:", await quoter.getAddress());

  console.log("\n📋 Update your frontend with these addresses:");
  console.log(`SPLIT_ROUTER: "${await router.getAddress()}"`);
  console.log(`SPLIT_ROUTER_QUOTER: "${await quoter.getAddress()}"`);
  console.log(`HIGHER_TOKEN: "${HIGHER_TOKEN}"`);

  console.log("\n🔗 Contract Links:");
  console.log(`SplitRouter: https://basescan.org/address/${await router.getAddress()}`);
  console.log(`SplitRouterQuoter: https://basescan.org/address/${await quoter.getAddress()}`);
  console.log(`HIGHER Token: https://basescan.org/address/${HIGHER_TOKEN}`);
  console.log(`ETH/HIGHER Pool: https://app.uniswap.org/explore/pools/base/${ETH_HIGHER_POOL}`);

  console.log("\n🧪 Next Steps for Testing:");
  console.log("1. Make sure you have some Base ETH for gas fees");
  console.log("2. Get some real tokens (USDC, DAI, etc.)");
  console.log("3. Test single token swaps");
  console.log("4. Test bulk dust swaps");
  console.log("5. Verify 80/18/2 split is working correctly");
  console.log("6. Check that platform fees go to dev wallet");
  console.log("7. Verify real $HIGHER tokens are received");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 