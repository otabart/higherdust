const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Enhanced Base Deployment with Balance Verification");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying from:", deployer.address);
    
    // Pre-deployment balance check
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log(`💰 Current balance: ${balanceEth} ETH`);
    
    if (parseFloat(balanceEth) === 0) {
        console.log("❌ Balance shows 0 ETH - checking alternative RPC endpoints...");
        
        const alternateRPCs = [
            "https://base-rpc.publicnode.com",
            "https://base.llamarpc.com"
        ];
        
        for (const rpc of alternateRPCs) {
            try {
                const altProvider = new ethers.JsonRpcProvider(rpc);
                const altBalance = await altProvider.getBalance(deployer.address);
                const altBalanceEth = ethers.formatEther(altBalance);
                
                if (parseFloat(altBalanceEth) > 0) {
                    console.log(`✅ Found balance on ${rpc}: ${altBalanceEth} ETH`);
                    console.log("💡 Suggestion: Update hardhat.config.js to use this RPC endpoint");
                    return;
                }
            } catch (e) {
                console.log(`❌ Error checking ${rpc}`);
            }
        }
        
        console.log("❌ No balance found on any RPC. Transaction may not be confirmed yet.");
        return;
    }
    
    // Contract addresses
    const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
    const WETH = "0x4200000000000000000000000000000000000006";
    const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
    const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
    const UNISWAP_V3_POSITION_MANAGER = "0x0000000000000000000000000000000000000000";
    const CUSTOM_DEV_WALLET = "0x0B3520A5C09f27c6ac7702e74a751583024d81A2";
    const CUSTOM_POL_WALLET = "0xD2a963866BD6d8de525aC726Ac79Ddf46c287486";
    
    // Estimate gas for deployment
    const ContractFactory = await ethers.getContractFactory("SplitRouter");
    const deployTransaction = ContractFactory.getDeployTransaction(
        HIGHER_TOKEN,
        WETH,
        CUSTOM_POL_WALLET,
        UNISWAP_V3_ROUTER,
        UNISWAP_V3_QUOTER,
        UNISWAP_V3_POSITION_MANAGER,
        CUSTOM_DEV_WALLET
    );
    
    try {
        const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
        const gasPrice = await ethers.provider.getFeeData();
        const estimatedCost = estimatedGas * gasPrice.gasPrice;
        const estimatedCostEth = ethers.formatEther(estimatedCost);
        
        console.log(`⛽ Estimated gas cost: ${estimatedCostEth} ETH`);
        
        if (parseFloat(balanceEth) < parseFloat(estimatedCostEth)) {
            console.log("❌ Insufficient balance for deployment");
            return;
        }
        
        console.log("✅ Sufficient balance, proceeding with deployment...");
        
        // Deploy contract
        const contract = await ContractFactory.deploy(
            HIGHER_TOKEN,
            WETH,
            CUSTOM_POL_WALLET,
            UNISWAP_V3_ROUTER,
            UNISWAP_V3_QUOTER,
            UNISWAP_V3_POSITION_MANAGER,
            CUSTOM_DEV_WALLET
        );
        await contract.waitForDeployment();
        
        const deployedAddress = await contract.getAddress();
        console.log("🎉 Contract deployed to:", deployedAddress);
        console.log("🔗 Verify on BaseScan:", `https://basescan.org/address/${deployedAddress}`);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 This confirms the RPC balance sync issue");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

