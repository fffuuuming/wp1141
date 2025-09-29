# Write README for hw2 directory
_Exported on 2025/9/29 at 16:19:09 [GMT+8] from Cursor (1.6.45)_

---

**User**

please write a README inside hw2 directory about its overview, architecture, how others can build and run to play the game

---

**Cursor**

I'll help you create a comprehensive README for the hw2 directory. Let me first explore the project structure and understand what this game is about.


Now let me check the hooks and other components to understand the full architecture:


Now let me check the existing README to see if there's any content to build upon:


Perfect! I can see there's already a comprehensive README, but it seems to be focused on a "modern-snake-game" rather than specifically for the hw2 directory. Let me create a more specific README for the hw2 directory that focuses on this particular implementation and its educational context.


```markdown
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

### Key Components

#### 1. **App.tsx** - Application State Management
- Manages global application state (menu, settings, instructions, game)
- Handles navigation between different screens
- Calculates final game speed based on user settings
- Coordinates between different components

#### 2. **SnakeGame.tsx** - Main Game Component
- Renders the game interface and controls
- Integrates game logic from `useSnakeGame` hook
- Handles user interactions (click to start, keyboard controls)
- Displays game overlays (start screen, game over screen)

#### 3. **useSnakeGame.ts** - Core Game Logic Hook
- Manages snake movement, food generation, and collision detection
- Handles game state transitions (playing, paused, game over)
- Implements progressive speed increase as score grows
- Integrates audio feedback for game events
- Manages keyboard input handling

#### 4. **useAudio.ts** - Audio Management Hook
- Provides audio controls for background music and sound effects
- Manages audio lifecycle (play, pause, restart, stop)
- Handles audio volume and looping settings

#### 5. **Game Configuration System**
- **Board Sizes**: Small (20×15), Medium (25×20), Large (30×25)
- **Speed Levels**: Slow, Normal, Fast with multiplicative scaling
- **Progressive Difficulty**: Speed increases with each food consumed

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

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

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

## 🎯 Educational Objectives

This project demonstrates:

1. **Component Architecture**: Separation of UI and business logic
2. **Custom Hooks**: Reusable logic encapsulation
3. **TypeScript Integration**: Type safety and better development experience
4. **State Management**: Complex state handling with React hooks
5. **Event Handling**: Keyboard and mouse interaction
6. **Audio Integration**: Web Audio API usage
7. **Responsive Design**: Mobile-first approach
8. **Game Development**: Game loop, collision detection, and scoring

## 🐛 Troubleshooting

### Common Issues

1. **Audio not playing**: Ensure browser allows autoplay for audio
2. **Game not responding**: Check browser console for JavaScript errors
3. **Build errors**: Ensure all dependencies are installed with `npm install`
4. **TypeScript errors**: Run `npm run lint` to check for type issues

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Touch controls supported

## 📚 Learning Resources

This implementation showcases several important web development concepts:

- **React Hooks**: `useState`, `useEffect`, `useCallback`, `useRef`
- **TypeScript**: Interfaces, types, and type safety
- **Game Development**: Game loops, collision detection, state machines
- **Audio Programming**: Web Audio API and audio lifecycle management
- **Responsive Design**: CSS Grid, Flexbox, and media queries

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
```

Perfect! I've created a comprehensive README for the hw2 directory that covers:

## 📋 What I've Included:

### **Overview Section**
- Clear description of what the project is and its educational context
- Key features and technologies used

### **Architecture Section**
- Detailed project structure with explanations
- Component breakdown and their responsibilities
- Game configuration system details

### **How to Play Section**
- Complete control instructions
- Gameplay mechanics
- Settings explanation

### **Getting Started Section**
- Prerequisites and installation steps
- Available npm scripts
- Clear setup instructions

### **Technical Features**
- Modern React patterns used
- Game engine features
- Audio system capabilities
- Responsive design aspects

### **Educational Objectives**
- Learning goals this project demonstrates
- Key web development concepts covered

### **Additional Sections**
- Troubleshooting guide
- Browser compatibility
- Learning resources
- Features showcase

The README is specifically tailored for the hw2 directory and focuses on the educational aspects while providing comprehensive technical documentation. It explains how others can build and run the game, understand the architecture, and learn from the implementation.

The documentation is structured to be helpful for:
- **Students** learning web development concepts
- **Developers** wanting to understand the codebase
- **Users** wanting to play the game
- **Educators** using this as a teaching example

