import React from 'react';
import styled from 'styled-components';
import { Range } from '../../types/ranges';
import { GridOverlay } from './GridOverlay';
import type { BuildingRange, BuildingEntrance } from '../../ranges/BuildingRange';

const MapContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.townMap};
  transition: transform 0.1s ease;
`;

interface RangeMapProps {
  ranges: Range[];
  showGrid?: boolean;
  onRangeClick?: (range: Range) => void;
  onEntranceInteract?: (building: BuildingRange, entrance: BuildingEntrance) => void;
  onMapClick?: (x: number, y: number) => void;
}

export const RangeMap: React.FC<RangeMapProps> = ({
  ranges,
  showGrid = true,
  onRangeClick,
  onEntranceInteract,
  onMapClick
}) => {
  const cellSize = 40;
  const gridWidth = Math.floor(window.innerWidth / cellSize);
  const gridHeight = Math.floor(window.innerHeight / cellSize);

  // Convert ranges to collision areas for grid visualization
  const collisionAreas = ranges.map(range => {
    const typeName = range.getTypeName();
    return {
      id: range.id,
      position: range.position,
      size: range.size,
      type: typeName === 'sprite' ? 'npc' : typeName as 'building' | 'npc' | 'obstacle'
    };
  });

  // Set up click handlers for ranges that support interaction
  React.useEffect(() => {
    ranges.forEach(range => {
      if (range.canInteract()) {
        // Set up click handler if range supports it
        if ('setClickHandler' in range && typeof range.setClickHandler === 'function' && onRangeClick) {
          (range as any).setClickHandler(() => onRangeClick(range));
        }
        if ('setInteractionHandler' in range && typeof range.setInteractionHandler === 'function' && onRangeClick) {
          (range as any).setInteractionHandler(() => onRangeClick(range));
        }
        // Set up entrance interaction handler for BuildingRange
        if (range.getTypeName() === 'building' && 'setEntranceInteractHandler' in range && onEntranceInteract) {
          (range as BuildingRange).setEntranceInteractHandler(onEntranceInteract);
        }
      }
    });
  }, [ranges, onRangeClick, onEntranceInteract]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onMapClick) {
      onMapClick(event.clientX, event.clientY);
    }
  };

  return (
    <MapContainer onClick={handleMapClick}>
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

      {/* Render all ranges using their polymorphic render method */}
      {ranges.map(range => (
        <React.Fragment key={range.id}>
          {range.render()}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};