import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NPCSprite = styled(motion.div)<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 40px;
  height: 60px;
  background: #ffeaa7;
  border: 2px solid #2d3436;
  border-radius: 20px 20px 5px 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '💬';
    position: absolute;
    top: -25px;
    right: -10px;
    background: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

interface NPCProps {
  id: string;
  x: number;
  y: number;
  icon: string;
  name: string;
  onClick?: (npc: NPCData) => void;
}

export interface NPCData {
  id: string;
  x: number;
  y: number;
  icon: string;
  name: string;
}

export const NPC: React.FC<NPCProps> = ({
  id,
  x,
  y,
  icon,
  name,
  onClick
}) => {
  const npcData: NPCData = { id, x, y, icon, name };

  return (
    <NPCSprite
      x={x}
      y={y}
      onClick={() => onClick?.(npcData)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </NPCSprite>
  );
};