const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing REAL Uniswap V3 Integration...");
  
  // Get the deployed contract
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  const splitRouter = SplitRouter.attach("0x44bF14251aC9e798B892FEF884b55259E4d58eB7");
  
  console.log("📋 Contract Address:", await splitRouter.getAddress());
  console.log("🔗 HIGHER Token:", await splitRouter.HIGHER());
  console.log("🔗 WETH:", await splitRouter.WETH());
  console.log("🔗 Uniswap Router:", await splitRouter.UNISWAP_ROUTER());
  console.log("🔗 Uniswap Quoter:", await splitRouter.UNISWAP_QUOTER());
  console.log("🔗 WETH-HIGHER Pool:", await splitRouter.WETH_HIGHER_POOL());
  
  // Test quote functionality using callStatic
  console.log("\n📊 Testing Quote Functions...");
  
  // Test with USDC (should have more liquidity)
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
  const testAmount = ethers.parseUnits("10", 6); // 10 USDC
  
  try {
    console.log("🔍 Getting quote for 10 USDC...");
    const usdcQuote = await splitRouter.getSwapQuote.staticCall(usdcAddress, testAmount);
    console.log("✅ USDC Quote:", ethers.formatEther(usdcQuote), "HIGHER");
  } catch (error) {
    console.log("❌ USDC Quote failed:", error.message);
  }
  
  // Test with WETH (should have direct pool)
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const wethAmount = ethers.parseEther("0.01"); // 0.01 WETH (smaller amount)
  
  try {
    console.log("🔍 Getting quote for 0.01 WETH...");
    const wethQuote = await splitRouter.getSwapQuote.staticCall(wethAddress, wethAmount);
    console.log("✅ WETH Quote:", ethers.formatEther(wethQuote), "HIGHER");
  } catch (error) {
    console.log("❌ WETH Quote failed:", error.message);
  }
  
  // Test with a random token (should use WETH route)
  const testTokenAddress = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe"; // HIGHER token
  const testTokenAmount = ethers.parseEther("1"); // 1 HIGHER
  
  try {
    console.log("🔍 Getting quote for 1 HIGHER (should fail)...");
    const tokenQuote = await splitRouter.getSwapQuote.staticCall(testTokenAddress, testTokenAmount);
    console.log("✅ Token Quote:", ethers.formatEther(tokenQuote), "HIGHER");
  } catch (error) {
    console.log("❌ Token Quote failed (expected):", error.message);
  }
  
  // Test bulk quote
  console.log("\n📊 Testing Bulk Quote...");
  const tokens = [usdcAddress, wethAddress];
  const amounts = [testAmount, wethAmount];
  
  try {
    const [totalQuote, individualQuotes] = await splitRouter.getBulkSwapQuote.staticCall(tokens, amounts);
    console.log("✅ Bulk Quote Total:", ethers.formatEther(totalQuote), "HIGHER");
    console.log("✅ Individual Quotes:", individualQuotes.map(q => ethers.formatEther(q)));
  } catch (error) {
    console.log("❌ Bulk Quote failed:", error.message);
  }
  
  console.log("\n🎉 REAL UNISWAP V3 INTEGRATION TEST COMPLETE!");
  console.log("📋 Next: Test actual swaps on Base mainnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 