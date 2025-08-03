import React from 'react';
import styled from 'styled-components';

const PlayerSprite = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x - 20}px;  /* Center horizontally (40px / 2) */
  top: ${props => props.y - 20}px;   /* Center vertically (40px / 2) */
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary};
  border: 2px solid #0984e3;
  border-radius: 16px 16px 8px 8px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

interface PlayerProps {
  position: { x: number; y: number };
  icon?: string;
}

export const Player: React.FC<PlayerProps> = ({ 
  position, 
  icon = '🚶'
}) => {
  return (
    <PlayerSprite x={position.x} y={position.y}>
      {icon}
    </PlayerSprite>
  );
};