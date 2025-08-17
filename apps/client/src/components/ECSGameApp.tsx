/**
 * ECS Game App - Main game coordinator using ECS architecture
 * Replaces the Range-based GameApp with event-driven, data-driven ECS approach
 */

import React, { useState, useCallback, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import { ECSSceneZustand } from './scenes/ECSSceneZustand';
import { MainMenu } from './scenes/MainMenu';
import { LoadingScreen } from '@elt/ui';
import { gameConfig } from '../config/gameConfig';
import { useGameStore } from '../stores/unifiedGameStore';
import { CelebrationManager } from './celebration/CelebrationManager';
import { logger } from '../utils/logger';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
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
    dataPath: '/data/scenes/town.json',
    playerStartPosition: { x: 10, y: 10 }
  },
  'school-interior': {
    id: 'school-interior', 
    name: 'School Classroom',
    dataPath: '/data/scenes/school.json',
    playerStartPosition: { x: 15, y: 15 }
  },
  'shop-interior': {
    id: 'shop-interior',
    name: 'Village Shop',
    dataPath: '/data/scenes/shop.json', // We'd need to create this
    playerStartPosition: { x: 8, y: 8 }
  },
  'library-interior': {
    id: 'library-interior',
    name: 'Town Library', 
    dataPath: '/data/scenes/library.json', // We'd need to create this
    playerStartPosition: { x: 6, y: 8 }
  },
  'cafe-interior': {
    id: 'cafe-interior',
    name: 'Village Café',
    dataPath: '/data/scenes/cafe.json', // We'd need to create this
    playerStartPosition: { x: 5, y: 6 }
  }
};

export const ECSGameApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentScene, setCurrentScene] = useState<string>('town');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize ECS on app start
  const initializeECS = useGameStore(state => state.initializeECS);
  const isECSInitialized = useGameStore(state => state.isECSInitialized);
  const player = useGameStore(state => state.player);
  const world = useGameStore(state => state.world);

  useEffect(() => {
    if (!isECSInitialized) {
      logger.ecs('ECSGameApp: Initializing ECS...');
      initializeECS();
    }
  }, [initializeECS, isECSInitialized]);

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
  const handleSceneTransition = useCallback((event: any) => {
    const targetScene = event.to;
    logger.scene(`Scene transition: ${currentScene} -> ${targetScene}`);
    
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
      logger.warn('Unknown scene:', targetScene);
    }
  }, [currentScene]);

  // Wire up ECS event listeners
  useEffect(() => {
    if (world && isECSInitialized) {
      const eventBus = world.getEventBus();
      
      // Subscribe to scene transition events
      eventBus.on('scene:transition', handleSceneTransition);
      
      return () => {
        // Cleanup subscription
        eventBus.off('scene:transition', handleSceneTransition);
      };
    }
  }, [world, isECSInitialized, handleSceneTransition]);

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
      case 'cafe': {
        const sceneConfig = SCENES[currentScene];
        if (!sceneConfig) {
          logger.error('Scene config not found for:', currentScene);
          return <div>Error: Scene not found</div>;
        }
        
        return (
          <GameContainer className="ecs-game-container">
            <ECSSceneZustand
              playerName={player.name}
              scenePath={sceneConfig.dataPath}
              showGrid={gameConfig.display.showGrid}
              cellSize={gameConfig.display.cellSize}
            />
          </GameContainer>
        );
      }
        
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
        {/* Global celebration manager - shows across all scenes */}
        <CelebrationManager />
      </AppContainer>
    </ThemeProvider>
  );
};