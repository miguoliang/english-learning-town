import { useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { NPCData } from '../components/game/NPC';

interface Position {
  x: number;
  y: number;
}

interface UseNPCInteractionReturn {
  selectedNPC: string | null;
  handleNPCClick: (npc: NPCData, playerPosition: Position) => void;
  handleDialogueEnd: () => void;
}

export const useNPCInteraction = (): UseNPCInteractionReturn => {
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const { isInDialogue, setInDialogue } = useGameStore();

  const handleNPCClick = useCallback((npc: NPCData, playerPosition: Position) => {
    if (isInDialogue) return;

    // Check if player is close enough
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - npc.x, 2) + Math.pow(playerPosition.y - npc.y, 2)
    );

    if (distance > 100) {
      alert(`You need to move closer to ${npc.name} to start a conversation!`);
      return;
    }

    setSelectedNPC(npc.id);
    setInDialogue(true);
  }, [isInDialogue, setInDialogue]);

  const handleDialogueEnd = useCallback(() => {
    setSelectedNPC(null);
    setInDialogue(false);
  }, [setInDialogue]);

  return {
    selectedNPC,
    handleNPCClick,
    handleDialogueEnd
  };
};