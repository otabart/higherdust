// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Uniswap V3 Interfaces
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);
}

interface IQuoter {
    struct QuoteExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        uint256 amountIn;
        uint160 sqrtPriceLimitX96;
    }

    function quoteExactInputSingle(QuoteExactInputSingleParams calldata params) external returns (uint256 amountOut);
}

contract SplitRouter is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant USER_SHARE = 80;
    uint256 public constant POL_SHARE = 18;
    uint256 public constant PLATFORM_FEE = 2;
    uint256 public constant FEE_DENOMINATOR = 100;
    address public immutable DEV_WALLET;
    uint256 public constant BASE_CHAIN_ID = 8453;
    uint256 public constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint256 public constant BASE_GOERLI_CHAIN_ID = 84531;
    
    // Custom errors for better gas efficiency
    error InsufficientOutputAmount(uint256 expected, uint256 received);
    error AmountTooSmall(uint256 amount);
    error SwapOutputWouldBeZero();
    error InsufficientHigherBalance(uint256 required, uint256 available);
    error ArithmeticOverflow();
    error InvalidTokenAddress();
    error CannotSwapHigherToHigher();
    error ArraysLengthMismatch();
    error EmptyArrays();

    // Addresses
    address public immutable HIGHER;
    address public immutable WETH;
    address public immutable UNISWAP_POOL;
    address public immutable UNISWAP_ROUTER;
    address public immutable UNISWAP_QUOTER;
    address public immutable POSITION_MANAGER;
    
    // Uniswap V3 Router and Quoter instances
    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;
    
    // Default fee tier for swaps (1% - matches the liquid pool)
    uint24 public constant DEFAULT_FEE = 10000;
    
    // WETH-HIGHER pool address on Base (1% fee tier - only pool with liquidity)
    address public constant WETH_HIGHER_POOL = 0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0;

    event SwapExecuted(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 amountOut, uint256 polAmount, uint256 platformFee);
    event BulkSwapExecuted(address indexed user, address[] tokens, uint256[] amounts, uint256 totalAmountOut);
    event DistributionDebug(uint256 totalHigher, uint256 userAmount, uint256 polAmount, uint256 platformFee, uint256 contractBalance);
    event SwapDebug(address indexed token, uint256 amountIn, uint256 amountOut);

    constructor(
        address _higher,
        address _weth,
        address _uniswapPool,
        address _uniswapRouter,
        address _uniswapQuoter,
        address _positionManager,
        address _devWallet
    ) {
        require(block.chainid == BASE_CHAIN_ID || block.chainid == BASE_SEPOLIA_CHAIN_ID || block.chainid == BASE_GOERLI_CHAIN_ID, "SplitRouter: Only works on Base network");
        require(_devWallet != address(0), "Invalid dev wallet");
        HIGHER = _higher;
        WETH = _weth;
        UNISWAP_POOL = _uniswapPool;
        UNISWAP_ROUTER = _uniswapRouter;
        UNISWAP_QUOTER = _uniswapQuoter;
        POSITION_MANAGER = _positionManager;
        DEV_WALLET = _devWallet;
        
        // Initialize Uniswap V3 interfaces
        swapRouter = ISwapRouter(_uniswapRouter);
        quoter = IQuoter(_uniswapQuoter);
    }

    /**
     * @dev Execute a single token swap with 80/18/2 split
     * @param tokenIn Address of the input token
     * @param amountIn Amount of input token to swap
     * @param minReceive Minimum HIGHER tokens to receive
     */
    function executeSwap(
        address tokenIn,
        uint256 amountIn,
        uint256 minReceive
    ) external nonReentrant {
        if (tokenIn == address(0)) revert InvalidTokenAddress();
        if (amountIn == 0) revert AmountTooSmall(amountIn);
        if (tokenIn == HIGHER) revert CannotSwapHigherToHigher();
        
        // Transfer tokens from user to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Execute the split swap
        _executeSplitSwap(tokenIn, amountIn, minReceive);
    }
    
    /**
     * @dev Execute bulk swap for multiple dust tokens
     * @param tokens Array of token addresses to swap
     * @param amounts Array of amounts to swap
     * @param minReceive Minimum HIGHER tokens to receive
     */
    function executeBulkSwap(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256 minReceive
    ) external nonReentrant {
        if (tokens.length != amounts.length) revert ArraysLengthMismatch();
        if (tokens.length == 0) revert EmptyArrays();
        
        uint256 totalHigherReceived = 0;
        
        // Transfer all tokens and execute swaps
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) revert InvalidTokenAddress();
            if (amounts[i] == 0) revert AmountTooSmall(amounts[i]);
            if (tokens[i] == HIGHER) revert CannotSwapHigherToHigher();
            
            IERC20(tokens[i]).transferFrom(msg.sender, address(this), amounts[i]);
            
            // Execute individual swap with overflow protection
            uint256 higherReceived = _executeSingleSwap(tokens[i], amounts[i], 0);
            
            // Check for overflow in accumulation
            uint256 newTotal = totalHigherReceived + higherReceived;
            if (newTotal < totalHigherReceived) revert ArithmeticOverflow();
            totalHigherReceived = newTotal;
        }
        
        // Verify minimum received
        if (totalHigherReceived < minReceive) {
            revert InsufficientOutputAmount(minReceive, totalHigherReceived);
        }
        
        // Execute the 80/18/2 split
        _executeSplitDistribution(totalHigherReceived);
        
        emit BulkSwapExecuted(msg.sender, tokens, amounts, totalHigherReceived);
    }

    /**
     * @dev Internal function to execute split swap
     */
    function _executeSplitSwap(
        address tokenIn,
        uint256 amountIn,
        uint256 minReceive
    ) internal {
        // First swap token to HIGHER
        uint256 higherReceived = _executeSingleSwap(tokenIn, amountIn, minReceive);
        
        // Then execute the 80/18/2 split
        _executeSplitDistribution(higherReceived);
    }

    /**
     * @dev Execute a single token swap to HIGHER
     */
    function _executeSingleSwap(
        address tokenIn,
        uint256 amountIn,
        uint256 minReceive
    ) internal returns (uint256 amountOut) {
        // Validate minimum amount
        if (amountIn < 1000) revert AmountTooSmall(amountIn);
        
        // Approve router to spend tokens
        IERC20(tokenIn).approve(UNISWAP_ROUTER, amountIn);
        
        // Determine if we need a direct swap or multi-hop via WETH
        if (tokenIn == WETH) {
            // Direct WETH to HIGHER swap
            amountOut = _executeDirectSwap(tokenIn, amountIn, minReceive);
        } else {
            // Try direct swap first, fallback to WETH route if needed
            amountOut = _executeDirectSwap(tokenIn, amountIn, minReceive);
            
            // If direct swap fails or returns 0, try WETH route
            if (amountOut == 0) {
                amountOut = _executeWethRouteSwap(tokenIn, amountIn, minReceive);
            }
        }
        
        // Ensure output is not zero
        if (amountOut == 0) revert SwapOutputWouldBeZero();
        
        // Verify minimum received
        if (amountOut < minReceive) {
            revert InsufficientOutputAmount(minReceive, amountOut);
        }
        
        emit SwapDebug(tokenIn, amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev Execute direct token to HIGHER swap
     */
    function _executeDirectSwap(
        address tokenIn,
        uint256 amountIn,
        uint256 minReceive
    ) internal returns (uint256 amountOut) {
        // For WETH, use the known WETH-HIGHER pool
        if (tokenIn == WETH) {
            try swapRouter.exactInputSingle(
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: WETH,
                    tokenOut: HIGHER,
                    fee: DEFAULT_FEE,
                    recipient: address(this),
                    deadline: block.timestamp + 300, // 5 minutes
                    amountIn: amountIn,
                    amountOutMinimum: minReceive,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 _amountOut) {
                amountOut = _amountOut;
            } catch {
                // WETH swap failed
                amountOut = 0;
            }
        } else {
            // For other tokens, try direct swap
            try swapRouter.exactInputSingle(
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: tokenIn,
                    tokenOut: HIGHER,
                    fee: DEFAULT_FEE,
                    recipient: address(this),
                    deadline: block.timestamp + 300, // 5 minutes
                    amountIn: amountIn,
                    amountOutMinimum: minReceive,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 _amountOut) {
                amountOut = _amountOut;
            } catch {
                // Direct swap failed, return 0 to trigger WETH route
                amountOut = 0;
            }
        }
    }
    
    /**
     * @dev Get quote for WETH route (tokenIn -> WETH -> HIGHER)
     */
    function _getWethRouteQuote(
        address tokenIn,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        // First quote: tokenIn -> WETH
        uint256 wethAmount = 0;
        try quoter.quoteExactInputSingle(
            IQuoter.QuoteExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: WETH,
                fee: DEFAULT_FEE,
                amountIn: amountIn,
                sqrtPriceLimitX96: 0
            })
        ) returns (uint256 _wethAmount) {
            wethAmount = _wethAmount;
        } catch {
            return 0; // First quote failed
        }
        
        // Second quote: WETH -> HIGHER
        if (wethAmount > 0) {
            try quoter.quoteExactInputSingle(
                IQuoter.QuoteExactInputSingleParams({
                    tokenIn: WETH,
                    tokenOut: HIGHER,
                    fee: DEFAULT_FEE,
                    amountIn: wethAmount,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 _amountOut) {
                amountOut = _amountOut;
            } catch {
                amountOut = 0;
            }
        }
    }
    
    /**
     * @dev Execute swap via WETH route (tokenIn -> WETH -> HIGHER)
     */
    function _executeWethRouteSwap(
        address tokenIn,
        uint256 amountIn,
        uint256 minReceive
    ) internal returns (uint256 amountOut) {
        // First swap: tokenIn -> WETH
        uint256 wethAmount = 0;
        try swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: WETH,
                fee: DEFAULT_FEE,
                recipient: address(this),
                deadline: block.timestamp + 300,
                amountIn: amountIn,
                amountOutMinimum: 0, // We'll check slippage on final output
                sqrtPriceLimitX96: 0
            })
        ) returns (uint256 _wethAmount) {
            wethAmount = _wethAmount;
        } catch {
            return 0; // First swap failed
        }
        
        // Second swap: WETH -> HIGHER
        if (wethAmount > 0) {
            try swapRouter.exactInputSingle(
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: WETH,
                    tokenOut: HIGHER,
                    fee: DEFAULT_FEE,
                    recipient: address(this),
                    deadline: block.timestamp + 300,
                    amountIn: wethAmount,
                    amountOutMinimum: minReceive,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 _amountOut) {
                amountOut = _amountOut;
            } catch {
                amountOut = 0;
            }
        }
    }

    /**
     * @dev Execute the 80/18/2 split distribution
     */
    function _executeSplitDistribution(uint256 totalHigher) internal {
        // Calculate splits with overflow protection
        uint256 userAmount = (totalHigher * USER_SHARE) / FEE_DENOMINATOR;
        uint256 polAmount = (totalHigher * POL_SHARE) / FEE_DENOMINATOR;
        uint256 platformFee = (totalHigher * PLATFORM_FEE) / FEE_DENOMINATOR;
        
        // Verify total distribution doesn't exceed totalHigher (accounting for rounding)
        uint256 totalDistributed = userAmount + polAmount + platformFee;
        if (totalDistributed > totalHigher) {
            // Adjust platformFee to prevent overflow
            platformFee = totalHigher - userAmount - polAmount;
        }
        
        // Check contract HIGHER balance before transfers
        uint256 contractBalance = IERC20(HIGHER).balanceOf(address(this));
        if (contractBalance < totalDistributed) {
            revert InsufficientHigherBalance(totalDistributed, contractBalance);
        }
        
        // Debug logging before transfers
        emit DistributionDebug(totalHigher, userAmount, polAmount, platformFee, contractBalance);
        
        // Transfer user share
        IERC20(HIGHER).transfer(msg.sender, userAmount);
        
        // Transfer POL share to LP position (simplified - in production would add liquidity)
        IERC20(HIGHER).transfer(UNISWAP_POOL, polAmount);
        
        // Transfer platform fee to dev wallet
        IERC20(HIGHER).transfer(DEV_WALLET, platformFee);
        
        emit SwapExecuted(msg.sender, HIGHER, totalHigher, userAmount, polAmount, platformFee);
    }

    /**
     * @dev Get swap quote (simplified for testing)
     */
    function getSwapQuote(
        address tokenIn,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        // For WETH, use the known WETH-HIGHER pool
        if (tokenIn == WETH) {
            try quoter.quoteExactInputSingle(
                IQuoter.QuoteExactInputSingleParams({
                    tokenIn: WETH,
                    tokenOut: HIGHER,
                    fee: DEFAULT_FEE,
                    amountIn: amountIn,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 _amountOut) {
                amountOut = _amountOut;
            } catch {
                // WETH quote failed
                amountOut = 0;
            }
        } else {
            // Try direct quote first
            try quoter.quoteExactInputSingle(
                IQuoter.QuoteExactInputSingleParams({
                    tokenIn: tokenIn,
                    tokenOut: HIGHER,
                    fee: DEFAULT_FEE,
                    amountIn: amountIn,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 _amountOut) {
                amountOut = _amountOut;
            } catch {
                // If direct quote fails, try WETH route
                amountOut = _getWethRouteQuote(tokenIn, amountIn);
            }
        }
    }

    /**
     * @dev Get bulk swap quote (simplified for testing)
     */
    function getBulkSwapQuote(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external returns (uint256 totalAmountOut, uint256[] memory individualQuotes) {
        require(tokens.length == amounts.length, "Arrays length mismatch");
        
        individualQuotes = new uint256[](tokens.length);
        totalAmountOut = 0;
        
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 quote = this.getSwapQuote(tokens[i], amounts[i]);
            individualQuotes[i] = quote;
            totalAmountOut += quote;
        }
        
        return (totalAmountOut, individualQuotes);
    }

    /**
     * @dev Emergency function to withdraw stuck tokens
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner(), balance);
    }

    /**
     * @dev Emergency function to withdraw ETH
     */
    function emergencyWithdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
} 