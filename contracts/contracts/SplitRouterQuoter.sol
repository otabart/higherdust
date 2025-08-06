// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SplitRouterQuoter {
    // Constants
    uint256 public constant USER_SHARE = 80;
    uint256 public constant POL_SHARE = 18;
    uint256 public constant PLATFORM_FEE = 2;
    uint256 public constant FEE_DENOMINATOR = 100;
    address public constant DEV_WALLET = 0x1831510811Ddd00E6180C345F00F12C4536abaa3;
    uint256 public constant BASE_CHAIN_ID = 8453;
    uint256 public constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint256 public constant BASE_GOERLI_CHAIN_ID = 84531;
    uint256 public constant DUST_THRESHOLD_USD = 3 * 10**8; // $3 in USD with 8 decimals

    // Addresses
    address public immutable HIGHER;
    address public immutable WETH;
    address public immutable ETH_USD_PRICE_FEED;

    struct SwapQuote {
        uint256 amountIn;
        uint256 userShare;
        uint256 polShare;
        uint256 platformFee;
        uint256 totalValueUSD;
        bool isDust;
    }

    struct DustQuote {
        address[] tokens;
        uint256[] amounts;
        uint256 totalUserShare;
        uint256 totalPolShare;
        uint256 totalPlatformFee;
        uint256 totalValueUSD;
        uint256 dustTokensCount;
    }

    constructor(
        address _higher,
        address _weth,
        address _ethUsdPriceFeed
    ) {
        require(block.chainid == BASE_CHAIN_ID || block.chainid == BASE_SEPOLIA_CHAIN_ID || block.chainid == BASE_GOERLI_CHAIN_ID, "SplitRouterQuoter: Only works on Base network");
        HIGHER = _higher;
        WETH = _weth;
        ETH_USD_PRICE_FEED = _ethUsdPriceFeed;
    }

    /**
     * @dev Get quote for a single token swap
     */
    function getSwapQuote(
        address tokenIn,
        uint256 amountIn
    ) external view returns (SwapQuote memory) {
        require(tokenIn != address(0), "Invalid token address");
        require(amountIn > 0, "Amount must be greater than 0");
        require(tokenIn != HIGHER, "Cannot swap HIGHER to HIGHER");

        uint256 totalValueUSD = _getTokenValueUSD(tokenIn, amountIn);
        bool isDust = totalValueUSD < DUST_THRESHOLD_USD;

        uint256 userShare = (amountIn * USER_SHARE) / FEE_DENOMINATOR;
        uint256 polShare = (amountIn * POL_SHARE) / FEE_DENOMINATOR;
        uint256 platformFee = (amountIn * PLATFORM_FEE) / FEE_DENOMINATOR;

        return SwapQuote({
            amountIn: amountIn,
            userShare: userShare,
            polShare: polShare,
            platformFee: platformFee,
            totalValueUSD: totalValueUSD,
            isDust: isDust
        });
    }

    /**
     * @dev Get quote for bulk swap of multiple tokens
     */
    function getBulkSwapQuote(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external view returns (DustQuote memory) {
        require(tokens.length == amounts.length, "Arrays length mismatch");
        require(tokens.length > 0, "Empty arrays");

        uint256 totalUserShare = 0;
        uint256 totalPolShare = 0;
        uint256 totalPlatformFee = 0;
        uint256 totalValueUSD = 0;
        uint256 dustTokensCount = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Invalid token address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            require(tokens[i] != HIGHER, "Cannot swap HIGHER to HIGHER");

            uint256 tokenValueUSD = _getTokenValueUSD(tokens[i], amounts[i]);
            totalValueUSD += tokenValueUSD;

            if (tokenValueUSD < DUST_THRESHOLD_USD) {
                dustTokensCount++;
            }

            uint256 userShare = (amounts[i] * USER_SHARE) / FEE_DENOMINATOR;
            uint256 polShare = (amounts[i] * POL_SHARE) / FEE_DENOMINATOR;
            uint256 platformFee = (amounts[i] * PLATFORM_FEE) / FEE_DENOMINATOR;

            totalUserShare += userShare;
            totalPolShare += polShare;
            totalPlatformFee += platformFee;
        }

        return DustQuote({
            tokens: tokens,
            amounts: amounts,
            totalUserShare: totalUserShare,
            totalPolShare: totalPolShare,
            totalPlatformFee: totalPlatformFee,
            totalValueUSD: totalValueUSD,
            dustTokensCount: dustTokensCount
        });
    }

    /**
     * @dev Check if a token amount is considered "dust"
     */
    function isDustToken(address token, uint256 amount) external view returns (bool) {
        uint256 valueUSD = _getTokenValueUSD(token, amount);
        return valueUSD < DUST_THRESHOLD_USD;
    }

    /**
     * @dev Get token value in USD (simplified)
     */
    function _getTokenValueUSD(address token, uint256 amount) internal view returns (uint256) {
        // Simplified implementation - in production would use Chainlink price feeds
        // For now, return a placeholder value
        return amount; // Placeholder
    }

    /**
     * @dev Get ETH/USD price from Chainlink
     */
    function getETHPrice() public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(ETH_USD_PRICE_FEED);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }
} 