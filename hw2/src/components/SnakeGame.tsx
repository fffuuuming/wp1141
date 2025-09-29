import React from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import type { BoardSize } from '../types/game';
import './SnakeGame.css';

interface SnakeGameProps {
  gameSpeed?: number;
  boardSize?: BoardSize;
  onBackToMenu: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ gameSpeed = 150, boardSize = 'SMALL', onBackToMenu }) => {
  const { gameState, gameConfig, startGame, resetGame } = useSnakeGame(gameSpeed, boardSize);


  const handleGameAreaClick = () => {
    if (!gameState.hasStarted) {
      startGame();
    }
  };

  return (
    <div className="snake-game">
      <div className="game-container">
        <div className="game-header">
          <button className="back-button" onClick={onBackToMenu}>
            ← Back to Menu
          </button>
          
          <GameInfo 
            score={gameState.score}
            isPlaying={gameState.isPlaying}
            gameOver={gameState.gameOver}
          />
        </div>
        
        <div 
          className="game-board-wrapper"
          onClick={handleGameAreaClick}
          tabIndex={0}
        >
          <GameBoard 
            snake={gameState.snake}
            food={gameState.food}
            gameConfig={gameConfig}
          />
          
          {!gameState.hasStarted && (
            <div className="start-overlay">
              <p>Click here or press SPACE to start</p>
              <p>Use arrow keys to control the snake</p>
            </div>
          )}
          
          {gameState.gameOver && (
            <div className="game-over-overlay">
              <h2>Game Over!</h2>
              <p>Final Score: {gameState.score}</p>
              <button onClick={resetGame} className="restart-button">
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
