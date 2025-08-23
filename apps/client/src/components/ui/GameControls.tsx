import React from "react";
import styled from "styled-components";

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

const QuestToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["isActive"].includes(prop),
})<{ isActive: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${(props) =>
    props.isActive
      ? "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)"
      : "linear-gradient(135deg, #636e72 0%, #2d3436 100%)"};
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) =>
      props.isActive
        ? "0 6px 20px rgba(74, 144, 226, 0.4)"
        : "0 6px 20px rgba(0, 0, 0, 0.3)"};
  }
`;

interface GameControlsProps {
  onReturnToMenu?: () => void;
  onOpenQuestLog?: () => void;
  onToggleQuestTracker?: () => void;
  isQuestTrackerVisible?: boolean;
  currentQuestTitle?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onReturnToMenu,
  onOpenQuestLog,
  onToggleQuestTracker,
  isQuestTrackerVisible = false,
  currentQuestTitle,
}) => {
  return (
    <ControlsContainer>
      {onToggleQuestTracker && (
        <QuestToggleButton
          isActive={isQuestTrackerVisible}
          onClick={onToggleQuestTracker}
          title={
            isQuestTrackerVisible ? "Hide Quest Tracker" : "Show Quest Tracker"
          }
        >
          📋
        </QuestToggleButton>
      )}

      {onReturnToMenu && (
        <MenuButton onClick={onReturnToMenu}>📱 Menu</MenuButton>
      )}

      {onOpenQuestLog && (
        <>
          <QuestButton onClick={onOpenQuestLog}>📋 Quest Log</QuestButton>

          <ActionButton disabled={!currentQuestTitle}>
            🎯 {currentQuestTitle || "No Active Quest"}
          </ActionButton>
        </>
      )}
    </ControlsContainer>
  );
};
