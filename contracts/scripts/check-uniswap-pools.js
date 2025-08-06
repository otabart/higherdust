const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Uniswap V3 pools on Base...");
  
  // Uniswap V3 Factory interface
  const factoryInterface = new ethers.Interface([
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
  ]);
  
  const factoryAddress = "0x33128a8fc17869897dce68ed026d694621f6fdfd";
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const higherAddress = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  // Check WETH-HIGHER pool
  console.log("\n🔍 Checking WETH-HIGHER pool...");
  try {
    const data = factoryInterface.encodeFunctionData("getPool", [
      wethAddress,
      higherAddress,
      3000 // 0.3% fee
    ]);
    
    const [signer] = await ethers.getSigners();
    const result = await signer.provider.call({
      to: factoryAddress,
      data: data
    });
    
    const decoded = factoryInterface.decodeFunctionResult("getPool", result);
    console.log("✅ WETH-HIGHER Pool:", decoded[0]);
    
    if (decoded[0] !== "0x0000000000000000000000000000000000000000") {
      console.log("✅ Pool exists!");
    } else {
      console.log("❌ Pool does not exist");
    }
  } catch (error) {
    console.log("❌ Failed to check WETH-HIGHER pool:", error.message);
  }
  
  // Check USDC-WETH pool
  console.log("\n🔍 Checking USDC-WETH pool...");
  try {
    const data = factoryInterface.encodeFunctionData("getPool", [
      usdcAddress,
      wethAddress,
      3000 // 0.3% fee
    ]);
    
    const [signer] = await ethers.getSigners();
    const result = await signer.provider.call({
      to: factoryAddress,
      data: data
    });
    
    const decoded = factoryInterface.decodeFunctionResult("getPool", result);
    console.log("✅ USDC-WETH Pool:", decoded[0]);
    
    if (decoded[0] !== "0x0000000000000000000000000000000000000000") {
      console.log("✅ Pool exists!");
    } else {
      console.log("❌ Pool does not exist");
    }
  } catch (error) {
    console.log("❌ Failed to check USDC-WETH pool:", error.message);
  }
  
  // Check different fee tiers
  console.log("\n🔍 Checking different fee tiers for WETH-HIGHER...");
  const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
  
  for (const fee of feeTiers) {
    try {
      const data = factoryInterface.encodeFunctionData("getPool", [
        wethAddress,
        higherAddress,
        fee
      ]);
      
      const [signer] = await ethers.getSigners();
      const result = await signer.provider.call({
        to: factoryAddress,
        data: data
      });
      
      const decoded = factoryInterface.decodeFunctionResult("getPool", result);
      console.log(`Fee ${fee}: ${decoded[0]}`);
      
      if (decoded[0] !== "0x0000000000000000000000000000000000000000") {
        console.log(`✅ Pool exists with fee ${fee}!`);
      }
    } catch (error) {
      console.log(`❌ Failed to check fee ${fee}:`, error.message);
    }
  }
  
  console.log("\n🎉 Pool Check Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 