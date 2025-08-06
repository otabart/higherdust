const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing deployed contracts on Base Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Contract addresses from deployment
  const TEST_HIGHER_TOKEN = "0x1c350107796360f058F4bd8346e3dE313a79ded2";
  const SPLIT_ROUTER = "0xeD0D6510d763988F728Ee9e9c00634A20447445E";
  const WETH = "0x4200000000000000000000000000000000000006";

  console.log("\n📋 Contract Addresses:");
  console.log("Test HIGHER Token:", TEST_HIGHER_TOKEN);
  console.log("SplitRouter:", SPLIT_ROUTER);
  console.log("WETH:", WETH);

  // Test 1: Check Test HIGHER Token
  console.log("\n🔧 Test 1: Checking Test HIGHER Token...");
  try {
    const TestHigherToken = await ethers.getContractFactory("TestHigherToken");
    const testHigherToken = TestHigherToken.attach(TEST_HIGHER_TOKEN);
    
    const name = await testHigherToken.name();
    const symbol = await testHigherToken.symbol();
    const decimals = await testHigherToken.decimals();
    const totalSupply = await testHigherToken.totalSupply();
    const deployerBalance = await testHigherToken.balanceOf(deployer.address);
    
    console.log("✅ Test HIGHER Token details:");
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Decimals: ${decimals}`);
    console.log(`  Total Supply: ${ethers.formatEther(totalSupply)}`);
    console.log(`  Deployer Balance: ${ethers.formatEther(deployerBalance)}`);
  } catch (error) {
    console.log("❌ Error checking Test HIGHER Token:", error.message);
  }

  // Test 2: Check SplitRouter
  console.log("\n🔧 Test 2: Checking SplitRouter...");
  try {
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    const splitRouter = SplitRouter.attach(SPLIT_ROUTER);
    
    const higherToken = await splitRouter.HIGHER();
    const weth = await splitRouter.WETH();
    const userShare = await splitRouter.USER_SHARE();
    const polShare = await splitRouter.POL_SHARE();
    const platformFee = await splitRouter.PLATFORM_FEE();
    
    console.log("✅ SplitRouter details:");
    console.log(`  HIGHER Token: ${higherToken}`);
    console.log(`  WETH: ${weth}`);
    console.log(`  User Share: ${userShare}%`);
    console.log(`  POL Share: ${polShare}%`);
    console.log(`  Platform Fee: ${platformFee}%`);
  } catch (error) {
    console.log("❌ Error checking SplitRouter:", error.message);
  }

  // Test 3: Test quote function
  console.log("\n🔧 Test 3: Testing quote function...");
  try {
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    const splitRouter = SplitRouter.attach(SPLIT_ROUTER);
    
    const amountIn = ethers.parseEther("1.0"); // 1 token
    const quote = await splitRouter.getSwapQuote(WETH, amountIn);
    
    console.log("✅ Quote test:");
    console.log(`  Input: ${ethers.formatEther(amountIn)} WETH`);
    console.log(`  Quote: ${ethers.formatEther(quote)} HIGHER`);
  } catch (error) {
    console.log("❌ Error testing quote:", error.message);
  }

  // Test 4: Test bulk quote function
  console.log("\n🔧 Test 4: Testing bulk quote function...");
  try {
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    const splitRouter = SplitRouter.attach(SPLIT_ROUTER);
    
    const tokens = [WETH, WETH];
    const amounts = [ethers.parseEther("0.5"), ethers.parseEther("0.5")];
    
    const [totalQuote, individualQuotes] = await splitRouter.getBulkSwapQuote(tokens, amounts);
    
    console.log("✅ Bulk quote test:");
    console.log(`  Total Quote: ${ethers.formatEther(totalQuote)} HIGHER`);
    console.log(`  Individual Quotes: ${individualQuotes.map(q => ethers.formatEther(q)).join(", ")}`);
  } catch (error) {
    console.log("❌ Error testing bulk quote:", error.message);
  }

  console.log("\n🎉 Contract testing completed!");
  console.log("\n📋 Next Steps:");
  console.log("1. Get some Base Sepolia ETH from faucet");
  console.log("2. Get some test tokens (USDC, DAI, etc.)");
  console.log("3. Test the frontend application");
  console.log("4. Monitor transactions on BaseScan Sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  }); 