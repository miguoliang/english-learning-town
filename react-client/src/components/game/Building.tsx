import React from 'react';
import styled from 'styled-components';

const BuildingSprite = styled.div<{ 
  x: number; 
  y: number; 
  color: string; 
  width: number; 
  height: number; 
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background: ${props => props.color};
  border: 2px solid #2d3436;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

interface BuildingProps {
  id: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  name: string;
  gridSize?: {
    width: number;
    height: number;
  };
  onClick?: (building: BuildingData) => void;
}

export interface BuildingData {
  id: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  name: string;
  gridSize?: {
    width: number;
    height: number;
  };
}

export const Building: React.FC<BuildingProps> = ({
  id,
  x,
  y,
  color,
  icon,
  name,
  gridSize,
  onClick
}) => {
  const buildingData: BuildingData = { id, x, y, color, icon, name, gridSize };
  
  // Calculate visual size based on grid size (40px per cell)
  const cellSize = 40;
  const actualGridSize = gridSize || { width: 4, height: 3 };
  const visualWidth = actualGridSize.width * cellSize;
  const visualHeight = actualGridSize.height * cellSize;

  return (
    <BuildingSprite
      x={x}
      y={y}
      color={color}
      width={visualWidth}
      height={visualHeight}
      onClick={() => onClick?.(buildingData)}
    >
      {icon}
    </BuildingSprite>
  );
};