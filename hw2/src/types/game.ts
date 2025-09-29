export interface Position {
  x: number;
  y: number;
}

export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  score: number;
  isPlaying: boolean;
  hasStarted: boolean;
}

export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
  gameSpeed: number;
}

export const BoardSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM', 
  LARGE: 'LARGE'
} as const;

export type BoardSize = typeof BoardSize[keyof typeof BoardSize];

// Global default speed (in milliseconds)
export const DEFAULT_GLOBAL_SPEED = 150;

// Speed scaling ratios - more gradual progression
export const SPEED_RATIOS = {
  SLOW: 1.0,      // Slowest (150ms × 1.0 = 150ms)
  NORMAL: 0.8,    // Normal (150ms × 0.8 = 120ms)
  FAST: 0.64      // Fastest (150ms × 0.8² = 96ms)
} as const;

export const BOARD_SIZE_RATIOS = {
  [BoardSize.SMALL]: 1.0,   // Small board - normal speed (150ms × 1.0 = 150ms)
  [BoardSize.MEDIUM]: 0.7,  // Medium board - 30% faster (150ms × 0.7 = 105ms)
  [BoardSize.LARGE]: 0.49   // Large board - 51% faster (150ms × 0.7² = 73.5ms)
} as const;

export const BOARD_CONFIGS = {
  [BoardSize.SMALL]: {
    boardWidth: 20,
    boardHeight: 15,
    cellSize: 40,
    speedRatio: BOARD_SIZE_RATIOS[BoardSize.SMALL],
    name: 'Small (20x15)'
  },
  [BoardSize.MEDIUM]: {
    boardWidth: 25,
    boardHeight: 20,
    cellSize: 30,
    speedRatio: BOARD_SIZE_RATIOS[BoardSize.MEDIUM],
    name: 'Medium (25x20)'
  },
  [BoardSize.LARGE]: {
    boardWidth: 30,
    boardHeight: 25,
    cellSize: 24,
    speedRatio: BOARD_SIZE_RATIOS[BoardSize.LARGE],
    name: 'Large (30x25)'
  }
} as const;
