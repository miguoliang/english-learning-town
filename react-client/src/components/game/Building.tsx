import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const BuildingSprite = styled(motion.div)<{ x: number; y: number; color: string }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 120px;
  height: 100px;
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
  onClick?: (building: BuildingData) => void;
}

export interface BuildingData {
  id: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  name: string;
}

export const Building: React.FC<BuildingProps> = ({
  id,
  x,
  y,
  color,
  icon,
  name,
  onClick
}) => {
  const buildingData: BuildingData = { id, x, y, color, icon, name };

  return (
    <BuildingSprite
      x={x}
      y={y}
      color={color}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(buildingData)}
    >
      {icon}
    </BuildingSprite>
  );
};