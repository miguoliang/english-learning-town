import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cellSize', 'gridWidth', 'gridHeight'].includes(prop),
})<{ cellSize: number; gridWidth: number; gridHeight: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  
  /* Create dashed grid lines using CSS background */
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: ${props => props.cellSize}px ${props => props.cellSize}px;
  
  /* Add dashed line effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(to right, transparent 0px, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px),
      linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px);
    background-size: ${props => props.cellSize}px ${props => props.cellSize}px;
    background-position: 0 0, 0 0;
  }
`;

const GridCellHighlight = styled.div.withConfig({
  shouldForwardProp: (prop) => !['x', 'y', 'cellSize', 'width', 'height', 'color'].includes(prop),
})<{ x: number; y: number; cellSize: number; width: number; height: number; color: string }>`
  position: absolute;
  left: ${props => props.x * props.cellSize}px;
  top: ${props => props.y * props.cellSize}px;
  width: ${props => props.width * props.cellSize}px;
  height: ${props => props.height * props.cellSize}px;
  border: 2px dashed ${props => props.color};
  background: ${props => props.color}20;
  pointer-events: none;
  z-index: 2;
`;

interface GridOverlayProps {
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  showCollisionAreas?: boolean;
  collisionAreas?: Array<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    type: 'building' | 'npc' | 'obstacle';
  }>;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  cellSize,
  gridWidth,
  gridHeight,
  showCollisionAreas = false,
  collisionAreas = []
}) => {
  const getCollisionAreaColor = (type: string): string => {
    switch (type) {
      case 'building': return '#e74c3c';
      case 'npc': return '#f39c12';
      case 'obstacle': return '#7f8c8d';
      default: return '#ffffff';
    }
  };

  return (
    <GridContainer 
      cellSize={cellSize} 
      gridWidth={gridWidth} 
      gridHeight={gridHeight}
    >
      {showCollisionAreas && collisionAreas.map(area => (
        <GridCellHighlight
          key={area.id}
          x={area.position.x}
          y={area.position.y}
          cellSize={cellSize}
          width={area.size.width}
          height={area.size.height}
          color={getCollisionAreaColor(area.type)}
        />
      ))}
    </GridContainer>
  );
};