import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { NPCData } from '../components/game/NPC';

interface Position {
  x: number;
  y: number;
}

interface UseNPCInteractionReturn {
  selectedNPC: string | null;
  nearbyNPC: NPCData | null;
  handleDialogueEnd: () => void;
}

export const useNPCInteraction = (
  playerPosition: Position, 
  npcs: NPCData[]
): UseNPCInteractionReturn => {
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const [nearbyNPC, setNearbyNPC] = useState<NPCData | null>(null);
  const { isInDialogue, setInDialogue } = useGameStore();

  // Find nearby NPC based on player position
  const findNearbyNPC = useCallback(() => {
    if (isInDialogue) return;

    const nearby = npcs.find(npc => {
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - npc.x, 2) + Math.pow(playerPosition.y - npc.y, 2)
      );
      return distance <= 60; // Interaction range of 60 pixels
    });

    setNearbyNPC(nearby || null);
  }, [playerPosition, npcs, isInDialogue]);

  // Handle space bar press for interaction
  const handleSpacePress = useCallback((event: KeyboardEvent) => {
    if (event.code !== 'Space' || isInDialogue) return;
    
    event.preventDefault();
    
    if (nearbyNPC) {
      setSelectedNPC(nearbyNPC.id);
      setInDialogue(true);
    }
  }, [nearbyNPC, isInDialogue, setInDialogue]);

  const handleDialogueEnd = useCallback(() => {
    setSelectedNPC(null);
    setInDialogue(false);
  }, [setInDialogue]);

  // Update nearby NPC when player moves
  useEffect(() => {
    findNearbyNPC();
  }, [findNearbyNPC]);

  // Set up space bar event listener
  useEffect(() => {
    window.addEventListener('keydown', handleSpacePress);
    return () => {
      window.removeEventListener('keydown', handleSpacePress);
    };
  }, [handleSpacePress]);

  return {
    selectedNPC,
    nearbyNPC,
    handleDialogueEnd
  };
};