import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Player from './Player';
import NPCCharacter from './NPCCharacter';
import DialogueSystem from './DialogueSystem';
import GameUI from './GameUI';

const GameWorld: React.FC = () => {
  const stageRef = useRef<any>();
  
  // Player state with React useState
  const [player, setPlayer] = useState({ x: 400, y: 300, currentLocation: 'town-square' });
  const gameState = { isPaused: false, isPlaying: true, currentDialogue: null };
  const gameContent = (window as any).gameData || { locations: {}, characters: {} };

  const movePlayer = (x: number, y: number) => {
    console.log('Move player to:', x, y);
    setPlayer(prev => ({ ...prev, x, y }));
  };

  const setGameState = (state: any) => {
    // TODO: Connect to proper store
    console.log('Set game state:', state);
  };

  const startDialogue = (dialogueId: string) => {
    // TODO: Connect to proper store
    console.log('Start dialogue:', dialogueId);
  };

  const currentLocation = gameContent.locations?.[player.currentLocation as keyof typeof gameContent.locations];

  // Handle keyboard input for player movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPaused) return;

      const speed = 5;
      let newX = player.x;
      let newY = player.y;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY = Math.max(0, player.y - speed);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY = Math.min(600 - 32, player.y + speed);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX = Math.max(0, player.x - speed);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX = Math.min(800 - 32, player.x + speed);
          break;
        case ' ':
        case 'Enter':
          // Check for nearby NPCs to interact with
          checkForNPCInteraction();
          break;
        default:
          return;
      }

      if (newX !== player.x || newY !== player.y) {
        movePlayer(newX, newY);
      }
    };

    const checkForNPCInteraction = () => {
      if (!currentLocation || !(currentLocation as any).characters) return;

      (currentLocation as any).characters.forEach((characterId: string) => {
        const character = gameContent.characters?.[characterId as keyof typeof gameContent.characters];
        if (!character) return;

        const distance = Math.sqrt(
          Math.pow(player.x - (character as any).position.x, 2) + 
          Math.pow(player.y - (character as any).position.y, 2)
        );

        // If close enough to NPC (within 50 pixels)
        if (distance < 50) {
          // Start dialogue with the first available dialogue
          if ((character as any).dialogues && (character as any).dialogues.length > 0) {
            startDialogue((character as any).dialogues[0]);
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player.x, player.y, gameState.isPaused, currentLocation, gameContent, movePlayer, startDialogue]);

  // Initialize game state
  useEffect(() => {
    setGameState({ isPlaying: true });
  }, [setGameState]);

  const renderNPCs = () => {
    if (!currentLocation || !(currentLocation as any).characters) return null;

    return (currentLocation as any).characters.map((characterId: string) => {
      const character = gameContent.characters?.[characterId as keyof typeof gameContent.characters];
      if (!character) return null;

      return (
        <NPCCharacter
          key={characterId}
          character={character as any}
        />
      );
    });
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Game Canvas */}
      <Stage 
        width={800} 
        height={600} 
        ref={stageRef}
        style={{
          border: '2px solid #333',
          backgroundColor: currentLocation ? '#87CEEB' : '#90EE90'
        }}
      >
        <Layer>
          {/* Render NPCs */}
          {renderNPCs()}
          
          {/* Render Player */}
          <Player player={player} />
        </Layer>
      </Stage>

      {/* UI Overlays */}
      <GameUI />
      
      {/* Dialogue System */}
      {gameState.currentDialogue && (
        <DialogueSystem dialogueId={gameState.currentDialogue} />
      )}

      {/* Game Instructions */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div>Use WASD or Arrow Keys to move</div>
        <div>Press SPACE or ENTER to interact</div>
        <div>Location: {(currentLocation as any)?.name || 'Loading...'}</div>
      </div>
    </div>
  );
};

export default GameWorld;