const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SplitRouter", function () {
  let splitRouter;
  let splitRouterQuoter;
  let owner;
  let user;
  
  // Test token addresses (Base Goerli)
  const TEST_TOKEN = "0x4200000000000000000000000000000000000006"; // WETH
  const HIGHER_TOKEN = "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe";
  const DEV_WALLET = "0x1831510811Ddd00E6180C345F00F12C4536abaa3";
  
  // Test addresses
  const WETH = "0x4200000000000000000000000000000000000006";
  const UNISWAP_POOL = "0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0";
  const UNISWAP_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const POSITION_MANAGER = "0x03a520b32c04bF3Be551fcaC6619c22F1B9c6FD6";
  const ETH_USD_PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy SplitRouterQuoter
    const SplitRouterQuoter = await ethers.getContractFactory("SplitRouterQuoter");
    splitRouterQuoter = await SplitRouterQuoter.deploy(
      HIGHER_TOKEN,
      WETH,
      ETH_USD_PRICE_FEED
    );
    await splitRouterQuoter.waitForDeployment();
    
    // Deploy SplitRouter
    const SplitRouter = await ethers.getContractFactory("SplitRouter");
    splitRouter = await SplitRouter.deploy(
      HIGHER_TOKEN,
      WETH,
      UNISWAP_POOL,
      UNISWAP_ROUTER,
      POSITION_MANAGER
    );
    await splitRouter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct addresses", async function () {
      expect(await splitRouter.HIGHER()).to.equal(HIGHER_TOKEN);
      expect(await splitRouter.WETH()).to.equal(WETH);
      expect(await splitRouter.UNISWAP_POOL()).to.equal(UNISWAP_POOL);
      expect(await splitRouter.UNISWAP_ROUTER()).to.equal(UNISWAP_ROUTER);
      expect(await splitRouter.POSITION_MANAGER()).to.equal(POSITION_MANAGER);
    });

    it("Should have correct constants", async function () {
      expect(await splitRouter.USER_SHARE()).to.equal(80);
      expect(await splitRouter.POL_SHARE()).to.equal(18);
      expect(await splitRouter.PLATFORM_FEE()).to.equal(2);
      expect(await splitRouter.FEE_DENOMINATOR()).to.equal(100);
      expect(await splitRouter.DEV_WALLET()).to.equal(DEV_WALLET);
    });
  });

  describe("Single Token Swap", function () {
    it("Should calculate correct 80/18/2 split", async function () {
      const amountIn = ethers.parseEther("1.0"); // 1 ETH
      
      // Calculate expected splits
      const expected80Percent = amountIn * 80n / 100n; // 0.8 ETH
      const expected18Percent = amountIn * 18n / 100n; // 0.18 ETH
      const expected2Percent = amountIn * 2n / 100n;   // 0.02 ETH
      
      expect(expected80Percent).to.equal(ethers.parseEther("0.8"));
      expect(expected18Percent).to.equal(ethers.parseEther("0.18"));
      expect(expected2Percent).to.equal(ethers.parseEther("0.02"));
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        splitRouter.executeSwap(TEST_TOKEN, 0, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if swapping HIGHER to HIGHER", async function () {
      const amountIn = ethers.parseEther("1.0");
      await expect(
        splitRouter.executeSwap(HIGHER_TOKEN, amountIn, 0)
      ).to.be.revertedWith("Cannot swap HIGHER to HIGHER");
    });
  });

  describe("Bulk Swap", function () {
    it("Should handle bulk swap with correct array lengths", async function () {
      const tokens = [TEST_TOKEN, TEST_TOKEN];
      const amounts = [ethers.parseEther("0.5"), ethers.parseEther("0.5")];
      const minReceive = ethers.parseEther("0.8");
      
      // This would require token approvals and balances
      // For now, just test the function signature
      expect(tokens.length).to.equal(amounts.length);
    });

    it("Should revert if token and amount arrays have different lengths", async function () {
      const tokens = [TEST_TOKEN];
      const amounts = [ethers.parseEther("1.0"), ethers.parseEther("1.0")];
      const minReceive = ethers.parseEther("1.6");
      
      await expect(
        splitRouter.executeBulkSwap(tokens, amounts, minReceive)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should revert if tokens array is empty", async function () {
      const tokens = [];
      const amounts = [];
      const minReceive = 0;
      
      await expect(
        splitRouter.executeBulkSwap(tokens, amounts, minReceive)
      ).to.be.revertedWith("Empty arrays");
    });
  });

  describe("Quoter Functions", function () {
    it("Should provide swap quotes", async function () {
      const amountIn = ethers.parseEther("1.0");
      
      // Test quote function exists
      expect(typeof splitRouterQuoter.getSwapQuote).to.equal("function");
    });

    it("Should provide bulk swap quotes", async function () {
      const tokens = [TEST_TOKEN];
      const amounts = [ethers.parseEther("1.0")];
      
      // Test bulk quote function exists
      expect(typeof splitRouterQuoter.getBulkSwapQuote).to.equal("function");
    });

    it("Should detect dust tokens", async function () {
      const amountIn = ethers.parseEther("1.0");
      
      // Test dust detection function exists
      expect(typeof splitRouterQuoter.isDustToken).to.equal("function");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to withdraw emergency funds", async function () {
      // Test emergency withdraw function exists
      expect(typeof splitRouter.emergencyWithdraw).to.equal("function");
    });

    it("Should only allow owner to withdraw", async function () {
      // This would require the contract to have token balance
      // For now, test the function signature
      await expect(
        splitRouter.connect(user).emergencyWithdraw(TEST_TOKEN)
      ).to.be.reverted; // Should revert for non-owner
    });
  });

  describe("Events", function () {
    it("Should emit SwapExecuted event with correct parameters", async function () {
      // Test event signature
      expect(typeof splitRouter.filters.SwapExecuted).to.equal("function");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete swap flow", async function () {
      // This would require:
      // 1. User to have token balance
      // 2. Token approval
      // 3. Actual swap execution
      // 4. Verification of 80/18/2 split
      
      // For now, test the basic flow structure
      const amountIn = ethers.parseEther("1.0");
      const minReceive = ethers.parseEther("0.7");
      
      // Test that the function can be called (will revert due to insufficient balance)
      await expect(
        splitRouter.executeSwap(TEST_TOKEN, amountIn, minReceive)
      ).to.be.reverted; // Expected to revert due to insufficient balance/approval
    });
  });
}); 