# Crypto Swap Simulator

A cryptocurrency swap simulation app built with HTML, CSS, and TypeScript. This app allows users to simulate token swaps between ETH, BTC, DAI, USDC, and USDT using various providers.

## Features

- **Token Support**: ETH, BTC, DAI, USDC, USDT
- **Multiple Providers**: Thorchain, Uniswap V3, 1inch, SushiSwap, Curve Finance
- **Real-time Calculations**: Live swap quotes with fees and price impact
- **Mobile-first Design**: Responsive interface optimized for mobile devices
- **No Dependencies**: Pure HTML, CSS, and TypeScript (no frameworks)

## Getting Started

### Prerequisites

- Node.js (for TypeScript compilation)
- Yarn package manager
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-swap-simulator
```

2. Install dependencies:
```bash
yarn install
```

3. Build the project:
```bash
yarn build
```

4. Start a local server:
```bash
yarn start
```

5. Open your browser and navigate to `http://localhost:8000`

### Development

To watch for changes and automatically rebuild:
```bash
yarn dev
```

## Usage

1. **Select Tokens**: Click on the token selectors to choose which tokens to swap
2. **Enter Amount**: Input the amount you want to pay
3. **Choose Provider**: Select from available swap providers
4. **Review Swap**: Click "Review Swap" to see detailed swap information

## Project Structure

```
├── src/
│   ├── app.ts          # Main application logic
│   ├── types.ts        # TypeScript type definitions
│   ├── data.ts         # Token and provider data
│   └── swapService.ts  # Swap calculation service
├── dist/               # Compiled JavaScript output
├── index.html          # Main HTML file
├── styles.css          # CSS styles
└── package.json        # Project configuration
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **TypeScript**: Type-safe JavaScript
- **Yarn**: Package management

## License

This project is open source and available under the MIT License.
