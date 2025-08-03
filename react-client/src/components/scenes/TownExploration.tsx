// Town Exploration Scene - Main gameplay area

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useGameStore } from '../../stores/gameStore';
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
  cursor: crosshair;
`;

interface TownExplorationProps {
  onReturnToMenu: () => void;
}

export const TownExploration: React.FC<TownExplorationProps> = ({ onReturnToMenu }) => {
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
  
  const { isInDialogue } = useGameStore();
  const { loadQuests, getCurrentActiveQuest } = useQuestStore();
  const { buildings, npcs } = useGameEntities();
  const { playerPosition, currentLocation, handleMapClick } = usePlayerMovement(buildings);
  const { selectedNPC, handleNPCClick, handleDialogueEnd } = useNPCInteraction();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize quest system
    loadQuests();
  }, [loadQuests]);

  const onMapClick = (event: React.MouseEvent) => {
    if (isInDialogue) return;
    handleMapClick(event, mapRef);
  };

  const onNPCClick = (npc: any) => {
    handleNPCClick(npc, playerPosition);
  };

  const currentQuest = getCurrentActiveQuest();

  return (
    <GameContainer>
      <GameHUD
        currentLocation={currentLocation}
        onReturnToMenu={onReturnToMenu}
        onOpenQuestLog={() => setIsQuestLogOpen(true)}
        currentQuestTitle={currentQuest?.title}
      />

      <TownMap
        ref={mapRef}
        playerPosition={playerPosition}
        buildings={buildings}
        npcs={npcs}
        onMapClick={onMapClick}
        onNPCClick={onNPCClick}
      />

      {/* UI Components */}
      <QuestTracker />
      
      <QuestLog 
        isOpen={isQuestLogOpen}
        onClose={() => setIsQuestLogOpen(false)}
      />

      <AnimatePresence>
        {selectedNPC && (
          <DialogueSystem
            npcId={selectedNPC}
            onClose={handleDialogueEnd}
          />
        )}
      </AnimatePresence>

      <NotificationSystem />
    </GameContainer>
  );
};

export default TownExploration;