import React from 'react';
import styled from 'styled-components';
import { Building } from './Building';
import { NPC } from './NPC';
import type { BuildingData } from './Building';
import type { NPCData } from './NPC';
import { Player } from './Player';

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
}

export const TownMap: React.FC<TownMapProps> = ({
  playerPosition,
  buildings,
  npcs,
  onBuildingClick,
  nearbyNPC
}) => {
  return (
    <MapContainer>
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