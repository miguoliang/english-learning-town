/**
 * Keyboard Controls Hook - Handles keyboard input
 * Single Responsibility: Keyboard event management
 */

import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onInteract: () => void;
}

export const useKeyboardControls = ({
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onInteract
}: UseKeyboardControlsProps): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp': 
          event.preventDefault();
          onMoveUp(); 
          break;
        case 'ArrowDown': 
          event.preventDefault();
          onMoveDown(); 
          break;
        case 'ArrowLeft': 
          event.preventDefault();
          onMoveLeft(); 
          break;
        case 'ArrowRight': 
          event.preventDefault();
          onMoveRight(); 
          break;
        case 'Space': 
          event.preventDefault();
          onInteract(); 
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMoveUp, onMoveDown, onMoveLeft, onMoveRight, onInteract]);
};