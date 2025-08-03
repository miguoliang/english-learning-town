// Town Exploration Scene - Main gameplay area

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuestStore } from '../../stores/questStore';
import { usePlayerMovement } from '../../hooks/usePlayerMovement';
import { useRangeEntities } from '../../hooks/useRangeEntities';
import { useNPCInteraction } from '../../hooks/useNPCInteraction';
import { useBuildingScenes } from '../../hooks/useBuildingScenes';
import { RangeMap } from '../game/RangeMap';
import type { BuildingRange, BuildingEntrance } from '../../ranges/BuildingRange';
import { GameHUD } from '../ui/GameHUD';
import QuestTracker from '../quest/QuestTracker';
import QuestLog from '../quest/QuestLog';
import { DialogueSystem } from '../dialogue/DialogueSystem';
import { NotificationSystem } from '../ui/NotificationSystem';
import { BuildingInterior } from './BuildingInterior';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.gameBackground};
  position: relative;
  overflow: hidden;
  cursor: default;
`;

interface TownExplorationProps {
  onReturnToMenu: () => void;
}

export const TownExploration: React.FC<TownExplorationProps> = ({ onReturnToMenu }) => {
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
  const [isQuestTrackerVisible, setIsQuestTrackerVisible] = useState(false);
  
  const { loadQuests, getCurrentActiveQuest } = useQuestStore();
  const { ranges, buildings, npcs } = useRangeEntities();
  const { playerPosition, currentLocation, movePlayer } = usePlayerMovement(
    buildings.map(b => b.toLegacyBuilding()), 
    npcs.map(n => ({ id: n.id, x: n.getScreenPosition(40).x, y: n.getScreenPosition(40).y, icon: '👤', name: 'NPC' }))
  );
  const { selectedNPC, handleDialogueEnd } = useNPCInteraction(
    playerPosition, 
    npcs.map(n => ({ id: n.id, x: n.getScreenPosition(40).x, y: n.getScreenPosition(40).y, icon: '👤', name: 'NPC' }))
  );
  const { currentBuildingScene, enterBuilding, exitBuilding, isInBuilding } = useBuildingScenes();

  useEffect(() => {
    // Initialize quest system
    loadQuests();
  }, [loadQuests]);

  const currentQuest = getCurrentActiveQuest();

  const handleEntranceInteract = (building: BuildingRange, entrance: BuildingEntrance) => {
    enterBuilding(building.toLegacyBuilding(), entrance);
  };

  return (
    <GameContainer>
      {isInBuilding && currentBuildingScene ? (
        <BuildingInterior
          scene={currentBuildingScene}
          onExit={exitBuilding}
        />
      ) : (
        <>
          <GameHUD
            currentLocation={currentLocation}
            onReturnToMenu={onReturnToMenu}
            onOpenQuestLog={() => setIsQuestLogOpen(true)}
            onToggleQuestTracker={() => setIsQuestTrackerVisible(!isQuestTrackerVisible)}
            isQuestTrackerVisible={isQuestTrackerVisible}
            currentQuestTitle={currentQuest?.title}
          />

          <RangeMap
            ranges={ranges}
            onMapClick={movePlayer}
            onEntranceInteract={handleEntranceInteract}
          />

          {/* UI Components */}
          {isQuestTrackerVisible && <QuestTracker />}
          
          <QuestLog 
            isOpen={isQuestLogOpen}
            onClose={() => setIsQuestLogOpen(false)}
          />

          {selectedNPC && (
            <DialogueSystem
              npcId={selectedNPC}
              onClose={handleDialogueEnd}
            />
          )}

          <NotificationSystem />
        </>
      )}
    </GameContainer>
  );
};

export default TownExploration;