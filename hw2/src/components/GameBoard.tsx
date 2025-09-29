import type { Position, GameConfig } from '../types/game';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gameConfig: GameConfig;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, gameConfig }) => {
  const { boardWidth, boardHeight, cellSize } = gameConfig;

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    let cellClass = 'cell';
    if (isSnakeHead) cellClass += ' snake-head';
    else if (isSnakeBody) cellClass += ' snake-body';
    else if (isFood) cellClass += ' food';

    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        style={{
          width: cellSize,
          height: cellSize,
          left: x * cellSize,
          top: y * cellSize
        }}
      />
    );
  };

  const cells = [];
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      cells.push(renderCell(x, y));
    }
  }

  return (
    <div 
      className="game-board"
      style={{
        width: boardWidth * cellSize,
        height: boardHeight * cellSize
      }}
    >
      {cells}
    </div>
  );
};

export default GameBoard;
