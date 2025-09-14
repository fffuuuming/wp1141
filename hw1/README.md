# Crypto Swap Simulator

A cryptocurrency swap simulation app built with HTML, CSS, and TypeScript. This app allows users to simulate token swaps between ETH, BTC, DAI, USDC, and USDT using various providers.

## Features

- **Token Support**: ETH, BTC, DAI, USDC, USDT
- **Multiple Providers**: Thorchain, Uniswap V3, 1inch, SushiSwap, Curve Finance
- **Real-time Calculations**: Live swap quotes with fees and price impact
- **Mobile-first Design**: Responsive interface optimized for mobile devices
- **Type Safety**: TypeScript for better development experience

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
