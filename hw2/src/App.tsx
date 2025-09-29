import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MainMenu from './components/MainMenu';
import SettingsPage from './components/SettingsPage';
import InstructionsPage from './components/InstructionsPage';
import type { BoardSize } from './types/game';
import { BOARD_CONFIGS, SPEED_RATIOS, DEFAULT_GLOBAL_SPEED } from './types/game';
import './App.css';

type GameState = 'menu' | 'settings' | 'instructions' | 'game';
type SpeedLevel = 'SLOW' | 'NORMAL' | 'FAST';

function App() {
  const [currentState, setCurrentState] = useState<GameState>('menu');
  const [boardSize, setBoardSize] = useState<BoardSize>('SMALL');
  const [speedLevel, setSpeedLevel] = useState<SpeedLevel>('NORMAL');

  const handlePlay = () => {
    setCurrentState('game');
  };

  const handleSettings = () => {
    setCurrentState('settings');
  };

  const handleInstructions = () => {
    setCurrentState('instructions');
  };

  const handleBackToMenu = () => {
    setCurrentState('menu');
  };

  const handleSpeedChange = (speed: SpeedLevel) => {
    setSpeedLevel(speed);
  };

  const handleBoardSizeChange = (size: BoardSize) => {
    setBoardSize(size);
  };

  // Calculate final speed using multiplicative approach
  const calculateFinalSpeed = (): number => {
    const speedRatio = SPEED_RATIOS[speedLevel];
    const boardRatio = BOARD_CONFIGS[boardSize].speedRatio;
    const finalRatio = speedRatio * boardRatio;
    return DEFAULT_GLOBAL_SPEED * finalRatio;
  };

  return (
    <div className="App">
      {currentState === 'menu' && (
        <MainMenu 
          onPlay={handlePlay}
          onSettings={handleSettings}
          onInstructions={handleInstructions}
        />
      )}
      
      {currentState === 'settings' && (
        <SettingsPage 
          speedLevel={speedLevel}
          boardSize={boardSize}
          onSpeedChange={handleSpeedChange}
          onBoardSizeChange={handleBoardSizeChange}
          onBack={handleBackToMenu}
        />
      )}
      
      {currentState === 'instructions' && (
        <InstructionsPage 
          onBack={handleBackToMenu}
        />
      )}
      
      {currentState === 'game' && (
        <SnakeGame 
          gameSpeed={calculateFinalSpeed()}
          boardSize={boardSize}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;