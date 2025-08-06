const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Uniswap V3 Quoter directly...");
  
  // Uniswap V3 Quoter interface
  const quoterInterface = new ethers.Interface([
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
  ]);
  
  const quoterAddress = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const higherAddress = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  // Test WETH to HIGHER quote with the liquid pool (1% fee)
  console.log("\n🔍 Testing WETH -> HIGHER quote (1% fee)...");
  try {
    const wethAmount = ethers.parseEther("0.001"); // 0.001 WETH
    const data = quoterInterface.encodeFunctionData("quoteExactInputSingle", [
      wethAddress,
      higherAddress,
      10000, // 1% fee (liquid pool)
      wethAmount,
      0
    ]);
    
    const [signer] = await ethers.getSigners();
    const result = await signer.provider.call({
      to: quoterAddress,
      data: data
    });
    
    const decoded = quoterInterface.decodeFunctionResult("quoteExactInputSingle", result);
    console.log("✅ WETH -> HIGHER Quote (1%):", ethers.formatEther(decoded[0]), "HIGHER");
  } catch (error) {
    console.log("❌ WETH -> HIGHER Quote failed:", error.message);
  }
  
  // Test USDC to WETH quote
  console.log("\n🔍 Testing USDC -> WETH quote...");
  try {
    const usdcAmount = ethers.parseUnits("1", 6); // 1 USDC
    const data = quoterInterface.encodeFunctionData("quoteExactInputSingle", [
      usdcAddress,
      wethAddress,
      3000, // 0.3% fee
      usdcAmount,
      0
    ]);
    
    const [signer] = await ethers.getSigners();
    const result = await signer.provider.call({
      to: quoterAddress,
      data: data
    });
    
    const decoded = quoterInterface.decodeFunctionResult("quoteExactInputSingle", result);
    console.log("✅ USDC -> WETH Quote:", ethers.formatEther(decoded[0]), "WETH");
  } catch (error) {
    console.log("❌ USDC -> WETH Quote failed:", error.message);
  }
  
  // Test with different amounts for WETH -> HIGHER
  console.log("\n🔍 Testing WETH -> HIGHER with different amounts...");
  const amounts = [
    ethers.parseEther("0.0001"), // 0.0001 WETH
    ethers.parseEther("0.001"),  // 0.001 WETH
    ethers.parseEther("0.01"),   // 0.01 WETH
    ethers.parseEther("0.1")     // 0.1 WETH
  ];
  
  for (let i = 0; i < amounts.length; i++) {
    try {
      const data = quoterInterface.encodeFunctionData("quoteExactInputSingle", [
        wethAddress,
        higherAddress,
        10000, // 1% fee
        amounts[i],
        0
      ]);
      
      const [signer] = await ethers.getSigners();
      const result = await signer.provider.call({
        to: quoterAddress,
        data: data
      });
      
      const decoded = quoterInterface.decodeFunctionResult("quoteExactInputSingle", result);
      console.log(`Amount ${ethers.formatEther(amounts[i])} WETH: ${ethers.formatEther(decoded[0])} HIGHER`);
    } catch (error) {
      console.log(`Amount ${ethers.formatEther(amounts[i])} WETH: Failed - ${error.message}`);
    }
  }
  
  console.log("\n🎉 Uniswap V3 Quoter Test Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 