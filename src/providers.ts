import { Provider } from './types.js';

export const PROVIDERS: Provider[] = [
    {
        id: 'thorchain',
        name: 'Thorchain',
        description: 'Cross-chain liquidity protocol',
        fee: 0.5,
        icon: '⚡',
        supportedTokens: ['ETH', 'BTC', 'DAI', 'USDC', 'USDT']
    },
    {
        id: 'uniswap',
        name: 'Uniswap V3',
        description: 'Decentralized exchange protocol',
        fee: 0.3,
        icon: '🦄',
        supportedTokens: ['ETH', 'DAI', 'USDC', 'USDT']
    },
    {
        id: '1inch',
        name: '1inch',
        description: 'DEX aggregator with best rates',
        fee: 0.1,
        icon: '1️⃣',
        supportedTokens: ['ETH', 'DAI', 'USDC', 'USDT']
    },
    {
        id: 'sushiswap',
        name: 'SushiSwap',
        description: 'Community-driven DEX',
        fee: 0.25,
        icon: '🍣',
        supportedTokens: ['ETH', 'DAI', 'USDC', 'USDT']
    },
    {
        id: 'curve',
        name: 'Curve Finance',
        description: 'Low-slippage stablecoin swaps',
        fee: 0.04,
        icon: '📈',
        supportedTokens: ['DAI', 'USDC', 'USDT']
    }
];
