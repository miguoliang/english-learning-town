import React from 'react';
import styled from 'styled-components';
import { PlayerInfo } from './PlayerInfo';
import { GameControls } from './GameControls';

const HUDContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;
`;

const LocationLabel = styled.div`
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
`;

const MovementInstructions = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ArrowKey = styled.span`
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

interface GameHUDProps {
  currentLocation: string;
  onReturnToMenu: () => void;
  onOpenQuestLog: () => void;
  currentQuestTitle?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentLocation,
  onReturnToMenu,
  onOpenQuestLog,
  currentQuestTitle
}) => {
  return (
    <HUDContainer>
      <TopBar>
        <PlayerInfo />
        <GameControls onReturnToMenu={onReturnToMenu} />
      </TopBar>
      
      <BottomBar>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <LocationLabel>📍 {currentLocation}</LocationLabel>
          <MovementInstructions>
            Use <ArrowKey>↑</ArrowKey> <ArrowKey>↓</ArrowKey> <ArrowKey>←</ArrowKey> <ArrowKey>→</ArrowKey> to move • <ArrowKey>SPACE</ArrowKey> to talk
          </MovementInstructions>
        </div>
        <GameControls 
          onOpenQuestLog={onOpenQuestLog}
          currentQuestTitle={currentQuestTitle}
        />
      </BottomBar>
    </HUDContainer>
  );
};