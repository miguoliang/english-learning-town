import { useMemo } from 'react';
import { BuildingRange } from '../ranges/BuildingRange';
import { SpriteRange } from '../ranges/SpriteRange';
import { PlantRange } from '../ranges/PlantRange';
import { EmojiStrategy } from '../types/renderingStrategies';
import { Range } from '../types/ranges';
import type { GridPosition } from '../types/ranges';

interface UseRangeEntitiesReturn {
  ranges: Range[];
  buildings: BuildingRange[];
  npcs: SpriteRange[];
  plants: PlantRange[];
  player: SpriteRange | null;
  updatePlayerPosition: (position: GridPosition) => Range[];
}

export const useRangeEntities = (): UseRangeEntitiesReturn => {
  const buildings = useMemo<BuildingRange[]>(() => {
    const cellSize = 40;
    const gridWidth = Math.floor(window.innerWidth / cellSize);
    
    return [
      new BuildingRange({
        id: 'school',
        position: { x: 5, y: 3 },
        size: { width: 4, height: 3 },
        name: 'School',
        color: '#e17055',
        icon: '🏫',
        renderingStrategy: new EmojiStrategy('🏫', '#e17055'),
        entrances: [
          {
            id: 'school-main',
            position: { x: 2, y: 2 },
            direction: 'south' as const,
            sceneId: 'school-interior'
          }
        ]
      }),
      new BuildingRange({
        id: 'shop',
        position: { x: gridWidth - 8, y: 4 },
        size: { width: 4, height: 3 },
        name: 'Shop',
        color: '#00b894',
        icon: '🏪',
        renderingStrategy: new EmojiStrategy('🏪', '#00b894'),
        entrances: [
          {
            id: 'shop-main',
            position: { x: 0, y: 1 },
            direction: 'west' as const,
            sceneId: 'shop-interior'
          }
        ]
      }),
      new BuildingRange({
        id: 'library',
        position: { x: 8, y: 12 },
        size: { width: 3, height: 3 },
        name: 'Library',
        color: '#6c5ce7',
        icon: '📚',
        renderingStrategy: new EmojiStrategy('📚', '#6c5ce7'),
        entrances: [
          {
            id: 'library-main',
            position: { x: 1, y: 0 },
            direction: 'north' as const,
            sceneId: 'library-interior'
          }
        ]
      }),
      new BuildingRange({
        id: 'cafe',
        position: { x: gridWidth - 7, y: 14 },
        size: { width: 3, height: 2 },
        name: 'Café',
        color: '#fdcb6e',
        icon: '☕',
        renderingStrategy: new EmojiStrategy('☕', '#fdcb6e'),
        entrances: [
          {
            id: 'cafe-main',
            position: { x: 1, y: 1 },
            direction: 'south' as const,
            sceneId: 'cafe-interior'
          }
        ]
      })
    ];
  }, []);

  const npcs = useMemo<SpriteRange[]>(() => {
    const gridWidth = Math.floor(window.innerWidth / 40);
    
    return [
      SpriteRange.createNPC({
        id: 'teacher',
        position: { x: 6, y: 7 },
        name: 'Ms. Johnson',
        icon: '👩‍🏫'
      }),
      SpriteRange.createNPC({
        id: 'shopkeeper',
        position: { x: gridWidth - 6, y: 8 },
        name: 'Mr. Smith',
        icon: '👨‍💼'
      }),
      SpriteRange.createNPC({
        id: 'librarian',
        position: { x: 9, y: 16 },
        name: 'Dr. Brown',
        icon: '👩‍🎓'
      })
    ];
  }, []);

  const plants = useMemo<PlantRange[]>(() => {
    // Create some decorative plants around the town
    return [
      PlantRange.createTree('tree1', { x: 2, y: 8 }),
      PlantRange.createTree('tree2', { x: 15, y: 6 }),
      PlantRange.createBush('bush1', { x: 4, y: 15 }),
      PlantRange.createBush('bush2', { x: 12, y: 18 }),
      PlantRange.createFlower('flower1', { x: 7, y: 10 }),
      PlantRange.createFlower('flower2', { x: 10, y: 8 }),
      PlantRange.createGrass('grass1', { x: 3, y: 12 }),
      PlantRange.createGrass('grass2', { x: 14, y: 11 })
    ];
  }, []);

  const player = useMemo<SpriteRange>(() => {
    // Start player at center of screen, converted to grid coordinates
    const centerX = Math.floor(window.innerWidth / 2 / 40);
    const centerY = Math.floor(window.innerHeight / 2 / 40);
    
    return SpriteRange.createPlayer({ x: centerX, y: centerY });
  }, []);

  const ranges = useMemo<Range[]>(() => {
    return [
      ...buildings,
      ...npcs,
      ...plants,
      player
    ];
  }, [buildings, npcs, plants, player]);

  const updatePlayerPosition = (position: GridPosition): Range[] => {
    const updatedPlayer = SpriteRange.createPlayer(position);
    return [
      ...buildings,
      ...npcs,
      ...plants,
      updatedPlayer
    ];
  };

  return {
    ranges,
    buildings,
    npcs,
    plants,
    player,
    updatePlayerPosition
  };
};