import { useMemo, useEffect } from 'react';
import { GridSystem } from '../utils/gridSystem';
import type { CollisionArea } from '../utils/gridSystem';
import type { BuildingData } from '../components/game/Building';
import type { NPCData } from '../components/game/NPC';

interface UseGridSystemProps {
  buildings: BuildingData[];
  npcs: NPCData[];
  cellSize?: number;
}

interface UseGridSystemReturn {
  gridSystem: GridSystem;
  isWalkable: (screenX: number, screenY: number) => boolean;
  screenToGrid: (screenX: number, screenY: number) => { x: number; y: number };
  gridToScreen: (gridX: number, gridY: number) => { x: number; y: number };
  snapToGrid: (screenX: number, screenY: number) => { x: number; y: number };
}

export const useGridSystem = ({ 
  buildings, 
  npcs, 
  cellSize = 40 
}: UseGridSystemProps): UseGridSystemReturn => {
  const gridSystem = useMemo(() => {
    return new GridSystem(window.innerWidth, window.innerHeight, cellSize);
  }, [cellSize]);

  // Update collision areas when buildings or NPCs change
  useEffect(() => {
    // Clear existing collision areas
    gridSystem.clearCollisionAreas();

    // Add building collision areas
    buildings.forEach(building => {
      const gridPos = gridSystem.screenToGrid(building.x, building.y);
      const gridSize = building.gridSize || { width: 4, height: 3 }; // Default building size
      
      const collisionArea: CollisionArea = {
        id: building.id,
        position: gridPos,
        size: gridSize,
        type: 'building'
      };
      
      gridSystem.addCollisionArea(collisionArea);
    });

    // Add NPC collision areas (1x1 grid cells)
    npcs.forEach(npc => {
      const gridPos = gridSystem.screenToGrid(npc.x, npc.y);
      
      const collisionArea: CollisionArea = {
        id: npc.id,
        position: gridPos,
        size: { width: 1, height: 1 },
        type: 'npc'
      };
      
      gridSystem.addCollisionArea(collisionArea);
    });
  }, [buildings, npcs, gridSystem]);

  const isWalkable = (screenX: number, screenY: number): boolean => {
    const gridPos = gridSystem.screenToGrid(screenX, screenY);
    return gridSystem.isWalkable(gridPos.x, gridPos.y);
  };

  const screenToGrid = (screenX: number, screenY: number) => {
    return gridSystem.screenToGrid(screenX, screenY);
  };

  const gridToScreen = (gridX: number, gridY: number) => {
    return gridSystem.gridToScreen(gridX, gridY);
  };

  const snapToGrid = (screenX: number, screenY: number) => {
    const gridPos = gridSystem.screenToGrid(screenX, screenY);
    return gridSystem.gridToScreenCenter(gridPos.x, gridPos.y);
  };

  return {
    gridSystem,
    isWalkable,
    screenToGrid,
    gridToScreen,
    snapToGrid
  };
};