import { useMemo } from 'react';
import type { BuildingData } from '../components/game/Building';
import type { NPCData } from '../components/game/NPC';

interface UseGameEntitiesReturn {
  buildings: BuildingData[];
  npcs: NPCData[];
}

export const useGameEntities = (): UseGameEntitiesReturn => {
  const buildings = useMemo<BuildingData[]>(() => {
    const cellSize = 40;
    const gridWidth = Math.floor(window.innerWidth / cellSize);
    
    // Position buildings on exact grid coordinates
    return [
      { 
        id: 'school', 
        x: 5 * cellSize,  // Grid position (5, 3)
        y: 3 * cellSize, 
        color: '#e17055', 
        icon: '🏫', 
        name: 'School',
        gridSize: { width: 4, height: 3 }
      },
      { 
        id: 'shop', 
        x: (gridWidth - 8) * cellSize,  // Grid position (right side - 8, 4)
        y: 4 * cellSize, 
        color: '#00b894', 
        icon: '🏪', 
        name: 'Shop',
        gridSize: { width: 4, height: 3 }
      },
      { 
        id: 'library', 
        x: 8 * cellSize,  // Grid position (8, 12)
        y: 12 * cellSize, 
        color: '#6c5ce7', 
        icon: '📚', 
        name: 'Library',
        gridSize: { width: 3, height: 3 }
      },
      { 
        id: 'cafe', 
        x: (gridWidth - 7) * cellSize,  // Grid position (right side - 7, 14)
        y: 14 * cellSize, 
        color: '#fdcb6e', 
        icon: '☕', 
        name: 'Café',
        gridSize: { width: 3, height: 2 }
      }
    ];
  }, []);

  const npcs = useMemo<NPCData[]>(() => {
    const cellSize = 40;
    const gridWidth = Math.floor(window.innerWidth / cellSize);
    
    // Position NPCs at grid cell centers
    return [
      { id: 'teacher', x: 6 * cellSize + cellSize/2, y: 7 * cellSize + cellSize/2, icon: '👩‍🏫', name: 'Ms. Johnson' },
      { id: 'shopkeeper', x: (gridWidth - 6) * cellSize + cellSize/2, y: 8 * cellSize + cellSize/2, icon: '👨‍💼', name: 'Mr. Smith' },
      { id: 'librarian', x: 9 * cellSize + cellSize/2, y: 16 * cellSize + cellSize/2, icon: '👩‍🎓', name: 'Dr. Brown' }
    ];
  }, []);

  return {
    buildings,
    npcs
  };
};