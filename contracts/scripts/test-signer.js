const { ethers } = require("hardhat");

async function testSigner() {
    console.log("🔍 Testing Signer Configuration");
    console.log("================================");
    
    try {
        // Explicitly create wallet with the new private key
        const privateKey = "0x8479f1a2a74e3226278aa02a85762084527b286913d116a02bd17fd98c775b0f";
        const wallet = new ethers.Wallet(privateKey, ethers.provider);
        
        console.log(`🔑 New Wallet Address: ${wallet.address}`);
        
        const balance = await ethers.provider.getBalance(wallet.address);
        const balanceEth = ethers.formatEther(balance);
        console.log(`💰 Balance: ${balanceEth} ETH`);
        
        // Test the old signer
        const [oldSigner] = await ethers.getSigners();
        console.log(`📝 Old Signer Address: ${oldSigner.address}`);
        
        if (wallet.address === "0xF2D5cDd5637773b1AfeCE21bcFD5694B600239E5") {
            console.log("✅ New wallet is correct!");
        } else {
            console.log("❌ New wallet mismatch!");
        }
        
        if (oldSigner.address === "0x0B3520A5C09f27c6ac7702e74a751583024d81A2") {
            console.log("❌ Still using old compromised wallet!");
        } else {
            console.log("✅ Old signer is different!");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main = testSigner;
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
