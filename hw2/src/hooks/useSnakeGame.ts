import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Position, BoardSize } from '../types/game';
import { Direction, BOARD_CONFIGS } from '../types/game';
import { useAudio } from './useAudio';


const getInitialSnake = (boardWidth: number, boardHeight: number): Position[] => {
  const centerX = Math.floor(boardWidth / 2);
  const centerY = Math.floor(boardHeight / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
};

const getInitialFood = (boardWidth: number, boardHeight: number): Position => {
  return {
    x: Math.floor(boardWidth * 0.75),
    y: Math.floor(boardHeight / 2)
  };
};

const getInitialState = (boardWidth: number, boardHeight: number): GameState => ({
  snake: getInitialSnake(boardWidth, boardHeight),
  food: getInitialFood(boardWidth, boardHeight),
  direction: Direction.RIGHT,
  gameOver: false,
  score: 0,
  isPlaying: false,
  hasStarted: false
});

export const useSnakeGame = (gameSpeed: number = 150, boardSize: BoardSize = 'SMALL') => {
  const boardConfig = BOARD_CONFIGS[boardSize];
  const [gameState, setGameState] = useState<GameState>(() => 
    getInitialState(boardConfig.boardWidth, boardConfig.boardHeight)
  );
  const gameLoopRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<Direction>(Direction.RIGHT);
  const [currentSpeed, setCurrentSpeed] = useState<number>(gameSpeed);
  const { playBGM, restartBGM, stopBGM, playFoodSound, playGameOverSound } = useAudio();
  
  const gameConfig = {
    boardWidth: boardConfig.boardWidth,
    boardHeight: boardConfig.boardHeight,
    cellSize: boardConfig.cellSize,
    gameSpeed: currentSpeed
  };

  const calculateNewSpeed = useCallback((currentSpeed: number, initialSpeed: number): number => {
    const speedMultiplier = 1.025;
    const maxMultiplier = Math.pow(1.025, 20); // 1.025^20
    const maxSpeed = initialSpeed / maxMultiplier; // Lower number = faster speed
    
    const newSpeed = currentSpeed / speedMultiplier;
    return Math.max(newSpeed, maxSpeed);
  }, []);

  const generateFood = useCallback((): Position => {
    const { boardWidth, boardHeight } = gameConfig;
    let newFood: Position;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight)
      };
    } while (
      gameState.snake.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      )
    );
    
    return newFood;
  }, [gameState.snake]);

  const checkCollision = useCallback((head: Position): boolean => {
    const { boardWidth, boardHeight } = gameConfig;
    
    // Check wall collision
    if (head.x < 0 || head.x >= boardWidth || head.y < 0 || head.y >= boardHeight) {
      return true;
    }
    
    // Check self collision
    return gameState.snake.some(segment => 
      segment.x === head.x && segment.y === head.y
    );
  }, [gameState.snake]);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.isPlaying) return prevState;

      const head = { ...prevState.snake[0] };
      
      // Move head based on direction
      switch (prevState.direction) {
        case Direction.UP:
          head.y -= 1;
          break;
        case Direction.DOWN:
          head.y += 1;
          break;
        case Direction.LEFT:
          head.x -= 1;
          break;
        case Direction.RIGHT:
          head.x += 1;
          break;
      }

      // Check for collision
      if (checkCollision(head)) {
        // Play game over sound effect
        playGameOverSound();
        
        return {
          ...prevState,
          gameOver: true,
          isPlaying: false
        };
      }

      const newSnake = [head, ...prevState.snake];
      
      // Check if food is eaten
      const ateFood = head.x === prevState.food.x && head.y === prevState.food.y;
      
      if (ateFood) {
        // Play food sound effect
        playFoodSound();
        
        // Increase speed when food is eaten
        const newSpeed = calculateNewSpeed(currentSpeed, gameSpeed);
        setCurrentSpeed(newSpeed);
        
        return {
          ...prevState,
          snake: newSnake,
          food: generateFood(),
          score: prevState.score + 10
        };
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
        return {
          ...prevState,
          snake: newSnake
        };
      }
    });
  }, [checkCollision, generateFood]);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prevState => {
      // Prevent reversing into itself
      const oppositeDirections = {
        [Direction.UP]: Direction.DOWN,
        [Direction.DOWN]: Direction.UP,
        [Direction.LEFT]: Direction.RIGHT,
        [Direction.RIGHT]: Direction.LEFT
      };

      if (oppositeDirections[newDirection] === prevState.direction) {
        return prevState;
      }

      return {
        ...prevState,
        direction: newDirection
      };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPlaying: true,
      gameOver: false,
      hasStarted: true
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(getInitialState(boardConfig.boardWidth, boardConfig.boardHeight));
    setCurrentSpeed(gameSpeed); // Reset speed to initial value
    lastDirectionRef.current = Direction.RIGHT;
    // Stop background music when resetting
    stopBGM();
  }, [boardConfig.boardWidth, boardConfig.boardHeight, gameSpeed, stopBGM]);

  const pauseGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPlaying: false
    }));
    // Pause background music when game is paused
    stopBGM();
  }, [stopBGM]);

  // Reset speed when initial gameSpeed changes
  useEffect(() => {
    setCurrentSpeed(gameSpeed);
  }, [gameSpeed]);

  // Handle BGM based on game state
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && gameState.hasStarted) {
      // Only restart BGM if this is a completely fresh start (score is 0 and snake is initial length)
      const isFreshStart = gameState.score === 0 && gameState.snake.length === 3;
      if (isFreshStart) {
        restartBGM();
      } else {
        playBGM();
      }
    } else {
      stopBGM();
    }
  }, [gameState.isPlaying, gameState.gameOver, gameState.hasStarted, gameState.score, gameState.snake.length, playBGM, restartBGM, stopBGM]);

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, currentSpeed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.gameOver, moveSnake, currentSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          changeDirection(Direction.UP);
          break;
        case 'ArrowDown':
          event.preventDefault();
          changeDirection(Direction.DOWN);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          changeDirection(Direction.LEFT);
          break;
        case 'ArrowRight':
          event.preventDefault();
          changeDirection(Direction.RIGHT);
          break;
        case ' ':
          event.preventDefault();
          if (gameState.isPlaying) {
            pauseGame();
          } else {
            startGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, gameState.isPlaying, changeDirection, startGame, pauseGame]);

  return {
    gameState,
    gameConfig,
    startGame,
    resetGame,
    pauseGame,
    changeDirection
  };
};
