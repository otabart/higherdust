const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Manually verifying contracts on Base Sepolia...");

  const SPLIT_ROUTER_QUOTER = "0xF62eb1Ae6633E1d454a71A4Cf53A8E80d4857B12";
  const SPLIT_ROUTER = "0x1af9944bA99ba1e9aeff9d143ed042F85B66006E";
  
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const WETH = "0x4200000000000000000000000000000000000006";
  const ETH_USD_PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
  const ETH_HIGHER_POOL = "0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0";
  const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32c04bF3Be551fcaC6619c22F1B9c6FD6";

  console.log("\n📋 Contract Addresses:");
  console.log("SplitRouterQuoter:", SPLIT_ROUTER_QUOTER);
  console.log("SplitRouter:", SPLIT_ROUTER);

  console.log("\n📋 Manual Verification Instructions:");
  console.log("1. Go to BaseScan Sepolia:");
  console.log("   https://sepolia.basescan.org/");
  
  console.log("\n2. For SplitRouterQuoter verification:");
  console.log("   - Go to: https://sepolia.basescan.org/address/" + SPLIT_ROUTER_QUOTER);
  console.log("   - Click 'Contract' tab");
  console.log("   - Click 'Verify and Publish'");
  console.log("   - Select 'Solidity (Single file)'");
  console.log("   - Upload the contract source code");
  console.log("   - Constructor arguments (ABI-encoded):");
  
  // Encode constructor arguments
  const SplitRouterQuoter = await ethers.getContractFactory("SplitRouterQuoter");
  const quoterInterface = SplitRouterQuoter.interface;
  const encodedArgs = quoterInterface.encodeDeploy([HIGHER_TOKEN, WETH, ETH_USD_PRICE_FEED]);
  console.log("   " + encodedArgs.slice(2)); // Remove '0x' prefix
  
  console.log("\n3. For SplitRouter verification:");
  console.log("   - Go to: https://sepolia.basescan.org/address/" + SPLIT_ROUTER);
  console.log("   - Click 'Contract' tab");
  console.log("   - Click 'Verify and Publish'");
  console.log("   - Select 'Solidity (Single file)'");
  console.log("   - Upload the contract source code");
  console.log("   - Constructor arguments (ABI-encoded):");
  
  const SplitRouter = await ethers.getContractFactory("SplitRouter");
  const routerInterface = SplitRouter.interface;
  const encodedRouterArgs = routerInterface.encodeDeploy([HIGHER_TOKEN, WETH, ETH_HIGHER_POOL, UNISWAP_V3_ROUTER, UNISWAP_V3_POSITION_MANAGER]);
  console.log("   " + encodedRouterArgs.slice(2)); // Remove '0x' prefix

  console.log("\n📋 Contract Source Code:");
  console.log("SplitRouterQuoter: contracts/SplitRouterQuoter.sol");
  console.log("SplitRouter: contracts/SplitRouter.sol");
  
  console.log("\n🎯 Alternative: Use Remix IDE");
  console.log("1. Open https://remix.ethereum.org/");
  console.log("2. Upload your contract files");
  console.log("3. Compile the contracts");
  console.log("4. Use the 'Deploy & Run Transactions' tab");
  console.log("5. Connect to Base Sepolia network");
  console.log("6. Deploy with the constructor arguments above");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  }); 