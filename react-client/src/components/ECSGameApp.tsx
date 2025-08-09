/**
 * ECS Game App - Main game coordinator using ECS architecture
 * Replaces the Range-based GameApp with event-driven, data-driven ECS approach
 */

import React, { useState, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import { ECSScene } from './scenes/ECSScene';
import { MainMenu } from './scenes/MainMenu';
import { LoadingScreen } from './ui/LoadingScreen';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

type GameState = 'menu' | 'loading' | 'town' | 'school' | 'shop' | 'library' | 'cafe';

interface SceneConfig {
  id: string;
  name: string;
  dataPath: string;
  playerStartPosition?: { x: number; y: number };
}

// Scene configurations - Data-driven approach
const SCENES: Record<string, SceneConfig> = {
  town: {
    id: 'town',
    name: 'English Learning Town',
    dataPath: '/src/data/scenes/town.json',
    playerStartPosition: { x: 10, y: 10 }
  },
  'school-interior': {
    id: 'school-interior', 
    name: 'School Classroom',
    dataPath: '/src/data/scenes/school.json',
    playerStartPosition: { x: 15, y: 15 }
  },
  'shop-interior': {
    id: 'shop-interior',
    name: 'Village Shop',
    dataPath: '/src/data/scenes/shop.json', // We'd need to create this
    playerStartPosition: { x: 8, y: 8 }
  },
  'library-interior': {
    id: 'library-interior',
    name: 'Town Library', 
    dataPath: '/src/data/scenes/library.json', // We'd need to create this
    playerStartPosition: { x: 6, y: 8 }
  },
  'cafe-interior': {
    id: 'cafe-interior',
    name: 'Village Café',
    dataPath: '/src/data/scenes/cafe.json', // We'd need to create this
    playerStartPosition: { x: 5, y: 6 }
  }
};

export const ECSGameApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentScene, setCurrentScene] = useState<string>('town');
  const [isLoading, setIsLoading] = useState(false);

  // Handle game start from main menu
  const handleStartGame = useCallback(() => {
    setIsLoading(true);
    // Simulate loading time
    setTimeout(() => {
      setGameState('town');
      setCurrentScene('town');
      setIsLoading(false);
    }, 1500);
  }, []);


  // Handle scene transitions
  const handleSceneTransition = useCallback((targetScene: string, _transitionData?: any) => {
    
    // Handle special scene transitions
    if (targetScene === 'town' && currentScene !== 'town') {
      // Return to town from any interior
      setCurrentScene('town');
      setGameState('town');
    } else if (SCENES[targetScene]) {
      // Transition to a known scene
      setCurrentScene(targetScene);
      setGameState(targetScene as GameState);
    } else {
      console.warn('Unknown scene:', targetScene);
    }
  }, [currentScene]);

  // Render current game state
  const renderCurrentState = () => {
    switch (gameState) {
      case 'menu':
        return (
          <MainMenu 
            onStartGame={handleStartGame}
          />
        );
        
      case 'loading':
        return <LoadingScreen />;
        
      case 'town':
      case 'school':
      case 'shop': 
      case 'library':
      case 'cafe':
        const sceneConfig = SCENES[currentScene];
        if (!sceneConfig) {
          console.error('Scene config not found for:', currentScene);
          return <div>Error: Scene not found</div>;
        }
        
        return (
          <ECSScene
            sceneId={sceneConfig.id}
            sceneName={sceneConfig.name}
            sceneDataPath={sceneConfig.dataPath}
            playerStartPosition={sceneConfig.playerStartPosition}
            onSceneTransition={handleSceneTransition}
            showGrid={false}
            cellSize={40}
          />
        );
        
      default:
        return <div>Unknown game state: {gameState}</div>;
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <AppContainer>
          <LoadingScreen />
        </AppContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        {renderCurrentState()}
      </AppContainer>
    </ThemeProvider>
  );
};