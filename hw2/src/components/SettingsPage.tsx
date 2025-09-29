import React from 'react';
import './SettingsPage.css';
import type { BoardSize } from '../types/game';
import { BOARD_CONFIGS } from '../types/game';

type SpeedLevel = 'SLOW' | 'NORMAL' | 'FAST';

interface SettingsPageProps {
  speedLevel: SpeedLevel;
  boardSize: BoardSize;
  onSpeedChange: (speed: SpeedLevel) => void;
  onBoardSizeChange: (boardSize: BoardSize) => void;
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  speedLevel, 
  boardSize, 
  onSpeedChange, 
  onBoardSizeChange, 
  onBack 
}) => {
  const speedOptions = [
    { value: 'SLOW' as SpeedLevel, label: 'Slow' },
    { value: 'NORMAL' as SpeedLevel, label: 'Normal' },
    { value: 'FAST' as SpeedLevel, label: 'Fast' }
  ];

  const boardSizeOptions = Object.entries(BOARD_CONFIGS).map(([key, config]) => ({
    value: key as BoardSize,
    label: config.name
  }));

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">SETTINGS</h1>
        <div className="title-underline"></div>
        
        <div className="settings-content">
          <div className="setting-group">
            <label className="setting-label">Snake Speed:</label>
            <div className="speed-options">
              {speedOptions.map((option) => (
                <button
                  key={option.value}
                  className={`speed-option ${speedLevel === option.value ? 'active' : ''}`}
                  onClick={() => onSpeedChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label className="setting-label">Board Size:</label>
            <div className="board-size-options">
              {boardSizeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`board-size-option ${boardSize === option.value ? 'active' : ''}`}
                  onClick={() => onBoardSizeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button className="back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
