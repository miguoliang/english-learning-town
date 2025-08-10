/**
 * ECS Scene with Zustand - Simplified scene component using Zustand store
 * Avoids React lifecycle issues with direct store usage
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ECSRendererZustand } from '../../ecs/ECSRendererZustand';
import { useGameStore } from '../../stores/unifiedGameStore';
import { getDefaultPlayerPosition, getDefaultScenePath, getCellSize } from '../../config/gameConfig';
import { DialogueSystem } from '../dialogue/DialogueSystem';

const SceneContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.gameBackground};
  position: relative;
  overflow: hidden;
`;

const HUD = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 200;
  pointer-events: none;
`;

const PlayerInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #2d3436;
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
`;

const LocationText = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 5px;
`;

const PositionText = styled.div`
  font-size: 0.9rem;
  color: #636e72;
`;

const Controls = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #2d3436;
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  font-size: 0.9rem;
  color: #2d3436;
  text-align: center;
  
  div {
    margin-bottom: 5px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

interface ECSSceneZustandProps {
  playerName: string;
  scenePath?: string;
  showGrid?: boolean;
  cellSize?: number;
}

export const ECSSceneZustand: React.FC<ECSSceneZustandProps> = ({
  playerName,
  scenePath = getDefaultScenePath(),
  showGrid = true,
  cellSize = getCellSize()
}) => {
  // Get state and actions from Unified Zustand store
  const isECSInitialized = useGameStore(state => state.isECSInitialized);
  // Removed unused currentScene - consolidated in unified store
  const playerPosition = useGameStore(state => state.playerPosition);
  const world = useGameStore(state => state.world);
  const loadScene = useGameStore(state => state.loadScene);
  const addPlayer = useGameStore(state => state.addPlayer);
  const startGameLoop = useGameStore(state => state.startGameLoop);
  const stopGameLoop = useGameStore(state => state.stopGameLoop);

  // Local state for dialogue management
  const [activeDialogue, setActiveDialogue] = useState<{
    npcId: string;
    targetId: string;
  } | null>(null);

  // Load scene and start game when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!isECSInitialized) {
          console.log('⚠️ ECS not initialized yet, waiting...');
          return;
        }

        console.log('🎮 ECSSceneZustand: Initializing game...');
        
        // Load the scene
        await loadScene(scenePath);
        
        // Add player to the configured default position
        const playerPos = getDefaultPlayerPosition();
        addPlayer('player', playerPos, playerName);
        
        // Start the game loop
        startGameLoop();
        
        console.log('✅ ECSSceneZustand: Game initialized successfully');
      } catch (error) {
        console.error('❌ ECSSceneZustand: Failed to initialize game:', error);
      }
    };

    initializeGame();

    // Cleanup on unmount
    return () => {
      console.log('🧹 ECSSceneZustand: Component unmounting, stopping game loop');
      stopGameLoop();
    };
  }, [isECSInitialized, scenePath, playerName, loadScene, addPlayer, startGameLoop, stopGameLoop]);

  // Set up dialogue event listener
  useEffect(() => {
    if (!world) return;

    const eventBus = world.getEventBus();
    
    const handleDialogueStart = (data: { initiatorId: string; targetId: string; dialogueId: string }) => {
      // Use the dialogueId as the npcId for the dialogue system
      setActiveDialogue({
        npcId: data.dialogueId,
        targetId: data.targetId
      });
    };

    eventBus.on('dialogue:start', handleDialogueStart);

    return () => {
      eventBus.off('dialogue:start', handleDialogueStart);
    };
  }, [world]);

  return (
    <SceneContainer>
      {/* Game Renderer */}
      <ECSRendererZustand 
        cellSize={cellSize} 
        showGrid={showGrid}
      />
      
      {/* HUD */}
      <HUD>
        <PlayerInfo>
          <LocationText>English Learning Town</LocationText>
          <PositionText>
            Position: ({playerPosition?.x || 0}, {playerPosition?.y || 0})
          </PositionText>
        </PlayerInfo>
        
        <Controls>
          <div>🎮 WASD/Arrow keys to move</div>
          <div>🖱️ Click to move</div>
          <div>💬 Press SPACEBAR near NPCs to talk</div>
          <div>🚪 Click entrances to enter</div>
        </Controls>
      </HUD>
      
      {/* Dialogue System */}
      {activeDialogue && (
        <DialogueSystem 
          npcId={activeDialogue.npcId} 
          onClose={() => setActiveDialogue(null)} 
        />
      )}
    </SceneContainer>
  );
};
