import React from 'react';
import styled from 'styled-components';

const NPCSprite = styled.div<{ x: number; y: number; isNearby: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 40px;
  height: 60px;
  background: #ffeaa7;
  border: 2px solid ${props => props.isNearby ? '#00b894' : '#2d3436'};
  border-radius: 20px 20px 5px 5px;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: ${props => props.isNearby 
    ? '0 0 20px rgba(0, 184, 148, 0.5), 0 3px 10px rgba(0, 0, 0, 0.2)'
    : '0 3px 10px rgba(0, 0, 0, 0.2)'
  };
  z-index: 10;
  transform: ${props => props.isNearby ? 'scale(1.1)' : 'scale(1)'};
  transition: all 0.3s ease;
  
  &::before {
    content: ${props => props.isNearby ? "'💬'" : "''"};
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
    opacity: ${props => props.isNearby ? 1 : 0};
    transition: opacity 0.3s;
    border: 1px solid #00b894;
  }
  
  &::after {
    content: ${props => props.isNearby ? "'Press SPACE to talk'" : "''"};
    position: absolute;
    top: -45px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    opacity: ${props => props.isNearby ? 1 : 0};
    transition: opacity 0.3s;
    pointer-events: none;
  }
`;

interface NPCProps {
  id: string;
  x: number;
  y: number;
  icon: string;
  name: string;
  isNearby?: boolean;
}

export interface NPCData {
  id: string;
  x: number;
  y: number;
  icon: string;
  name: string;
}

export const NPC: React.FC<NPCProps> = ({
  x,
  y,
  icon,
  name,
  isNearby = false
}) => {
  return (
    <NPCSprite
      x={x}
      y={y}
      isNearby={isNearby}
      title={name}
    >
      {icon}
    </NPCSprite>
  );
};