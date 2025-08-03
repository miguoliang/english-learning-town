/**
 * Game Data - Static game entity definitions
 * Single Responsibility: Game content data
 */

import type { GameEntity } from './GridSystem';

export const GAME_ENTITIES: GameEntity[] = [
  { 
    id: 'school', 
    type: 'building', 
    gridX: 5, 
    gridY: 5, 
    width: 4, 
    height: 3, 
    icon: '🏫', 
    name: 'School', 
    color: 'rgba(116, 185, 255, 0.8)' 
  },
  { 
    id: 'shop', 
    type: 'building', 
    gridX: 15, 
    gridY: 8, 
    width: 3, 
    height: 2, 
    icon: '🏪', 
    name: 'Shop', 
    color: 'rgba(0, 184, 148, 0.8)' 
  },
  { 
    id: 'library', 
    type: 'building', 
    gridX: 25, 
    gridY: 5, 
    width: 3, 
    height: 4, 
    icon: '📚', 
    name: 'Library', 
    color: 'rgba(108, 92, 231, 0.8)' 
  },
  { 
    id: 'cafe', 
    type: 'building', 
    gridX: 8, 
    gridY: 15, 
    width: 3, 
    height: 2, 
    icon: '☕', 
    name: 'Café', 
    color: 'rgba(253, 203, 110, 0.8)' 
  },
  { 
    id: 'teacher', 
    type: 'npc', 
    gridX: 12, 
    gridY: 12, 
    icon: '👩‍🏫', 
    name: 'Teacher' 
  },
  { 
    id: 'shopkeeper', 
    type: 'npc', 
    gridX: 20, 
    gridY: 15, 
    icon: '👨‍💼', 
    name: 'Shopkeeper' 
  },
  { 
    id: 'librarian', 
    type: 'npc', 
    gridX: 30, 
    gridY: 12, 
    icon: '📖', 
    name: 'Librarian' 
  },
  { 
    id: 'student', 
    type: 'npc', 
    gridX: 3, 
    gridY: 8, 
    icon: '👨‍🎓', 
    name: 'Student' 
  }
];

export const CELL_SIZE = 40;