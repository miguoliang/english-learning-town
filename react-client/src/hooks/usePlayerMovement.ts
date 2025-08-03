import { useState, useCallback, useEffect } from 'react';
import type { BuildingData } from '../components/game/Building';
import { useQuestStore } from '../stores/questStore';
import { ObjectiveType } from '../types';

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
  const [playerPosition, setPlayerPosition] = useState<Position>({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2 
  });
  const [currentLocation, setCurrentLocation] = useState('Town Center');
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set());

  const { updateQuestObjective } = useQuestStore();

  // Movement configuration
  const MOVE_STEP = 16; // pixels per step
  const MAP_WIDTH = window.innerWidth;
  const MAP_HEIGHT = window.innerHeight;

  const updateLocation = useCallback((x: number, y: number) => {
    const building = buildings.find(b => 
      x >= b.x && x <= b.x + 120 && y >= b.y && y <= b.y + 100
    );
    
    if (building) {
      setCurrentLocation(building.name);
      
      // Update quest objectives for location visits
      if (!visitedLocations.has(building.id)) {
        setVisitedLocations(prev => new Set([...prev, building.id]));
        updateQuestObjective('welcome', ObjectiveType.GO_TO_LOCATION, building.id);
        updateQuestObjective('first_shopping', ObjectiveType.GO_TO_LOCATION, building.id);
      }
    } else {
      setCurrentLocation('Town Center');
    }
  }, [buildings, visitedLocations, updateQuestObjective]);

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

  // Handle window resize to keep player centered
  useEffect(() => {
    const handleResize = () => {
      setPlayerPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 32),
        y: Math.min(prev.y, window.innerHeight - 48)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    playerPosition,
    currentLocation,
    movePlayer
  };
};