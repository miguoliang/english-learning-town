import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { Building } from './Building';
import { NPC } from './NPC';
import type { BuildingData } from './Building';
import type { NPCData } from './NPC';
import { Player } from './Player';

const MapContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1200px;
  height: 800px;
  background: ${({ theme }) => theme.gradients.townMap};
  border-radius: 20px;
  border: 3px solid #2d3436;
  box-shadow: ${({ theme }) => theme.shadows.large};
  transition: transform 0.1s ease;
`;

interface TownMapProps {
  playerPosition: { x: number; y: number };
  buildings: BuildingData[];
  npcs: NPCData[];
  onMapClick: (event: React.MouseEvent) => void;
  onBuildingClick?: (building: BuildingData) => void;
  onNPCClick?: (npc: NPCData) => void;
}

export const TownMap = forwardRef<HTMLDivElement, TownMapProps>(({
  playerPosition,
  buildings,
  npcs,
  onMapClick,
  onBuildingClick,
  onNPCClick
}, ref) => {
  return (
    <MapContainer ref={ref} onClick={onMapClick}>
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
          onClick={onNPCClick}
        />
      ))}

      {/* Player */}
      <Player position={playerPosition} />
    </MapContainer>
  );
});