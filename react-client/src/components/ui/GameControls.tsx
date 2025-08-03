import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 12px 20px;
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const QuestButton = styled(ActionButton)`
  background: ${({ theme }) => theme.gradients.secondary};
  
  &:hover {
    box-shadow: 0 6px 20px rgba(232, 67, 147, 0.4);
  }
`;

const MenuButton = styled(ActionButton)`
  background: linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
  }
`;

interface GameControlsProps {
  onReturnToMenu?: () => void;
  onOpenQuestLog?: () => void;
  currentQuestTitle?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onReturnToMenu,
  onOpenQuestLog,
  currentQuestTitle
}) => {
  return (
    <ControlsContainer>
      {onReturnToMenu && (
        <MenuButton onClick={onReturnToMenu}>
          📱 Menu
        </MenuButton>
      )}
      
      {onOpenQuestLog && (
        <>
          <QuestButton onClick={onOpenQuestLog}>
            📋 Quest Log
          </QuestButton>
          
          <ActionButton disabled={!currentQuestTitle}>
            🎯 {currentQuestTitle || 'No Active Quest'}
          </ActionButton>
        </>
      )}
    </ControlsContainer>
  );
};