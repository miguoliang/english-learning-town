// Town Exploration Scene - Main gameplay area

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuestStore } from '../../stores/questStore';
import { usePlayerMovement } from '../../hooks/usePlayerMovement';
import { useGameEntities } from '../../hooks/useGameEntities';
import { useNPCInteraction } from '../../hooks/useNPCInteraction';
import { TownMap } from '../game/TownMap';
import { GameHUD } from '../ui/GameHUD';
import QuestTracker from '../quest/QuestTracker';
import QuestLog from '../quest/QuestLog';
import { DialogueSystem } from '../dialogue/DialogueSystem';
import { NotificationSystem } from '../ui/NotificationSystem';

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
  const { buildings, npcs } = useGameEntities();
  const { playerPosition, currentLocation } = usePlayerMovement(buildings, npcs);
  const { selectedNPC, nearbyNPC, handleDialogueEnd } = useNPCInteraction(playerPosition, npcs);

  useEffect(() => {
    // Initialize quest system
    loadQuests();
  }, [loadQuests]);

  const currentQuest = getCurrentActiveQuest();

  return (
    <GameContainer>
      <GameHUD
        currentLocation={currentLocation}
        onReturnToMenu={onReturnToMenu}
        onOpenQuestLog={() => setIsQuestLogOpen(true)}
        onToggleQuestTracker={() => setIsQuestTrackerVisible(!isQuestTrackerVisible)}
        isQuestTrackerVisible={isQuestTrackerVisible}
        currentQuestTitle={currentQuest?.title}
      />

      <TownMap
        playerPosition={playerPosition}
        buildings={buildings}
        npcs={npcs}
        nearbyNPC={nearbyNPC}
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
    </GameContainer>
  );
};

export default TownExploration;