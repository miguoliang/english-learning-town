/**
 * School Scene - Interior classroom scene using Range architecture
 * Single Responsibility: Orchestrate Range-based school gameplay
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { RangeMap } from '../game/RangeMap';
import { useSchoolRanges } from '../../hooks/useSchoolRanges';
import { useRangePlayerMovement } from '../../hooks/useRangePlayerMovement';
import { useRangeInteraction } from '../../hooks/useRangeInteraction';
import { DialogueSystem } from '../dialogue/DialogueSystem';
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

const SceneInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #2d3436;
  border-radius: 15px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
`;

const SceneTitle = styled.div`
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

interface SchoolSceneProps {
  onExitToTown: () => void;
}

export const SchoolScene: React.FC<SchoolSceneProps> = ({ onExitToTown }) => {
  // Initialize School ranges
  const { ranges } = useSchoolRanges();
  
  // Player movement using Range system
  const { playerPosition, movePlayer, ranges: movementRanges } = useRangePlayerMovement(ranges);

  // Range-based interaction system  
  const { selectedRange, handleDialogueEnd } = useRangeInteraction(
    playerPosition,
    movementRanges
  );

  // Handle building entrance interactions (exit door)
  const handleEntranceInteract = useCallback((building: BuildingRange, entrance: BuildingEntrance) => {
    if (building.id === 'school-exit' && entrance.sceneId === 'town-scene') {
      onExitToTown();
    }
  }, [onExitToTown]);

  // Handle map clicks for movement
  const handleMapClick = useCallback((x: number, y: number) => {
    movePlayer(x, y);
  }, [movePlayer]);

  // Handle range interactions
  const handleRangeClick = useCallback((range: Range) => {
    console.log('Range clicked in school:', range.id);
  }, []);

  return (
    <SceneContainer>
      {/* HUD */}
      <HUD>
        <SceneInfo>
          <SceneTitle>🏫 English Learning Classroom</SceneTitle>
          <PositionText>
            Position: ({Math.round((playerPosition.x - 20) / 40)}, {Math.round((playerPosition.y - 20) / 40)})
          </PositionText>
        </SceneInfo>
        
        <Controls>
          <ControlText>🎮 Click to move</ControlText>
          <ControlText>💬 Click NPCs to talk</ControlText>
          <ControlText>🚪 Click exit door to leave</ControlText>
        </Controls>
      </HUD>

      {/* Range Map - School interior ranges */}
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