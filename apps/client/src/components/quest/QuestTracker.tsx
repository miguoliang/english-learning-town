// Refactored Quest Tracker Component - Single Responsibility: Quest Display Management

import React from "react";
import styled from "styled-components";
import { useQuestDisplay } from "../../hooks/useQuestDisplay";
import { QuestItem } from "./QuestItem";

const TrackerContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #4a90e2;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h3`
  color: #4a90e2;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const QuestList = styled.div`
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a90e2;
    border-radius: 2px;
  }
`;

const EmptyState = styled.div`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 20px;
  font-style: italic;
`;

interface QuestTrackerProps {
  className?: string;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ className }) => {
  const {
    activeQuests,
    currentActiveQuest,
    displayQuests,
    handleQuestClick,
    calculateProgress,
    getCurrentObjectiveText,
    getQuestIcon,
  } = useQuestDisplay();

  return (
    <TrackerContainer className={className}>
      <Header>
        <Title>Active Quests ({activeQuests.length})</Title>
      </Header>

      <QuestList>
        {displayQuests.length === 0 ? (
          <EmptyState>No active quests</EmptyState>
        ) : (
          displayQuests.map((quest) => {
            const isPrimary = currentActiveQuest?.id === quest.id;
            const progress = calculateProgress(quest);
            const completedCount = quest.objectives.filter(
              (obj) => obj.isCompleted,
            ).length;

            return (
              <QuestItem
                key={quest.id}
                quest={quest}
                isPrimary={isPrimary}
                progress={progress}
                completedCount={completedCount}
                icon={getQuestIcon(quest.questType)}
                currentObjectiveText={getCurrentObjectiveText(quest)}
                onClick={() => handleQuestClick(quest)}
              />
            );
          })
        )}
      </QuestList>
    </TrackerContainer>
  );
};

export default QuestTracker;
