import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onInstructions: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings, onInstructions }) => {
  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">SNAKE</h1>
        <div className="title-underline"></div>
        
        <div className="menu-buttons">
          <button className="menu-button play-button" onClick={onPlay}>
            PLAY
          </button>
          
          <button className="menu-button settings-button" onClick={onSettings}>
            SETTINGS
          </button>
          
          <button className="menu-button instructions-button" onClick={onInstructions}>
            HOW TO PLAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
