# Crypto Swap Simulator

A cryptocurrency swap simulation app built with HTML, CSS, and TypeScript. This app allows users to simulate token swaps between ETH, BTC, DAI, USDC, and USDT using various providers.

## Features

- **Token Support**: ETH, BTC, DAI, USDC, USDT
- **Multiple Providers**: Thorchain, Uniswap V3, 1inch, SushiSwap, Curve Finance
- **Real-time Calculations**: Live swap quotes with fees and price impact
- **Mobile-first Design**: Responsive interface optimized for mobile devices
- **Type Safety**: TypeScript for better development experience

## Getting Started

### Prerequisites

- Node.js (for TypeScript compilation)
- A modern web browser
- A local web server (required for ES modules)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-swap-simulator
```

2. Install TypeScript globally (if not already installed):
```bash
npm install -g typescript
```

3. Compile TypeScript:
```bash
tsc
```

4. Start a local server:
```bash
python3 -m http.server 8000
```

5. Open your browser and navigate to `http://localhost:8000`

### Development

To watch for changes and automatically rebuild:
```bash
tsc --watch
```

## Usage

1. **Select Tokens**: Click on the token selectors to choose which tokens to swap
2. **Enter Amount**: Input the amount you want to pay
3. **Choose Provider**: Select from available swap providers
4. **Review Swap**: Click "Review Swap" to see detailed swap information

## Project Structure

```
├── src/
│   ├── app.ts          # Main TypeScript application logic
│   ├── types.ts        # TypeScript type definitions
│   ├── tokens.ts       # Token data and configurations
│   └── providers.ts    # Provider data and configurations
├── dist/               # Compiled JavaScript output
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **TypeScript**: Type-safe JavaScript with modern features
- **ES Modules**: Modern JavaScript module system

## License

This project is open source and available under the MIT License.
