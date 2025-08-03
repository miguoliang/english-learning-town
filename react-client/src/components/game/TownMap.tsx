import React from 'react';
import styled from 'styled-components';
import { Building } from './Building';
import { NPC } from './NPC';
import type { BuildingData } from './Building';
import type { NPCData } from './NPC';
import { Player } from './Player';
import { GridOverlay } from './GridOverlay';

const MapContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.townMap};
  transition: transform 0.1s ease;
`;

interface TownMapProps {
  playerPosition: { x: number; y: number };
  buildings: BuildingData[];
  npcs: NPCData[];
  onBuildingClick?: (building: BuildingData) => void;
  nearbyNPC?: NPCData | null;
  showGrid?: boolean;
}

export const TownMap: React.FC<TownMapProps> = ({
  playerPosition,
  buildings,
  npcs,
  onBuildingClick,
  nearbyNPC,
  showGrid = true
}) => {
  const cellSize = 40;
  const gridWidth = Math.floor(window.innerWidth / cellSize);
  const gridHeight = Math.floor(window.innerHeight / cellSize);

  // Convert buildings and NPCs to collision areas for grid visualization
  const collisionAreas = [
    ...buildings.map(building => ({
      id: building.id,
      position: {
        x: Math.floor(building.x / cellSize),
        y: Math.floor(building.y / cellSize)
      },
      size: building.gridSize || { width: 4, height: 3 },
      type: 'building' as const
    })),
    ...npcs.map(npc => ({
      id: npc.id,
      position: {
        x: Math.floor(npc.x / cellSize),
        y: Math.floor(npc.y / cellSize)
      },
      size: { width: 1, height: 1 },
      type: 'npc' as const
    }))
  ];

  return (
    <MapContainer>
      {/* Grid Overlay */}
      {showGrid && (
        <GridOverlay
          cellSize={cellSize}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          showCollisionAreas={true}
          collisionAreas={collisionAreas}
        />
      )}

      {/* Buildings */}
      {buildings.map(building => (
        <Building
          key={building.id}
          {...building}
          onClick={onBuildingClick}
        />
      ))}

      {/* NPCs */}
      {npcs.map(npc => (
        <NPC
          key={npc.id}
          {...npc}
          isNearby={nearbyNPC?.id === npc.id}
        />
      ))}

      {/* Player */}
      <Player position={playerPosition} />
    </MapContainer>
  );
};