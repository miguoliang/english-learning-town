import { useState, useCallback, useEffect } from 'react';
import type { BuildingData } from '../components/game/Building';
import type { NPCData } from '../components/game/NPC';
import { useQuestStore } from '../stores/questStore';
import { ObjectiveType } from '../types';
import { useGridSystem } from './useGridSystem';

interface Position {
  x: number;
  y: number;
}

interface UsePlayerMovementReturn {
  playerPosition: Position;
  currentLocation: string;
  movePlayer: (x: number, y: number) => void;
}

export const usePlayerMovement = (buildings: BuildingData[], npcs: NPCData[]): UsePlayerMovementReturn => {
  const { gridSystem, isWalkable, snapToGrid } = useGridSystem({ buildings, npcs });
  
  const [playerPosition, setPlayerPosition] = useState<Position>(() => {
    // Find the grid cell closest to center of screen
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // Convert to grid coordinates to find the closest grid cell
    const gridX = Math.floor(screenCenterX / gridSystem.cellSize);
    const gridY = Math.floor(screenCenterY / gridSystem.cellSize);
    
    // Return the center position of that grid cell
    return gridSystem.gridToScreenCenter(gridX, gridY);
  });
  const [currentLocation, setCurrentLocation] = useState('Town Center');
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set());

  const { updateQuestObjective } = useQuestStore();

  // Movement configuration - now grid-based
  const CELL_SIZE = gridSystem.cellSize;

  const updateLocation = useCallback((x: number, y: number) => {
    // Check if player is on a building using grid collision detection
    const gridPos = gridSystem.screenToGrid(x, y);
    const collisionArea = gridSystem.getCollisionAreaAt(gridPos.x, gridPos.y);
    
    if (collisionArea && collisionArea.type === 'building') {
      const building = buildings.find(b => b.id === collisionArea.id);
      if (building) {
        setCurrentLocation(building.name);
        
        // Update quest objectives for location visits
        if (!visitedLocations.has(building.id)) {
          setVisitedLocations(prev => new Set([...prev, building.id]));
          updateQuestObjective('welcome', ObjectiveType.GO_TO_LOCATION, building.id);
          updateQuestObjective('first_shopping', ObjectiveType.GO_TO_LOCATION, building.id);
        }
        return;
      }
    }
    
    setCurrentLocation('Town Center');
  }, [buildings, visitedLocations, updateQuestObjective, gridSystem]);

  const movePlayer = useCallback((x: number, y: number) => {
    // Check if the target position is walkable
    if (!isWalkable(x, y)) {
      return; // Can't move to blocked position
    }

    // Snap to grid
    const snappedPosition = snapToGrid(x, y);
    
    setPlayerPosition(snappedPosition);
    updateLocation(snappedPosition.x, snappedPosition.y);
  }, [updateLocation, isWalkable, snapToGrid]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      return;
    }

    // Prevent default browser scrolling
    event.preventDefault();
    
    setPlayerPosition(prevPosition => {
      // Convert current position to grid coordinates
      const currentGridX = Math.round((prevPosition.x - CELL_SIZE / 2) / CELL_SIZE);
      const currentGridY = Math.round((prevPosition.y - CELL_SIZE / 2) / CELL_SIZE);
      
      let newGridX = currentGridX;
      let newGridY = currentGridY;

      // Move in grid coordinates (1 cell at a time)
      switch (event.code) {
        case 'ArrowUp':
          newGridY = currentGridY - 1;
          break;
        case 'ArrowDown':
          newGridY = currentGridY + 1;
          break;
        case 'ArrowLeft':
          newGridX = currentGridX - 1;
          break;
        case 'ArrowRight':
          newGridX = currentGridX + 1;
          break;
      }

      // Convert new grid position to screen coordinates
      const newScreenPosition = gridSystem.gridToScreenCenter(newGridX, newGridY);

      // Check if new position is walkable
      if (isWalkable(newScreenPosition.x, newScreenPosition.y)) {
        updateLocation(newScreenPosition.x, newScreenPosition.y);
        return newScreenPosition;
      }

      // Can't move to that position, stay where we are
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

  // Handle window resize to keep player in bounds
  useEffect(() => {
    const handleResize = () => {
      setPlayerPosition(prev => {
        const maxX = window.innerWidth - CELL_SIZE;
        const maxY = window.innerHeight - CELL_SIZE;
        const clampedX = Math.min(prev.x, maxX);
        const clampedY = Math.min(prev.y, maxY);
        return snapToGrid(clampedX, clampedY);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [CELL_SIZE, snapToGrid]);

  return {
    playerPosition,
    currentLocation,
    movePlayer
  };
};