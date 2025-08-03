/**
 * Range Interaction Hook - Spatial interaction system for the Range architecture
 * 
 * This hook replaces the old proximity-based interaction with precise spatial
 * interaction conditions. It handles NPCs, building entrances, and any other
 * interactive ranges with their specific spatial requirements.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { InteractionManager } from '../utils/interactionManager';
import type { Range } from '../types/ranges';
import type { GridPosition } from '../types/ranges';

interface UseRangeInteractionReturn {
  selectedRange: Range | null;
  interactableRanges: Range[];
  nearbyRanges: Range[];
  interactionHints: string[];
  handleDialogueEnd: () => void;
  canInteractWithAny: boolean;
}

export const useRangeInteraction = (
  playerPosition: { x: number; y: number }, // Screen coordinates from usePlayerMovement
  ranges: Range[]
): UseRangeInteractionReturn => {
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const { isInDialogue, setInDialogue } = useGameStore();

  // Convert screen coordinates to grid coordinates
  const playerGridPos = useMemo<GridPosition>(() => {
    const cellSize = 40;
    return {
      x: Math.round((playerPosition.x - cellSize / 2) / cellSize),
      y: Math.round((playerPosition.y - cellSize / 2) / cellSize)
    };
  }, [playerPosition]);

  // Get interaction feedback using spatial conditions
  const interactionFeedback = useMemo(() => {
    return InteractionManager.getInteractionFeedback(playerGridPos, ranges);
  }, [playerGridPos, ranges]);

  // Extract interactable and nearby ranges
  const interactableRanges = useMemo(() => 
    interactionFeedback.interactableNow.map(result => result.range), 
    [interactionFeedback]
  );

  const nearbyRanges = useMemo(() => 
    interactionFeedback.nearbyInteractable.map(result => result.range),
    [interactionFeedback]
  );

  const canInteractWithAny = interactableRanges.length > 0;

  // Get interaction hints for UI
  const interactionHints = useMemo(() => 
    InteractionManager.getInteractionHints(playerGridPos, ranges),
    [playerGridPos, ranges]
  );

  // Handle space bar press for interaction
  const handleSpacePress = useCallback((event: KeyboardEvent) => {
    if (event.code !== 'Space' || isInDialogue) return;
    
    event.preventDefault();
    
    // Get the closest interactable range
    const closestRange = InteractionManager.getClosestInteractableRange(playerGridPos, ranges);
    
    if (closestRange) {
      setSelectedRange(closestRange);
      setInDialogue(true);
      
      // Trigger the range's interaction
      closestRange.onInteraction();
    }
  }, [playerGridPos, ranges, isInDialogue, setInDialogue]);

  const handleDialogueEnd = useCallback(() => {
    setSelectedRange(null);
    setInDialogue(false);
  }, [setInDialogue]);

  // Set up space bar event listener
  useEffect(() => {
    window.addEventListener('keydown', handleSpacePress);
    return () => {
      window.removeEventListener('keydown', handleSpacePress);
    };
  }, [handleSpacePress]);

  return {
    selectedRange,
    interactableRanges,
    nearbyRanges,
    interactionHints,
    handleDialogueEnd,
    canInteractWithAny
  };
};