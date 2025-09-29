import React from 'react';
import './GameInfo.css';

interface GameInfoProps {
  score: number;
  isPlaying: boolean;
  gameOver: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({ score, isPlaying, gameOver }) => {
  return (
    <div className="game-info">
      <div className="score">
        <span className="label">Score:</span>
        <span className="value">{score}</span>
      </div>
      <div className="status">
        {gameOver ? (
          <span className="game-over">Game Over</span>
        ) : isPlaying ? (
          <span className="playing">Playing</span>
        ) : (
          <span className="paused">Paused</span>
        )}
      </div>
    </div>
  );
};

export default GameInfo;
