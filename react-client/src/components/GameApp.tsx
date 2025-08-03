/**
 * Game App - Scene manager for Range-based game
 * Single Responsibility: Orchestrate scene transitions
 */

import React from 'react';
import { TownScene } from './scenes/TownScene';
import { SchoolScene } from './scenes/SchoolScene';
import { useSceneManager } from '../hooks/useSceneManager';

export const GameApp: React.FC = () => {
  const { currentScene, enterSchool, exitToTown } = useSceneManager('town');

  switch (currentScene) {
    case 'town':
      return <TownScene onEnterSchool={enterSchool} />;
    
    case 'school':
      return <SchoolScene onExitToTown={exitToTown} />;
    
    default:
      return <TownScene onEnterSchool={enterSchool} />;
  }
};