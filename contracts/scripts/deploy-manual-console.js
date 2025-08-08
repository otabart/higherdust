const { ethers } = require("hardhat");

async function deployManual() {
  console.log("🚀 Manual Deployment via Hardhat Console");
  console.log("==========================================");

  // Contract addresses
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const WETH = "0x4200000000000000000000000000000000000006";
  const UNISWAP_POOL = "0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0";
  const UNISWAP_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const UNISWAP_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
  const POSITION_MANAGER = "0x0000000000000000000000000000000000000000";
  const DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";

  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying from:", deployer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      console.log("❌ No ETH balance. Please fund your wallet first.");
      return;
    }

    // Get contract factory
    const ContractFactory = await ethers.getContractFactory("SplitRouter");
    
    // Estimate gas
    const deployTransaction = ContractFactory.getDeployTransaction(
      HIGHER_TOKEN,
      WETH,
      UNISWAP_POOL,
      UNISWAP_ROUTER,
      UNISWAP_QUOTER,
      POSITION_MANAGER,
      DEV_WALLET
    );

    const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
    console.log("⛽ Estimated gas:", estimatedGas.toString());

    // Deploy with explicit gas settings
    console.log("🔄 Deploying contract...");
    const contract = await ContractFactory.deploy(
      HIGHER_TOKEN,
      WETH,
      UNISWAP_POOL,
      UNISWAP_ROUTER,
      UNISWAP_QUOTER,
      POSITION_MANAGER,
      DEV_WALLET,
      {
        gasLimit: 5000000,
        gasPrice: ethers.parseUnits("0.1", "gwei")
      }
    );

    console.log("⏳ Waiting for deployment...");
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log("🎉 Contract deployed to:", deployedAddress);
    console.log("🔗 View on BaseScan:", `https://basescan.org/address/${deployedAddress}`);

    // Verify constructor parameters
    console.log("\n📋 Constructor Parameters Verified:");
    console.log("HIGHER:", await contract.HIGHER());
    console.log("WETH:", await contract.WETH());
    console.log("UNISWAP_POOL:", await contract.UNISWAP_POOL());
    console.log("UNISWAP_ROUTER:", await contract.UNISWAP_ROUTER());
    console.log("UNISWAP_QUOTER:", await contract.UNISWAP_QUOTER());
    console.log("DEV_WALLET:", await contract.DEV_WALLET());

    return deployedAddress;

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Solution: Add more ETH to your wallet");
    } else if (error.message.includes("nonce")) {
      console.log("💡 Solution: Try again in a few seconds");
    } else {
      console.log("💡 Check the error details above");
    }
    
    throw error;
  }
}

// Export for use in console
module.exports = { deployManual };

// If run directly
if (require.main === module) {
  deployManual().catch(console.error);
}

