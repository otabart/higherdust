// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../DustSwapRouter.sol";
import "../UniswapQuoter.sol";

/**
 * @title DustSwapDeployer
 * @dev Deployment script for DustSwap contracts
 */
contract DustSwapDeployer {
    // Base Network Uniswap V3 Addresses
    address public constant UNISWAP_V3_FACTORY = 0x33128a8fc17869897dce68ed026d694621f6fdfd;
    address public constant UNISWAP_V3_ROUTER = 0x2626664c2603336E57B271c5C0b26F421741e481;
    address public constant UNISWAP_V3_QUOTER = 0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a;
    
    // HIGHER token address on Base (replace with actual address)
    address public constant HIGHER_TOKEN = 0x0000000000000000000000000000000000000000; // TODO: Set actual HIGHER token address
    
    event ContractsDeployed(
        address dustSwapRouter,
        address uniswapQuoter,
        address higherToken
    );
    
    function deployContracts() external returns (address dustSwapRouter, address uniswapQuoter) {
        // Deploy UniswapQuoter
        uniswapQuoter = address(new UniswapQuoter(UNISWAP_V3_QUOTER, UNISWAP_V3_FACTORY));
        
        // Deploy DustSwapRouter
        dustSwapRouter = address(new DustSwapRouter(UNISWAP_V3_ROUTER, UNISWAP_V3_FACTORY));
        
        emit ContractsDeployed(dustSwapRouter, uniswapQuoter, HIGHER_TOKEN);
    }
} 