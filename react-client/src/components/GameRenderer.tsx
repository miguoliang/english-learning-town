/**
 * Game Renderer - Renders game entities and UI
 * Single Responsibility: Visual rendering
 */

import React from 'react';
import styled from 'styled-components';
import type { GameEntity } from '../game/GridSystem';
import type { PlayerPosition } from '../game/PlayerController';
import { CELL_SIZE } from '../game/GameData';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.gameBackground};
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  position: relative;
  overflow: hidden;
`;

const Player = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x - 20}px;
  top: ${props => props.y - 20}px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  z-index: 100;
  border: 2px solid #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
`;

const Building = styled.div<{ x: number; y: number; width: number; height: number; color: string }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background: ${props => props.color};
  border: 2px solid #2d3436;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const NPC = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x - 20}px;
  top: ${props => props.y - 20}px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  z-index: 50;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
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

interface GameRendererProps {
  entities: GameEntity[];
  playerPosition: PlayerPosition;
  currentLocation: string;
  canInteract: boolean;
}

export const GameRenderer: React.FC<GameRendererProps> = ({
  entities,
  playerPosition,
  currentLocation,
  canInteract
}) => {
  return (
    <GameContainer tabIndex={0} style={{ outline: 'none' }}>
      <HUD>
        <PlayerInfo>
          <LocationText>{currentLocation}</LocationText>
          <PositionText>Position: ({playerPosition.x}, {playerPosition.y})</PositionText>
          <PositionText>
            {canInteract ? '🎯 Press Space to interact' : ''}
          </PositionText>
        </PlayerInfo>
        
        <Controls>
          <ControlText>🎮 Use arrow keys to move</ControlText>
          <ControlText>⌨️ Press Space to interact</ControlText>
        </Controls>
      </HUD>

      {/* Render buildings */}
      {entities.filter(e => e.type === 'building').map(entity => (
        <Building
          key={entity.id}
          x={entity.gridX * CELL_SIZE}
          y={entity.gridY * CELL_SIZE}
          width={(entity.width || 1) * CELL_SIZE}
          height={(entity.height || 1) * CELL_SIZE}
          color={entity.color || 'rgba(139, 69, 19, 0.8)'}
        >
          {entity.icon}
        </Building>
      ))}

      {/* Render NPCs */}
      {entities.filter(e => e.type === 'npc').map(entity => (
        <NPC
          key={entity.id}
          x={entity.gridX * CELL_SIZE + CELL_SIZE / 2}
          y={entity.gridY * CELL_SIZE + CELL_SIZE / 2}
        >
          {entity.icon}
        </NPC>
      ))}

      {/* Player */}
      <Player 
        x={playerPosition.x * CELL_SIZE + CELL_SIZE / 2} 
        y={playerPosition.y * CELL_SIZE + CELL_SIZE / 2}
      >
        🧑
      </Player>
    </GameContainer>
  );
};