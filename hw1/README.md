# Crypto Swap Simulator

A cryptocurrency swap simulation app built with HTML, CSS, and TypeScript. This app allows users to simulate token swaps between ETH, BTC, DAI, USDC, and USDT using various providers.

## Features

- **Token Support**: ETH, BTC, DAI, USDC, USDT
- **Multiple Providers**: Thorchain, Uniswap V3, 1inch, SushiSwap, Curve Finance
- **Real-time Calculations**: Live swap quotes with fees and price impact
- **Mobile-first Design**: Responsive interface optimized for mobile devices
- **Type Safety**: TypeScript for better development experience

## 🚀 Quick Start

1. Clone this repo
2. Open terminal & cd to hw1
3. Install dependency (typescript)
   ```bash
   npm run install
   ```
4. Build & run the project
   ```bash
   npm run serve
   ```
5. Open the browser to `http://localhost:8000`
6. Remove build artifacts (Optional)
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
├── dist/               # Compiled JavaScript output (ignored by git)
├── node_modules/       # Dependencies (ignored by git)
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── tsconfig.json       # TypeScript configuration
├── package.json        # Node.js project configuration
└── README.md           # Project documentation
```

## License

This project is open source and available under the MIT License.
