/**
 * Town Scene - Main game scene using Range architecture
 * Single Responsibility: Orchestrate Range-based town gameplay
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { RangeMap } from '../game/RangeMap';
import { useRangeEntities } from '../../hooks/useRangeEntities';
import { useRangePlayerMovement } from '../../hooks/useRangePlayerMovement';
import { useRangeInteraction } from '../../hooks/useRangeInteraction';
import { useBuildingScenes } from '../../hooks/useBuildingScenes';
import { DialogueSystem } from '../dialogue/DialogueSystem';
import { BuildingInterior } from './BuildingInterior';
import type { BuildingRange, BuildingEntrance } from '../../ranges/BuildingRange';
import type { Range } from '../../types/ranges';

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

export const TownScene: React.FC = () => {
  // Initialize Range entities
  const { ranges } = useRangeEntities();
  
  // Player movement using Range system
  const { playerPosition, movePlayer, ranges: movementRanges } = useRangePlayerMovement(ranges);

  // Range-based interaction system  
  const { selectedRange, handleDialogueEnd } = useRangeInteraction(
    playerPosition,
    movementRanges
  );
  
  // Building scene management
  const { currentBuildingScene, enterBuilding, exitBuilding, isInBuilding } = useBuildingScenes();

  // Handle building entrance interactions
  const handleEntranceInteract = useCallback((building: BuildingRange, entrance: BuildingEntrance) => {
    enterBuilding(building.toLegacyBuilding(), entrance);
  }, [enterBuilding]);

  // Handle map clicks for movement
  const handleMapClick = useCallback((x: number, y: number) => {
    movePlayer(x, y);
  }, [movePlayer]);

  // Handle range interactions
  const handleRangeClick = useCallback((range: Range) => {
    console.log('Range clicked:', range.id);
  }, []);


  // If in building, show building interior
  if (isInBuilding && currentBuildingScene) {
    return (
      <BuildingInterior
        scene={currentBuildingScene}
        onExit={exitBuilding}
      />
    );
  }

  return (
    <SceneContainer>
      {/* HUD */}
      <HUD>
        <PlayerInfo>
          <LocationText>English Learning Town</LocationText>
          <PositionText>
            Position: ({Math.round((playerPosition.x - 20) / 40)}, {Math.round((playerPosition.y - 20) / 40)})
          </PositionText>
        </PlayerInfo>
        
        <Controls>
          <ControlText>🎮 Click to move</ControlText>
          <ControlText>💬 Click NPCs to talk</ControlText>
          <ControlText>🚪 Click building entrances to enter</ControlText>
        </Controls>
      </HUD>

      {/* Range Map - The heart of the Range architecture */}
      <RangeMap
        ranges={movementRanges}
        showGrid={true}
        onMapClick={handleMapClick}
        onRangeClick={handleRangeClick}
        onEntranceInteract={handleEntranceInteract}
      />

      {/* Dialogue System for NPC interactions */}
      {selectedRange && selectedRange.getTypeName() === 'sprite' && (
        <DialogueSystem
          npcId={selectedRange.id}
          onClose={handleDialogueEnd}
        />
      )}
    </SceneContainer>
  );
};