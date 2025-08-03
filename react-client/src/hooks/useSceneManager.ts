/**
 * Scene Manager - Manages scene transitions in Range architecture
 * Single Responsibility: Scene state and transition logic
 */

import { useState, useCallback } from 'react';

export type SceneType = 'town' | 'school';

interface UseSceneManagerReturn {
  currentScene: SceneType;
  enterSchool: () => void;
  exitToTown: () => void;
}

export const useSceneManager = (initialScene: SceneType = 'town'): UseSceneManagerReturn => {
  const [currentScene, setCurrentScene] = useState<SceneType>(initialScene);

  const enterSchool = useCallback(() => {
    console.log('🏫 Entering school scene');
    setCurrentScene('school');
  }, []);

  const exitToTown = useCallback(() => {
    console.log('🏘️ Returning to town scene');
    setCurrentScene('town');
  }, []);

  return {
    currentScene,
    enterSchool,
    exitToTown
  };
};