const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Setting up Base Sepolia Testnet Environment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Base Sepolia Testnet Addresses
  // Note: These are placeholder addresses since Uniswap V3 might not be fully deployed on Base Sepolia
  const UNISWAP_V3_FACTORY = "0x0000000000000000000000000000000000000000"; // Placeholder
  const UNISWAP_V3_ROUTER = "0x0000000000000000000000000000000000000000";   // Placeholder
  const UNISWAP_V3_QUOTER = "0x0000000000000000000000000000000000000000";   // Placeholder
  const UNISWAP_V3_POSITION_MANAGER = "0x0000000000000000000000000000000000000000"; // Placeholder
  const WETH = "0x4200000000000000000000000000000000000006";

  console.log("\n📋 Base Sepolia Addresses:");
  console.log("Uniswap V3 Factory:", UNISWAP_V3_FACTORY);
  console.log("Uniswap V3 Router:", UNISWAP_V3_ROUTER);
  console.log("Uniswap V3 Quoter:", UNISWAP_V3_QUOTER);
  console.log("WETH:", WETH);

  // Step 1: Deploy Test HIGHER Token
  console.log("\n🔧 Step 1: Deploying Test HIGHER Token...");
  const TestHigherToken = await ethers.getContractFactory("TestHigherToken");
  const testHigherToken = await TestHigherToken.deploy();
  await testHigherToken.waitForDeployment();
  console.log("✅ Test HIGHER Token deployed to:", await testHigherToken.getAddress());

  // Step 2: Deploy SplitRouter
  console.log("\n🔧 Step 2: Deploying SplitRouter...");
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  
  // For testing, we'll use a placeholder pool address
  // In a real scenario, you'd create a WETH/HIGHER pool on Uniswap V3
  const PLACEHOLDER_POOL = "0x0000000000000000000000000000000000000000";
  
  const splitRouter = await SplitRouter.deploy(
    await testHigherToken.getAddress(), // HIGHER_TOKEN
    WETH,                    // WETH
    PLACEHOLDER_POOL,        // ETH_HIGHER_POOL (placeholder)
    UNISWAP_V3_ROUTER,      // UNISWAP_ROUTER
    UNISWAP_V3_QUOTER,      // UNISWAP_QUOTER
    UNISWAP_V3_POSITION_MANAGER // POSITION_MANAGER
  );
  await splitRouter.waitForDeployment();
  console.log("✅ SplitRouter deployed to:", await splitRouter.getAddress());

  // Step 3: Verify contracts
  console.log("\n🔍 Step 3: Verifying contracts on BaseScan Sepolia...");
  
  try {
    await hre.run("verify:verify", {
      address: await testHigherToken.getAddress(),
      constructorArguments: [],
    });
    console.log("✅ Test HIGHER Token verified");
  } catch (error) {
    console.log("⚠️ Error verifying Test HIGHER Token:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: await splitRouter.getAddress(),
      constructorArguments: [
        await testHigherToken.getAddress(),
        WETH,
        PLACEHOLDER_POOL,
        UNISWAP_V3_ROUTER,
        UNISWAP_V3_QUOTER,
        UNISWAP_V3_POSITION_MANAGER
      ],
    });
    console.log("✅ SplitRouter verified");
  } catch (error) {
    console.log("⚠️ Error verifying SplitRouter:", error.message);
  }

  // Step 4: Print configuration
  console.log("\n🎉 Testnet setup completed!");
  console.log("\n📋 Contract Addresses:");
  console.log("Test HIGHER Token:", await testHigherToken.getAddress());
  console.log("SplitRouter:", await splitRouter.getAddress());
  
  console.log("\n📋 Update your frontend configuration:");
  console.log(`// lib/contracts.ts - Testnet Configuration`);
  console.log(`export const CONTRACT_ADDRESSES = {`);
  console.log(`  SPLIT_ROUTER: "${await splitRouter.getAddress()}",`);
  console.log(`  HIGHER_TOKEN: "${await testHigherToken.getAddress()}",`);
  console.log(`  WETH: "${WETH}",`);
  console.log(`  // ... other addresses`);
  console.log(`} as const;`);
  
  console.log("\n🔗 Contract Links:");
  console.log(`Test HIGHER Token: https://sepolia.basescan.org/address/${await testHigherToken.getAddress()}`);
  console.log(`SplitRouter: https://sepolia.basescan.org/address/${await splitRouter.getAddress()}`);
  
  console.log("\n🧪 Testing Instructions:");
  console.log("1. Get Base Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
  console.log("2. Update your frontend with the new contract addresses");
  console.log("3. Test token detection and swap functionality");
  console.log("4. Test with small amounts first");
  console.log("5. Monitor transactions on BaseScan Sepolia");
  
  console.log("\n⚠️  IMPORTANT NOTES:");
  console.log("- This is using a placeholder pool address");
  console.log("- Real swaps will fail until you create a WETH/HIGHER pool");
  console.log("- For full testing, create a pool on Uniswap V3 Base Sepolia");
  console.log("- Or modify the contract to handle the placeholder case");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }); 