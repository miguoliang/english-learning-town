import { useState, useCallback, useEffect } from 'react';
import { SpriteRange, SpriteRole } from '../ranges/SpriteRange';
import { BuildingRange } from '../ranges/BuildingRange';
import { useQuestStore } from '../stores/questStore';
import { ObjectiveType } from '../types';
import { useRangeGridSystem } from './useRangeGridSystem';
import type { GridPosition } from '../types/ranges';
import type { Range } from '../types/ranges';

interface UseRangePlayerMovementReturn {
  playerPosition: GridPosition;
  currentLocation: string;
  movePlayer: (x: number, y: number) => void;
  ranges: Range[];
}

export const useRangePlayerMovement = (
  initialRanges: Range[]
): UseRangePlayerMovementReturn => {
  const [ranges, setRanges] = useState<Range[]>(initialRanges);
  const [currentLocation, setCurrentLocation] = useState('Town Center');
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set());

  const { updateQuestObjective } = useQuestStore();
  const { gridSystem } = useRangeGridSystem({ ranges });

  // Get current player position
  const playerRange = ranges.find(range => 
    range instanceof SpriteRange && 
    range.role === SpriteRole.PLAYER
  ) as SpriteRange;
  
  const playerPosition = playerRange?.position || { x: 0, y: 0 };

  const updateLocation = useCallback((gridX: number, gridY: number) => {
    // Check if player is on a building using range collision detection
    const rangeAt = gridSystem.getRangeAt(gridX, gridY);
    
    if (rangeAt && rangeAt instanceof BuildingRange) {
      setCurrentLocation(rangeAt.name);
      
      // Update quest objectives for location visits
      if (!visitedLocations.has(rangeAt.id)) {
        setVisitedLocations(prev => new Set([...prev, rangeAt.id]));
        updateQuestObjective('welcome', ObjectiveType.GO_TO_LOCATION, rangeAt.id);
        updateQuestObjective('first_shopping', ObjectiveType.GO_TO_LOCATION, rangeAt.id);
      }
      return;
    }
    
    setCurrentLocation('Town Center');
  }, [gridSystem, visitedLocations, updateQuestObjective]);

  const movePlayer = useCallback((screenX: number, screenY: number) => {
    // Convert screen coordinates to grid coordinates
    const gridPos = gridSystem.screenToGrid(screenX, screenY);
    
    // Check if the target position is walkable
    if (!gridSystem.isWalkable(gridPos.x, gridPos.y)) {
      return; // Can't move to blocked position
    }

    // Update player position in ranges array
    setRanges(prevRanges => {
      return prevRanges.map(range => {
        if (range instanceof SpriteRange && range.role === SpriteRole.PLAYER) {
          return SpriteRange.createPlayer(gridPos);
        }
        return range;
      });
    });
    
    updateLocation(gridPos.x, gridPos.y);
  }, [gridSystem, updateLocation]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      return;
    }

    // Prevent default browser scrolling
    event.preventDefault();
    
    let newGridX = playerPosition.x;
    let newGridY = playerPosition.y;

    switch (event.code) {
      case 'ArrowUp':
        newGridY = playerPosition.y - 1;
        break;
      case 'ArrowDown':
        newGridY = playerPosition.y + 1;
        break;
      case 'ArrowLeft':
        newGridX = playerPosition.x - 1;
        break;
      case 'ArrowRight':
        newGridX = playerPosition.x + 1;
        break;
    }

    // Check if new position is walkable
    if (gridSystem.isWalkable(newGridX, newGridY)) {
      setRanges(prevRanges => {
        return prevRanges.map(range => {
          if (range instanceof SpriteRange && range.role === SpriteRole.PLAYER) {
            return SpriteRange.createPlayer({ x: newGridX, y: newGridY });
          }
          return range;
        });
      });
      
      updateLocation(newGridX, newGridY);
    }
  }, [playerPosition, gridSystem, updateLocation]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Handle window resize to keep player in bounds
  useEffect(() => {
    const handleResize = () => {
      const gridDimensions = gridSystem.getDimensions();
      
      setRanges(prevRanges => {
        return prevRanges.map(range => {
          if (range instanceof SpriteRange && range.role === SpriteRole.PLAYER) {
            const clampedX = Math.min(playerPosition.x, gridDimensions.width - 1);
            const clampedY = Math.min(playerPosition.y, gridDimensions.height - 1);
            return SpriteRange.createPlayer({ x: clampedX, y: clampedY });
          }
          return range;
        });
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gridSystem, playerPosition]);

  // Update ranges when initial ranges change
  useEffect(() => {
    setRanges(initialRanges);
  }, [initialRanges]);

  return {
    playerPosition,
    currentLocation,
    movePlayer,
    ranges
  };
};