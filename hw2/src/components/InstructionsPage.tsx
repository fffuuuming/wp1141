import React from 'react';
import './InstructionsPage.css';

interface InstructionsPageProps {
  onBack: () => void;
}

const InstructionsPage: React.FC<InstructionsPageProps> = ({ onBack }) => {
  return (
    <div className="instructions-page">
      <div className="instructions-container">
        <h1 className="instructions-title">HOW TO PLAY</h1>
        <div className="title-underline"></div>
        
        <div className="instructions-content">
          <div className="instruction-section">
            <h2 className="section-title">Objective</h2>
            <p className="section-text">
              Control the snake to eat food and grow longer. Avoid hitting walls or yourself!
            </p>
          </div>
          
          <div className="instruction-section">
            <h2 className="section-title">Controls</h2>
            <div className="controls-grid">
              <div className="control-item">
                <div className="control-keys">
                  <kbd>↑</kbd>
                  <kbd>↓</kbd>
                  <kbd>←</kbd>
                  <kbd>→</kbd>
                </div>
                <span className="control-description">Move snake</span>
              </div>
              <div className="control-item">
                <div className="control-keys">
                  <kbd>Space</kbd>
                </div>
                <span className="control-description">Start/Pause game</span>
              </div>
            </div>
          </div>
          
          <div className="instruction-section">
            <h2 className="section-title">Game Rules</h2>
            <ul className="rules-list">
              <li>Each food eaten increases your score by 10 points</li>
              <li>Snake grows longer with each food consumed</li>
              <li>Game ends if snake hits walls or itself</li>
              <li>Higher speed = more challenging gameplay</li>
            </ul>
          </div>
        </div>
        
        <button className="back-button" onClick={onBack}>
          BACK TO MENU
        </button>
      </div>
    </div>
  );
};

export default InstructionsPage;
