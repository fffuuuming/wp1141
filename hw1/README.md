# Crypto Swap Simulator

A cryptocurrency swap simulation app built with HTML, CSS, and TypeScript. This app allows users to simulate token swaps between ETH, BTC, DAI, USDC, and USDT using various providers.

## 🌐 Live Demo

**Access the simulator online:** [Your deployed URL will go here]

## Features

- **Token Support**: ETH, BTC, DAI, USDC, USDT
- **Multiple Providers**: Thorchain, Uniswap V3, 1inch, SushiSwap, Curve Finance
- **Real-time Calculations**: Live swap quotes with fees and price impact
- **Mobile-first Design**: Responsive interface optimized for mobile devices
- **Type Safety**: TypeScript for better development experience

## 🚀 Quick Start (For Users)

**No installation required!** Simply visit the live demo link above, or if you have the files locally:

1. **Download/Clone** the project files
2. **Open terminal** in the project directory
3. **Run one command:**
   ```bash
   python3 -m http.server 8000
   ```
4. **Open your browser** to `http://localhost:8000`

That's it! The simulator is ready to use.

## 🛠️ For Developers

### Prerequisites

- Node.js (for TypeScript compilation)
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wp1141/hw1
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Watch for changes and automatically rebuild
- `npm run dev` - Build and start local development server
- `npm run serve` - Build and start production server
- `npm run start` - Start server (assumes already built)
- `npm run clean` - Remove build artifacts

### Development Workflow

```bash
# Watch for changes and auto-rebuild
npm run build:watch

# In another terminal, start the server
npm run start
```

### Production/Sharing

```bash
# Build once and serve
npm run serve

# Or build separately
npm run build
npm run start
```

## 🌐 Deploying to the Web

### Option 1: GitHub Pages (Recommended - Free)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add crypto swap simulator"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your simulator will be live at:**
   ```
   https://YOUR_USERNAME.github.io/wp1141/hw1/
   ```

### Option 2: Netlify (Free)

1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `hw1` folder
   - Your simulator will be live instantly!

### Option 3: Vercel (Free)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd hw1
   vercel
   ```

3. **Follow the prompts** - your simulator will be live!

### Option 4: Any Web Hosting

Since this is a static website, you can host it on:
- **Any web hosting service** (GoDaddy, Bluehost, etc.)
- **Cloud platforms** (AWS S3, Google Cloud Storage, etc.)
- **CDN services** (Cloudflare, etc.)

Just upload the `hw1` folder contents to your web server.

## Usage

1. **Select Tokens**: Click on the token selectors to choose which tokens to swap
2. **Enter Amount**: Input the amount you want to pay
3. **Choose Provider**: Select from available swap providers
4. **Review Swap**: Click "Review Swap" to see detailed swap information

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

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **TypeScript**: Type-safe JavaScript with modern features
- **ES Modules**: Modern JavaScript module system

## License

This project is open source and available under the MIT License.
