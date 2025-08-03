import { useMemo, useEffect, useCallback } from 'react';
import { RangeGridSystem } from '../utils/rangeGridSystem';
import { Range } from '../types/ranges';
import type { GridPosition } from '../types/ranges';

interface UseRangeGridSystemProps {
  ranges: Range[];
  cellSize?: number;
}

interface UseRangeGridSystemReturn {
  gridSystem: RangeGridSystem;
  isWalkable: (screenX: number, screenY: number) => boolean;
  screenToGrid: (screenX: number, screenY: number) => GridPosition;
  gridToScreen: (gridX: number, gridY: number) => { x: number; y: number };
  snapToGrid: (screenX: number, screenY: number) => { x: number; y: number };
  updateRangePosition: (rangeId: string, newPosition: GridPosition) => void;
  getRangeAt: (gridX: number, gridY: number) => Range | null;
  getAllRanges: () => Range[];
  findValidPositions: (size: { width: number; height: number }) => GridPosition[];
}

export const useRangeGridSystem = ({ 
  ranges, 
  cellSize = 40 
}: UseRangeGridSystemProps): UseRangeGridSystemReturn => {
  const gridSystem = useMemo(() => {
    return new RangeGridSystem(window.innerWidth, window.innerHeight, cellSize);
  }, [cellSize]);

  // Update grid system when ranges change
  useEffect(() => {
    // Clear existing ranges
    gridSystem.clearAllRanges();

    // Add all ranges to the grid system
    ranges.forEach(range => {
      gridSystem.addRange(range);
    });
  }, [ranges, gridSystem]);

  const isWalkable = useCallback((screenX: number, screenY: number): boolean => {
    const gridPos = gridSystem.screenToGrid(screenX, screenY);
    return gridSystem.isWalkable(gridPos.x, gridPos.y);
  }, [gridSystem]);

  const screenToGrid = useCallback((screenX: number, screenY: number) => {
    return gridSystem.screenToGrid(screenX, screenY);
  }, [gridSystem]);

  const gridToScreen = useCallback((gridX: number, gridY: number) => {
    return gridSystem.gridToScreen(gridX, gridY);
  }, [gridSystem]);

  const snapToGrid = useCallback((screenX: number, screenY: number) => {
    const gridPos = gridSystem.screenToGrid(screenX, screenY);
    return gridSystem.gridToScreenCenter(gridPos.x, gridPos.y);
  }, [gridSystem]);

  const updateRangePosition = useCallback((rangeId: string, newPosition: GridPosition) => {
    gridSystem.updateRangePosition(rangeId, newPosition);
  }, [gridSystem]);

  const getRangeAt = useCallback((gridX: number, gridY: number) => {
    return gridSystem.getRangeAt(gridX, gridY);
  }, [gridSystem]);

  const getAllRanges = useCallback(() => {
    return gridSystem.getAllRanges();
  }, [gridSystem]);

  const findValidPositions = useCallback((size: { width: number; height: number }) => {
    return gridSystem.findValidPositions(size, true);
  }, [gridSystem]);

  return {
    gridSystem,
    isWalkable,
    screenToGrid,
    gridToScreen,
    snapToGrid,
    updateRangePosition,
    getRangeAt,
    getAllRanges,
    findValidPositions
  };
};