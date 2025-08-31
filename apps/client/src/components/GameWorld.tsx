import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import Player from './Player';
import NPCCharacter from './NPCCharacter';
import DialogueModal from './DialogueModal';
import GameUI from './GameUI';
import {
  usePlayer,
  useGameData,
  useGamePlayState,
  usePlayerActions,
  useGameActions,
} from '@english-learning-town/store';

const GameWorld: React.FC = () => {
  const stageRef = useRef<any>();
  const [nearbyNPC, setNearbyNPC] = useState<string | null>(null);

  // Use Zustand store instead of local state
  const player = usePlayer();
  const gameData = useGameData();
  const gameState = useGamePlayState();
  const { movePlayer } = usePlayerActions();
  const { setPlaying, setCurrentDialogue } = useGameActions();

  console.log('GameWorld rendered with:', { player, gameData, gameState });

  // Initialize game as playing once
  useEffect(() => {
    setPlaying(true);
  }, [setPlaying]);

  const startDialogue = (dialogueId: string) => {
    console.log('Start dialogue:', dialogueId);
    setCurrentDialogue(dialogueId);
  };

  const currentLocation =
    gameData?.locations?.[
      player.currentLocation as keyof typeof gameData.locations
    ];

  // Handle keyboard input for player movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPaused) return;

      const speed = 5;
      let newX = player.position.x;
      let newY = player.position.y;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY = Math.max(0, player.position.y - speed);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY = Math.min(600 - 32, player.position.y + speed);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX = Math.max(0, player.position.x - speed);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX = Math.min(800 - 32, player.position.x + speed);
          break;
        case ' ':
        case 'Enter':
          // Check for nearby NPCs to interact with
          checkForNPCInteraction();
          break;
        default:
          return;
      }

      if (newX !== player.position.x || newY !== player.position.y) {
        movePlayer({ x: newX, y: newY });
      }
    };

    const checkForNPCInteraction = () => {
      if (!currentLocation || !(currentLocation as any).characters) return;

      let closestNPC = null;
      let closestDistance = Infinity;

      (currentLocation as any).characters.forEach((characterId: string) => {
        const character =
          gameData?.characters?.[
            characterId as keyof typeof gameData.characters
          ];
        if (!character) return;

        const distance = Math.sqrt(
          Math.pow(player.position.x - (character as any).position.x, 2) +
            Math.pow(player.position.y - (character as any).position.y, 2)
        );

        // Track closest NPC for proximity indicator
        if (distance < 80 && distance < closestDistance) {
          closestDistance = distance;
          closestNPC = characterId;
        }

        // If close enough to NPC (within 50 pixels) and user pressed space/enter
        if (distance < 50) {
          // Start dialogue with the first available dialogue
          if (
            (character as any).dialogues &&
            (character as any).dialogues.length > 0
          ) {
            startDialogue((character as any).dialogues[0]);
          }
        }
      });

      // Update nearby NPC indicator
      setNearbyNPC(closestNPC);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    player.position.x,
    player.position.y,
    gameState.isPaused,
    currentLocation,
    gameData,
    movePlayer,
    startDialogue,
  ]);

  // Check for nearby NPCs continuously (for proximity indicator)
  useEffect(() => {
    const checkProximity = () => {
      if (
        !currentLocation ||
        !(currentLocation as any).characters ||
        gameState.isPaused
      )
        return;

      let closestNPC = null;
      let closestDistance = Infinity;

      (currentLocation as any).characters.forEach((characterId: string) => {
        const character =
          gameData?.characters?.[
            characterId as keyof typeof gameData.characters
          ];
        if (!character) return;

        const distance = Math.sqrt(
          Math.pow(player.position.x - (character as any).position.x, 2) +
            Math.pow(player.position.y - (character as any).position.y, 2)
        );

        if (distance < 80 && distance < closestDistance) {
          closestDistance = distance;
          closestNPC = characterId;
        }
      });

      setNearbyNPC(closestNPC);
    };

    checkProximity();
  }, [
    player.position.x,
    player.position.y,
    currentLocation,
    gameData,
    gameState.isPaused,
  ]);

  const renderNPCs = () => {
    if (!currentLocation || !(currentLocation as any).characters) return null;

    return (currentLocation as any).characters.map((characterId: string) => {
      const character =
        gameData?.characters?.[characterId as keyof typeof gameData.characters];
      if (!character) return null;

      return <NPCCharacter key={characterId} character={character as any} />;
    });
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Game Canvas */}
      <Stage
        width={800}
        height={600}
        ref={stageRef}
        style={{
          border: '2px solid #333',
          backgroundColor: currentLocation ? '#87CEEB' : '#90EE90',
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

      {/* Dialogue Modal */}
      {gameState.currentDialogue && (
        <DialogueModal
          dialogueId={gameState.currentDialogue}
          onClose={() => setCurrentDialogue(null)}
        />
      )}

      {/* Proximity Indicator */}
      {nearbyNPC && !gameState.currentDialogue && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100px)',
            background: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            animation: 'pulse 1.5s infinite',
            zIndex: 100,
            border: '2px solid #3498DB',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <div>
            💬{' '}
            {gameData?.characters?.[
              nearbyNPC as keyof typeof gameData.characters
            ]?.name || 'NPC'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Press SPACE or ENTER to talk
          </div>
        </div>
      )}

      {/* Game Instructions */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
        }}
      >
        <div>Use WASD or Arrow Keys to move</div>
        <div>Press SPACE or ENTER to interact</div>
        <div>Location: {(currentLocation as any)?.name || 'Loading...'}</div>
      </div>
    </div>
  );
};

export default GameWorld;
