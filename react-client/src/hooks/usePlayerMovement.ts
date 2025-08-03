import { useState, useCallback, useEffect } from 'react';
import type { BuildingData } from '../components/game/Building';

interface Position {
  x: number;
  y: number;
}

interface UsePlayerMovementReturn {
  playerPosition: Position;
  currentLocation: string;
  movePlayer: (x: number, y: number) => void;
}

export const usePlayerMovement = (buildings: BuildingData[]): UsePlayerMovementReturn => {
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 600, y: 400 });
  const [currentLocation, setCurrentLocation] = useState('Town Center');

  // Movement configuration
  const MOVE_STEP = 16; // pixels per step
  const MAP_WIDTH = 1200;
  const MAP_HEIGHT = 800;

  const updateLocation = useCallback((x: number, y: number) => {
    const building = buildings.find(b => 
      x >= b.x && x <= b.x + 120 && y >= b.y && y <= b.y + 100
    );
    
    if (building) {
      setCurrentLocation(building.name);
    } else {
      setCurrentLocation('Town Center');
    }
  }, [buildings]);

  const movePlayer = useCallback((x: number, y: number) => {
    // Ensure movement stays within map boundaries
    const clampedX = Math.max(16, Math.min(MAP_WIDTH - 16, x));
    const clampedY = Math.max(24, Math.min(MAP_HEIGHT - 24, y));
    
    setPlayerPosition({ x: clampedX, y: clampedY });
    updateLocation(clampedX + 16, clampedY + 24);
  }, [updateLocation]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      return;
    }

    // Prevent default browser scrolling
    event.preventDefault();
    
    setPlayerPosition(prevPosition => {
      let newX = prevPosition.x;
      let newY = prevPosition.y;

      switch (event.code) {
        case 'ArrowUp':
          newY = Math.max(24, prevPosition.y - MOVE_STEP);
          break;
        case 'ArrowDown':
          newY = Math.min(MAP_HEIGHT - 24, prevPosition.y + MOVE_STEP);
          break;
        case 'ArrowLeft':
          newX = Math.max(16, prevPosition.x - MOVE_STEP);
          break;
        case 'ArrowRight':
          newX = Math.min(MAP_WIDTH - 16, prevPosition.x + MOVE_STEP);
          break;
      }

      // Only update if position actually changed
      if (newX !== prevPosition.x || newY !== prevPosition.y) {
        updateLocation(newX + 16, newY + 24);
        return { x: newX, y: newY };
      }

      return prevPosition;
    });
  }, [updateLocation]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    playerPosition,
    currentLocation,
    movePlayer
  };
};