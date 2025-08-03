import { useMemo } from 'react';
import type { BuildingData } from '../components/game/Building';
import type { NPCData } from '../components/game/NPC';

interface UseGameEntitiesReturn {
  buildings: BuildingData[];
  npcs: NPCData[];
}

export const useGameEntities = (): UseGameEntitiesReturn => {
  const buildings = useMemo<BuildingData[]>(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    return [
      { id: 'school', x: screenWidth * 0.15, y: screenHeight * 0.2, color: '#e17055', icon: '🏫', name: 'School' },
      { id: 'shop', x: screenWidth * 0.75, y: screenHeight * 0.25, color: '#00b894', icon: '🏪', name: 'Shop' },
      { id: 'library', x: screenWidth * 0.3, y: screenHeight * 0.65, color: '#6c5ce7', icon: '📚', name: 'Library' },
      { id: 'cafe', x: screenWidth * 0.65, y: screenHeight * 0.65, color: '#fdcb6e', icon: '☕', name: 'Café' }
    ];
  }, []);

  const npcs = useMemo<NPCData[]>(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    return [
      { id: 'teacher', x: screenWidth * 0.18, y: screenHeight * 0.3, icon: '👩‍🏫', name: 'Ms. Johnson' },
      { id: 'shopkeeper', x: screenWidth * 0.78, y: screenHeight * 0.35, icon: '👨‍💼', name: 'Mr. Smith' },
      { id: 'librarian', x: screenWidth * 0.33, y: screenHeight * 0.75, icon: '👩‍🎓', name: 'Dr. Brown' }
    ];
  }, []);

  return {
    buildings,
    npcs
  };
};