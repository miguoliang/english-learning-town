/**
 * School Ranges - Manages ranges for school interior scene
 * Single Responsibility: School scene range management
 */

import { useMemo } from 'react';
import { BuildingRange } from '../ranges/BuildingRange';
import { SpriteRange } from '../ranges/SpriteRange';
import { Range } from '../types/ranges';
import { EmojiStrategy } from '../types/renderingStrategies';
import type { GridPosition } from '../types/ranges';

interface UseSchoolRangesReturn {
  ranges: Range[];
  furniture: BuildingRange[];
  npcs: SpriteRange[];
  player: SpriteRange | null;
  updatePlayerPosition: (position: GridPosition) => Range[];
}

export const useSchoolRanges = (): UseSchoolRangesReturn => {
  // School furniture as BuildingRanges
  const furniture = useMemo<BuildingRange[]>(() => {
    return [
      // Teacher's desk at front
      new BuildingRange({
        id: 'teacher-desk',
        position: { x: 12, y: 3 },
        size: { width: 2, height: 1 },
        name: "Teacher's Desk",
        color: 'rgba(139, 69, 19, 0.8)',
        icon: '🏫',
        renderingStrategy: new EmojiStrategy('📋', 'rgba(139, 69, 19, 0.8)')
      }),

      // Blackboard
      new BuildingRange({
        id: 'blackboard',
        position: { x: 10, y: 1 },
        size: { width: 6, height: 1 },
        name: 'Blackboard',
        color: 'rgba(33, 37, 41, 0.9)',
        icon: '📋',
        renderingStrategy: new EmojiStrategy('📋', 'rgba(33, 37, 41, 0.9)')
      }),

      // Student desks (3 rows, 4 desks each)
      ...Array.from({ length: 3 }, (_, row) => 
        Array.from({ length: 4 }, (_, col) => 
          new BuildingRange({
            id: `desk-${row}-${col}`,
            position: { x: 4 + col * 4, y: 6 + row * 3 },
            size: { width: 2, height: 1 },
            name: `Student Desk ${row * 4 + col + 1}`,
            color: 'rgba(205, 133, 63, 0.8)',
            icon: '🪑',
            renderingStrategy: new EmojiStrategy('🪑', 'rgba(205, 133, 63, 0.8)')
          })
        )
      ).flat(),

      // Bookshelves along walls
      new BuildingRange({
        id: 'bookshelf-left',
        position: { x: 1, y: 4 },
        size: { width: 1, height: 8 },
        name: 'Bookshelf',
        color: 'rgba(160, 82, 45, 0.8)',
        icon: '📚',
        renderingStrategy: new EmojiStrategy('📚', 'rgba(160, 82, 45, 0.8)')
      }),

      new BuildingRange({
        id: 'bookshelf-right',
        position: { x: 22, y: 4 },
        size: { width: 1, height: 8 },
        name: 'Bookshelf',
        color: 'rgba(160, 82, 45, 0.8)',
        icon: '📚',
        renderingStrategy: new EmojiStrategy('📚', 'rgba(160, 82, 45, 0.8)')
      }),

      // Exit door (interactive)
      new BuildingRange({
        id: 'school-exit',
        position: { x: 12, y: 16 },
        size: { width: 2, height: 1 },
        name: 'Exit',
        color: 'rgba(108, 117, 125, 0.8)',
        icon: '🚪',
        renderingStrategy: new EmojiStrategy('🚪', 'rgba(108, 117, 125, 0.8)'),
        entrances: [
          {
            id: 'exit-door',
            position: { x: 1, y: 0 }, // Center of the door
            direction: 'south' as const,
            sceneId: 'town-scene'
          }
        ]
      })
    ];
  }, []);

  // School NPCs
  const npcs = useMemo<SpriteRange[]>(() => {
    return [
      // Teacher at front
      SpriteRange.createNPC({
        id: 'school-teacher',
        position: { x: 13, y: 4 },
        name: 'Ms. Rodriguez',
        icon: '👩‍🏫'
      }),

      // Students at some desks
      SpriteRange.createNPC({
        id: 'student-1',
        position: { x: 5, y: 7 },
        name: 'Emma',
        icon: '👧'
      }),

      SpriteRange.createNPC({
        id: 'student-2',
        position: { x: 13, y: 7 },
        name: 'Alex',
        icon: '👦'
      }),

      SpriteRange.createNPC({
        id: 'student-3',
        position: { x: 9, y: 10 },
        name: 'Sarah',
        icon: '👧'
      }),

      SpriteRange.createNPC({
        id: 'student-4',
        position: { x: 17, y: 13 },
        name: 'Michael',
        icon: '👦'
      })
    ];
  }, []);

  // Player starts near the entrance
  const player = useMemo<SpriteRange>(() => {
    return SpriteRange.createPlayer({ x: 13, y: 15 });
  }, []);

  const ranges = useMemo<Range[]>(() => {
    return [
      ...furniture,
      ...npcs,
      player
    ];
  }, [furniture, npcs, player]);

  const updatePlayerPosition = (position: GridPosition): Range[] => {
    const updatedPlayer = SpriteRange.createPlayer(position);
    return [
      ...furniture,
      ...npcs,
      updatedPlayer
    ];
  };

  return {
    ranges,
    furniture,
    npcs,
    player,
    updatePlayerPosition
  };
};