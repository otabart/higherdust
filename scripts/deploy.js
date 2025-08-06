const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HigherDust SplitRouter contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Base Network Uniswap V3 Addresses
  const UNISWAP_V3_FACTORY = "0x33128a8fc17869897dce68ed026d694621f6fdfd";
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bE551Fcac6619C22f1B9C6Fd6";
  
  // Token addresses
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const WETH = "0x4200000000000000000000000000000000000006";
  
  // ETH/HIGHER pool
  const ETH_HIGHER_POOL = "0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0";

  console.log("\nContract Addresses:");
  console.log("Uniswap V3 Factory:", UNISWAP_V3_FACTORY);
  console.log("Uniswap V3 Router:", UNISWAP_V3_ROUTER);
  console.log("Uniswap V3 Quoter:", UNISWAP_V3_QUOTER);
  console.log("Uniswap V3 Position Manager:", UNISWAP_V3_POSITION_MANAGER);
  console.log("HIGHER Token:", HIGHER_TOKEN);
  console.log("WETH:", WETH);
  console.log("ETH/HIGHER Pool:", ETH_HIGHER_POOL);

  // Deploy SplitRouterQuoter
  console.log("\nDeploying SplitRouterQuoter...");
  const SplitRouterQuoter = await ethers.getContractFactory("SplitRouterQuoter");
  const quoter = await SplitRouterQuoter.deploy(UNISWAP_V3_QUOTER, UNISWAP_V3_FACTORY);
  await quoter.deployed();
  console.log("SplitRouterQuoter deployed to:", quoter.address);

  // Deploy SplitRouter
  console.log("\nDeploying SplitRouter...");
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  const router = await SplitRouter.deploy(
    UNISWAP_V3_ROUTER,
    UNISWAP_V3_FACTORY,
    UNISWAP_V3_POSITION_MANAGER
  );
  await router.deployed();
  console.log("SplitRouter deployed to:", router.address);

  // Verify contracts on BaseScan
  console.log("\nVerifying contracts on BaseScan...");
  
  try {
    await hre.run("verify:verify", {
      address: quoter.address,
      constructorArguments: [UNISWAP_V3_QUOTER, UNISWAP_V3_FACTORY],
    });
    console.log("SplitRouterQuoter verified on BaseScan");
  } catch (error) {
    console.log("Error verifying SplitRouterQuoter:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: router.address,
      constructorArguments: [UNISWAP_V3_ROUTER, UNISWAP_V3_FACTORY, UNISWAP_V3_POSITION_MANAGER],
    });
    console.log("SplitRouter verified on BaseScan");
  } catch (error) {
    console.log("Error verifying SplitRouter:", error.message);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("SplitRouter:", router.address);
  console.log("SplitRouterQuoter:", quoter.address);
  
  console.log("\n📋 Update your frontend with these addresses:");
  console.log(`SPLIT_ROUTER: "${router.address}"`);
  console.log(`SPLIT_ROUTER_QUOTER: "${quoter.address}"`);
  console.log(`HIGHER_TOKEN: "${HIGHER_TOKEN}"`);
  
  console.log("\n🔗 Contract Links:");
  console.log(`SplitRouter: https://basescan.org/address/${router.address}`);
  console.log(`SplitRouterQuoter: https://basescan.org/address/${quoter.address}`);
  console.log(`HIGHER Token: https://basescan.org/address/${HIGHER_TOKEN}`);
  console.log(`ETH/HIGHER Pool: https://app.uniswap.org/explore/pools/base/${ETH_HIGHER_POOL}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 