import { useState, useCallback } from 'react';
import type { BuildingEntrance } from '../ranges/BuildingRange';

export type SceneType = 'town' | 'building-interior';

export interface BuildingScene {
  id: string;
  buildingId: string;
  name: string;
  description: string;
  backgroundImage?: string;
  backgroundColor?: string;
  exitPosition?: { x: number; y: number }; // Where player spawns when exiting
}

interface LegacyBuildingData {
  id: string;
  name: string;
  [key: string]: any;
}

interface UseBuildingScenesReturn {
  currentScene: SceneType;
  currentBuildingScene: BuildingScene | null;
  enterBuilding: (building: LegacyBuildingData, entrance: BuildingEntrance) => void;
  exitBuilding: () => void;
  isInBuilding: boolean;
}

// Predefined building scenes
const buildingScenes: Record<string, BuildingScene> = {
  'school-interior': {
    id: 'school-interior',
    buildingId: 'school',
    name: 'School Interior',
    description: 'A bright classroom filled with educational posters and student desks.',
    backgroundColor: '#f8f9fa'
  },
  'shop-interior': {
    id: 'shop-interior',
    buildingId: 'shop',
    name: 'Shop Interior',
    description: 'A cozy shop with shelves full of useful items and friendly service.',
    backgroundColor: '#e8f5e8'
  },
  'library-interior': {
    id: 'library-interior',
    buildingId: 'library',
    name: 'Library Interior',
    description: 'A quiet library with towering bookshelves and comfortable reading areas.',
    backgroundColor: '#f0f0f8'
  },
  'cafe-interior': {
    id: 'cafe-interior',
    buildingId: 'cafe',
    name: 'Café Interior',
    description: 'A warm café with the aroma of fresh coffee and pastries.',
    backgroundColor: '#fff8e1'
  }
};

export const useBuildingScenes = (): UseBuildingScenesReturn => {
  const [currentScene, setCurrentScene] = useState<SceneType>('town');
  const [currentBuildingScene, setCurrentBuildingScene] = useState<BuildingScene | null>(null);

  const enterBuilding = useCallback((building: LegacyBuildingData, entrance: BuildingEntrance) => {
    const scene = buildingScenes[entrance.sceneId];
    if (scene) {
      setCurrentScene('building-interior');
      setCurrentBuildingScene(scene);
      console.log(`Entering ${building.name} via ${entrance.direction} entrance`);
    } else {
      console.warn(`Scene ${entrance.sceneId} not found for building ${building.name}`);
    }
  }, []);

  const exitBuilding = useCallback(() => {
    setCurrentScene('town');
    setCurrentBuildingScene(null);
    console.log('Exiting building, returning to town');
  }, []);

  const isInBuilding = currentScene === 'building-interior';

  return {
    currentScene,
    currentBuildingScene,
    enterBuilding,
    exitBuilding,
    isInBuilding
  };
};