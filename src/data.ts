import { Token, Provider } from './types.js';

// Token data with current approximate prices (as of 2024)
export const TOKENS: Token[] = [
    {
        symbol: 'ETH',
        name: 'Ethereum',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiM2Mjc0RUEiLz4KPHBhdGggZD0iTTEyLjAwMDEgMlY5LjY2NjY3TDE3LjAwMDEgMTJMMTIuMDAwMSAxNFYyMkwyIDlMMTIuMDAwMSAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        price: 2500
    },
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRkA1MDAiLz4KPHBhdGggZD0iTTE2LjUgMTIuNUgxNy41VjE0SDE2LjVWMTIuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDEwSDE3LjVWMTEuNUgxNi41VjEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMTQuNUgxNy41VjE2SDE2LjVWMTQuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDE3SDE3LjVWMTguNUgxNi41VjE3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMTguNUgxNy41VjIwSDE2LjVWMTguNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDIwSDE3LjVWMjEuNUgxNi41VjIwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMjEuNUgxNy41VjIzSDE2LjVWMjEuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDIzSDE3LjVWMjQuNUgxNi41VjIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMjQuNUgxNy41VjI2SDE2LjVWMjQuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDI2SDE3LjVWMjcuNUgxNi41VjI2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMjcuNUgxNy41VjI5SDE2LjVWMjcuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDI5SDE3LjVWMzAuNUgxNi41VjI5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMzAuNUgxNy41VjMySDE2LjVWMzAuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDMySDE3LjVWMzMuNUgxNi41VjMyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMzMuNUgxNy41VjM1SDE2LjVWMzMuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDM1SDE3LjVWMzYuNUgxNi41VjM1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2LjUgMzYuNUgxNy41VjM4SDE2LjVWMzYuNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNi41IDM4SDE2LjVWMzguNUgxNi41VjM4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 8,
        price: 100000
    },
    {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRkE1MDAiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRkE1MDAiLz4KPC9zdmc+',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        price: 1
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMyNjc0RUEiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMyNjc0RUEiLz4KPC9zdmc+',
        address: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C',
        decimals: 6,
        price: 1
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMyNkE0RkYiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMyNkA0RkYiLz4KPC9zdmc+',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        price: 1
    }
];

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
