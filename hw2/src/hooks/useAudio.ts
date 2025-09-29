import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const foodSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  const playBGM = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio('/assets/sounds/bgm.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3; // Lower volume for background music
    }
    
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(console.error);
    }
  }, []);

  const restartBGM = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio('/assets/sounds/bgm.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3; // Lower volume for background music
    }
    
    // Always reset to beginning and play (for new games)
    bgmRef.current.currentTime = 0;
    bgmRef.current.play().catch(console.error);
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmRef.current && !bgmRef.current.paused) {
      bgmRef.current.pause();
    }
  }, []);

  const playFoodSound = useCallback(() => {
    if (!foodSoundRef.current) {
      foodSoundRef.current = new Audio('/assets/sounds/food.mp3');
      foodSoundRef.current.volume = 0.5;
    }
    
    foodSoundRef.current.currentTime = 0; // Reset to beginning
    foodSoundRef.current.play().catch(console.error);
  }, []);

  const playGameOverSound = useCallback(() => {
    if (!gameOverSoundRef.current) {
      gameOverSoundRef.current = new Audio('/assets/sounds/game-over.mp3');
      gameOverSoundRef.current.volume = 0.6;
    }
    
    gameOverSoundRef.current.currentTime = 0; // Reset to beginning
    gameOverSoundRef.current.play().catch(console.error);
  }, []);

  return {
    playBGM,
    restartBGM,
    stopBGM,
    playFoodSound,
    playGameOverSound
  };
};
