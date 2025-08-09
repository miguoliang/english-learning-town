/**
 * ECS Scene - React component that uses ECS architecture
 * Replaces the Range-based TownScene and SchoolScene
 */

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ECSRenderer } from '../../ecs/ECSRenderer';
import { useECSWorld } from '../../hooks/useECSWorld';
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
  text-align: right;
  pointer-events: auto;
`;

const ControlText = styled.div`
  font-size: 0.9rem;
  color: #636e72;
  margin-bottom: 3px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LoadingMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 15px;
  font-size: 1.2rem;
  color: #2d3436;
  border: 2px solid #2d3436;
`;

interface ECSSceneProps {
  sceneId: string;
  sceneName: string;
  sceneDataPath: string;
  playerStartPosition?: { x: number; y: number };
  onSceneTransition?: (targetScene: string, data?: any) => void;
  showGrid?: boolean;
  cellSize?: number;
}

export const ECSScene: React.FC<ECSSceneProps> = ({
  sceneId,
  sceneName,
  sceneDataPath,
  playerStartPosition = { x: 10, y: 10 },
  onSceneTransition,
  showGrid = false,
  cellSize = 40
}) => {
  const { world, loadScene, addPlayer } = useECSWorld({
    enableSystems: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<{
    npcId: string;
    dialogueId: string;
  } | null>(null);
  const [playerPosition, setPlayerPosition] = useState(playerStartPosition);

  // Load scene data
  useEffect(() => {
    const loadSceneData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await loadScene(sceneDataPath);
        
        // Add player to scene
        const centerX = Math.floor(window.innerWidth / 2 / cellSize);
        const centerY = Math.floor(window.innerHeight / 2 / cellSize);
        addPlayer('player', playerStartPosition.x !== undefined ? playerStartPosition : { x: centerX, y: centerY });
        
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to load scene: ${err}`);
        setIsLoading(false);
      }
    };

    loadSceneData();
  }, [sceneId, sceneDataPath, loadScene, addPlayer, playerStartPosition, cellSize]);

  // Set up event listeners
  useEffect(() => {
    const eventBus = world.getEventBus();

    // Handle scene transition requests
    const unsubscribeSceneTransition = eventBus.subscribe('app:scene-transition-request', (event) => {
      if (onSceneTransition) {
        onSceneTransition(event.data.to, event.data);
      }
    });

    // Handle dialogue start
    const unsubscribeDialogue = eventBus.subscribe('app:dialogue-start', (event) => {
      setCurrentDialogue({
        npcId: event.data.targetId,
        dialogueId: event.data.dialogueId
      });
    });

    // Track player movement for HUD
    const unsubscribeMovement = eventBus.subscribe('entity:moved', (event) => {
      if (event.data.entityId === 'player') {
        setPlayerPosition({
          x: Math.floor(event.data.newPosition.x),
          y: Math.floor(event.data.newPosition.y)
        });
      }
    });

    return () => {
      unsubscribeSceneTransition();
      unsubscribeDialogue();
      unsubscribeMovement();
    };
  }, [world, onSceneTransition]);

  // Handle dialogue close
  const handleDialogueClose = useCallback(() => {
    setCurrentDialogue(null);
  }, []);

  if (error) {
    return (
      <SceneContainer>
        <LoadingMessage>
          Error: {error}
        </LoadingMessage>
      </SceneContainer>
    );
  }

  if (isLoading) {
    return (
      <SceneContainer>
        <LoadingMessage>
          Loading {sceneName}...
        </LoadingMessage>
      </SceneContainer>
    );
  }

  return (
    <SceneContainer>
      {/* HUD */}
      <HUD>
        <PlayerInfo>
          <LocationText>{sceneName}</LocationText>
          <PositionText>
            Position: ({playerPosition.x}, {playerPosition.y})
          </PositionText>
        </PlayerInfo>
        
        <Controls>
          <ControlText>🎮 WASD/Arrow keys to move</ControlText>
          <ControlText>🖱️ Click to move</ControlText>
          <ControlText>💬 Click NPCs to talk</ControlText>
          <ControlText>🚪 Click entrances to enter</ControlText>
        </Controls>
      </HUD>

      {/* ECS Renderer */}
      <ECSRenderer
        world={world}
        cellSize={cellSize}
        showGrid={showGrid}
      />

      {/* Dialogue System */}
      {currentDialogue && (
        <DialogueSystem
          npcId={currentDialogue.npcId}
          onClose={handleDialogueClose}
        />
      )}
    </SceneContainer>
  );
};