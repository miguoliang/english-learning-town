import { useState, useCallback } from 'react';
import type { BuildingData } from '../components/game/Building';

interface Position {
  x: number;
  y: number;
}

interface UsePlayerMovementReturn {
  playerPosition: Position;
  currentLocation: string;
  movePlayer: (x: number, y: number) => void;
  handleMapClick: (event: React.MouseEvent, mapRef: React.RefObject<HTMLDivElement | null>) => void;
}

export const usePlayerMovement = (buildings: BuildingData[]): UsePlayerMovementReturn => {
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 600, y: 400 });
  const [currentLocation, setCurrentLocation] = useState('Town Center');

  const updateLocation = useCallback((x: number, y: number) => {
    const building = buildings.find(b => 
      x >= b.x && x <= b.x + 120 && y >= b.y && y <= b.y + 100
    );
    
    if (building) {
      setCurrentLocation(building.name);
    } else {
      setCurrentLocation('Town Center');
    }
  }, [buildings]);

  const movePlayer = useCallback((x: number, y: number) => {
    setPlayerPosition({ x: x - 16, y: y - 24 });
    updateLocation(x, y);
  }, [updateLocation]);

  const handleMapClick = useCallback((event: React.MouseEvent, mapRef: React.RefObject<HTMLDivElement | null>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    movePlayer(x, y);
  }, [movePlayer]);

  return {
    playerPosition,
    currentLocation,
    movePlayer,
    handleMapClick
  };
};