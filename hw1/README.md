# Crypto Swap Simulator

A Crypto Swap Simulator that allows users to simulate token swaps between ETH, BTC, DAI, USDC, and USDT using various providers.

## Why This Project?

Introduces concepts of cryptocurrency trading, exchange rates, and fee calculations.

## Features

- **Token Support**: ETH, BTC, DAI, USDC, USDT
- **Multiple Providers**: Thorchain, Uniswap V3, 1inch, SushiSwap, Curve Finance
   > Each provider has its own support token, for example: BTC is only supported by Thorchain, and Curve only support stable coin (DAI, USDC, USDT)
- **Real-time Calculations**: Live swap quotes with fees and price impact
- **Mobile-first Design**: Responsive interface optimized for mobile devices
- **Type Safety**: TypeScript for better development experience

### Content Structure
The application content is carefully designed to be both functional and educational:

- **Token Selection**: Users learn about different cryptocurrencies and their characteristics
- **Provider Comparison**: Demonstrates how different DeFi protocols offer varying rates and fees
- **Real-time Calculations**: Shows the impact of exchange rates and fees on swap outcomes
- **Interactive Learning**: Users can experiment with different scenarios without financial risk

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js**
- **npm** (comes with Node.js) - Package manager for JavaScript
- **Git**

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/fffuuuming/wp1141.git
   cd wp1141/hw1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build & start the server**
   ```bash
   npm run serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:8000` and start using the crypto swap simulator!

5. **Clean up build artifacts** (Optional)
   ```bash
   npm run clean
   ```

## Project Structure

```
hw1/
├── src/
│   ├── app.ts          # Main TypeScript application logic
│   ├── types.ts        # TypeScript type definitions
│   ├── tokens.ts       # Token data and configurations
│   └── providers.ts    # Provider data and configurations
├── dist/               # Compiled JavaScript output (included for deployment)
├── node_modules/       # Dependencies (ignored by git)
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── tsconfig.json       # TypeScript configuration
├── package.json        # Node.js project configuration
└── README.md           # Project documentation
```

## License

This project is open source and available under the MIT License.
