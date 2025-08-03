import { useMemo } from 'react';
import type { BuildingData } from '../components/game/Building';
import type { NPCData } from '../components/game/NPC';

interface UseGameEntitiesReturn {
  buildings: BuildingData[];
  npcs: NPCData[];
}

export const useGameEntities = (): UseGameEntitiesReturn => {
  const buildings = useMemo<BuildingData[]>(() => [
    { id: 'school', x: 200, y: 150, color: '#e17055', icon: '🏫', name: 'School' },
    { id: 'shop', x: 800, y: 200, color: '#00b894', icon: '🏪', name: 'Shop' },
    { id: 'library', x: 400, y: 500, color: '#6c5ce7', icon: '📚', name: 'Library' },
    { id: 'cafe', x: 700, y: 500, color: '#fdcb6e', icon: '☕', name: 'Café' }
  ], []);

  const npcs = useMemo<NPCData[]>(() => [
    { id: 'teacher', x: 240, y: 220, icon: '👩‍🏫', name: 'Ms. Johnson' },
    { id: 'shopkeeper', x: 840, y: 270, icon: '👨‍💼', name: 'Mr. Smith' },
    { id: 'librarian', x: 440, y: 570, icon: '👩‍🎓', name: 'Dr. Brown' }
  ], []);

  return {
    buildings,
    npcs
  };
};