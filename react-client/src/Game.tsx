/**
 * Game - Main game orchestrator
 * Single Responsibility: Coordinate game systems
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GridSystem } from './game/GridSystem';
import { PlayerController } from './game/PlayerController';
import { GAME_ENTITIES } from './game/GameData';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { GameRenderer } from './components/GameRenderer';

export const Game: React.FC = () => {
  // Initialize game systems
  const [gridSystem] = useState(() => new GridSystem());
  const [playerController] = useState(() => new PlayerController(gridSystem));
  const [playerPosition, setPlayerPosition] = useState(() => playerController.getPosition());

  // Initialize game world
  useEffect(() => {
    gridSystem.initialize(GAME_ENTITIES);
  }, [gridSystem]);

  // Movement handlers
  const handleMoveUp = useCallback(() => {
    if (playerController.move('up')) {
      setPlayerPosition(playerController.getPosition());
    }
  }, [playerController]);

  const handleMoveDown = useCallback(() => {
    if (playerController.move('down')) {
      setPlayerPosition(playerController.getPosition());
    }
  }, [playerController]);

  const handleMoveLeft = useCallback(() => {
    if (playerController.move('left')) {
      setPlayerPosition(playerController.getPosition());
    }
  }, [playerController]);

  const handleMoveRight = useCallback(() => {
    if (playerController.move('right')) {
      setPlayerPosition(playerController.getPosition());
    }
  }, [playerController]);

  // Interaction handler
  const handleInteract = useCallback(() => {
    const message = playerController.interact();
    if (message) {
      alert(message);
    }
  }, [playerController]);

  // Set up keyboard controls
  useKeyboardControls({
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
    onMoveLeft: handleMoveLeft,
    onMoveRight: handleMoveRight,
    onInteract: handleInteract
  });

  // Get current location and interaction state
  const currentLocation = playerController.getCurrentLocation();
  const canInteract = gridSystem.getInteractiveEntity(playerPosition.x, playerPosition.y) !== null;

  return (
    <GameRenderer
      entities={GAME_ENTITIES}
      playerPosition={playerPosition}
      currentLocation={currentLocation}
      canInteract={canInteract}
    />
  );
};