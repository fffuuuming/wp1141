# 🐍 Snake Game - Homework Assignment 2

A modern Snake game implementation built with React, TypeScript, and Vite as part of a web programming course assignment. This project demonstrates modern web development practices, component architecture, and game development concepts.

## 📋 Overview

This Snake game is a complete implementation featuring:
- **Modern React Architecture** with functional components and custom hooks
- **TypeScript** for type safety and better development experience
- **Responsive Design** that works across desktop and mobile devices
- **Audio Integration** with background music and sound effects
- **Configurable Game Settings** including board size and speed levels
- **State Management** using React hooks for clean separation of concerns

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16.0 or higher
- **npm** or **yarn** package manager

### Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd hw2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:5173`)
   > Use Chrome for the best experience

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 🎮 How to Play

### Controls
- **Arrow Keys**: Control snake direction (↑ ↓ ← →)
- **Spacebar**: Start game / Pause/Resume
- **Mouse/Touch**: Click game area to start

### Gameplay
1. **Start**: Click the game area or press spacebar
2. **Navigate**: Use arrow keys to control the snake
3. **Eat Food**: Collect red food to grow and increase score
4. **Avoid Collisions**: Don't hit walls or your own body
5. **Progressive Difficulty**: Game speed increases with each food eaten

### Settings
- **Board Size**: Choose from Small, Medium, or Large boards
- **Speed Level**: Select Slow, Normal, or Fast initial speed
- **Audio**: Background music and sound effects

## 🏗️ Architecture

### Project Structure
```
hw2/
├── src/
│   ├── components/           # React UI components
│   │   ├── SnakeGame.tsx    # Main game component
│   │   ├── GameBoard.tsx    # Game board rendering
│   │   ├── GameInfo.tsx     # Score and status display
│   │   ├── MainMenu.tsx     # Main menu interface
│   │   ├── SettingsPage.tsx # Game settings configuration
│   │   └── InstructionsPage.tsx # Game instructions
│   ├── hooks/               # Custom React hooks
│   │   ├── useSnakeGame.ts  # Core game logic
│   │   └── useAudio.ts      # Audio management
│   ├── types/               # TypeScript definitions
│   │   └── game.ts          # Game-related types and constants
│   ├── App.tsx              # Main application component
│   └── App.css              # Global styles
├── public/
│   └── assets/
│       └── sounds/          # Audio files
│           ├── bgm.mp3      # Background music
│           ├── food.mp3     # Food collection sound
│           └── game-over.mp3 # Game over sound
├── package.json             # Dependencies and scripts
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Technical Features

### Modern React Patterns
- **Functional Components** with React 19
- **Custom Hooks** for logic separation (`useSnakeGame`, `useAudio`)
- **TypeScript** for type safety and IntelliSense
- **State Management** using `useState` and `useEffect`

### Game Engine Features
- **Collision Detection** for walls and self-collision
- **Food Generation** with collision avoidance
- **Progressive Speed Increase** (2.5% per food consumed)
- **Game State Management** (menu, playing, paused, game over)
- **Keyboard Event Handling** with proper event prevention

### Audio System
- **Background Music** with looping and volume control
- **Sound Effects** for food collection and game over
- **Audio State Management** synchronized with game state

### Responsive Design
- **Mobile-Friendly** touch controls
- **Adaptive Layout** for different screen sizes
- **Modern CSS** with gradients, animations, and transitions

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Touch controls supported

## 🎉 Features Showcase

- ✅ **Modern React Architecture** with hooks and functional components
- ✅ **TypeScript Integration** for type safety
- ✅ **Custom Hook Pattern** for logic separation
- ✅ **Audio System** with background music and sound effects
- ✅ **Responsive Design** for desktop and mobile
- ✅ **Configurable Settings** for board size and speed
- ✅ **Progressive Difficulty** with speed scaling
- ✅ **Keyboard Controls** with proper event handling
- ✅ **Game State Management** with multiple states
- ✅ **Modern UI/UX** with animations and transitions

---

**Enjoy playing and learning from this modern Snake game implementation! 🐍✨**