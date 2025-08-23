// Quest Log Modal - Full quest management interface

import React, { useState } from "react";
import styled from "styled-components";
import { useQuestStore } from "../../stores/questStore";
import type { QuestData } from "../../types";
import { QuestType, QuestStatus } from "../../types";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4a90e2;
  border-radius: 16px;
  width: 90vw;
  max-width: 900px;
  height: 80vh;
  max-height: 600px;
  display: flex;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  background: rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  color: #4a90e2;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const QuestList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a90e2;
    border-radius: 3px;
  }
`;

const QuestListItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isSelected", "status"].includes(prop),
})<{ isSelected?: boolean; status?: QuestStatus }>`
  background: ${(props) => {
    if (props.status === QuestStatus.COMPLETED) return "rgba(34, 139, 34, 0.2)";
    if (props.isSelected) return "rgba(74, 144, 226, 0.3)";
    return "rgba(255, 255, 255, 0.05)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.status === QuestStatus.COMPLETED) return "#228b22";
      if (props.isSelected) return "#4a90e2";
      return "rgba(255, 255, 255, 0.1)";
    }};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.status === QuestStatus.COMPLETED
        ? "rgba(34, 139, 34, 0.3)"
        : "rgba(74, 144, 226, 0.2)"};
  }
`;

const QuestItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const QuestIcon = styled.span.withConfig({
  shouldForwardProp: (prop) => !["status"].includes(prop),
})<{ status?: QuestStatus }>`
  font-size: 14px;
  color: ${(props) => {
    if (props.status === QuestStatus.COMPLETED) return "#90EE90";
    return "white";
  }};
`;

const QuestItemTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => !["status"].includes(prop),
})<{ status?: QuestStatus }>`
  color: ${(props) => {
    if (props.status === QuestStatus.COMPLETED) return "#90EE90";
    return "white";
  }};
  font-weight: 500;
  font-size: 13px;
  flex: 1;
  text-decoration: ${(props) =>
    props.status === QuestStatus.COMPLETED ? "line-through" : "none"};
`;

const QuestProgress = styled.div`
  font-size: 11px;
  color: #ccc;
  margin-bottom: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => !["progress", "status"].includes(prop),
})<{ progress: number; status?: QuestStatus }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background: ${(props) =>
    props.status === QuestStatus.COMPLETED
      ? "linear-gradient(90deg, #228b22, #32cd32)"
      : "linear-gradient(90deg, #4a90e2, #357abd)"};
  transition: width 0.3s ease;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
`;

const QuestDetailsHeader = styled.div`
  margin-bottom: 24px;
`;

const QuestTitle = styled.h2`
  color: white;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
`;

const QuestDescription = styled.p`
  color: #ccc;
  margin: 0 0 16px 0;
  line-height: 1.6;
  font-size: 14px;
`;

const QuestMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const MetaItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #ccc;
`;

const ObjectivesSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #4a90e2;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
`;

const ObjectiveItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isCompleted", "isCurrent"].includes(prop),
})<{ isCompleted?: boolean; isCurrent?: boolean }>`
  background: ${(props) => {
    if (props.isCompleted) return "rgba(34, 139, 34, 0.2)";
    if (props.isCurrent) return "rgba(255, 165, 0, 0.2)";
    return "rgba(255, 255, 255, 0.05)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.isCompleted) return "#228b22";
      if (props.isCurrent) return "#ffa500";
      return "rgba(255, 255, 255, 0.1)";
    }};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
`;

const ObjectiveHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ObjectiveStatus = styled.span.withConfig({
  shouldForwardProp: (prop) => !["isCompleted", "isCurrent"].includes(prop),
})<{ isCompleted?: boolean; isCurrent?: boolean }>`
  font-size: 16px;
  color: ${(props) => {
    if (props.isCompleted) return "#90EE90";
    if (props.isCurrent) return "#ffa500";
    return "#ccc";
  }};
`;

const ObjectiveText = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isCompleted"].includes(prop),
})<{ isCompleted?: boolean }>`
  color: ${(props) => (props.isCompleted ? "#90EE90" : "white")};
  font-weight: 500;
  text-decoration: ${(props) => (props.isCompleted ? "line-through" : "none")};
  flex: 1;
`;

const ObjectiveProgress = styled.div`
  font-size: 12px;
  color: #ccc;
`;

const HintText = styled.div`
  font-size: 12px;
  color: #87ceeb;
  font-style: italic;
  margin-top: 4px;
`;

const RewardsSection = styled.div``;

const RewardItem = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #ffd700;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  padding: 40px;
  font-style: italic;
`;

const getQuestIcon = (questType: QuestType): string => {
  switch (questType) {
    case QuestType.CONVERSATION:
      return "💬";
    case QuestType.DELIVERY:
      return "📦";
    case QuestType.SHOPPING:
      return "🛒";
    case QuestType.EXPLORATION:
      return "🗺️";
    case QuestType.COLLECTION:
      return "📚";
    case QuestType.LEARNING:
      return "🎓";
    default:
      return "⭐";
  }
};

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({ isOpen, onClose }) => {
  const [selectedQuest, setSelectedQuest] = useState<QuestData | null>(null);
  const { activeQuests, allQuests, completedQuests } = useQuestStore();

  // Combine active and completed quests for display
  const allDisplayQuests = [
    ...activeQuests,
    ...completedQuests.map((id) => allQuests[id]).filter(Boolean),
  ];

  const calculateProgress = (quest: QuestData): number => {
    const completedObjectives = quest.objectives.filter(
      (obj) => obj.isCompleted,
    ).length;
    return (completedObjectives / quest.objectives.length) * 100;
  };

  const handleQuestSelect = (quest: QuestData) => {
    setSelectedQuest(quest);
  };

  if (!selectedQuest && allDisplayQuests.length > 0) {
    setSelectedQuest(allDisplayQuests[0]);
  }

  return (
    <>
      {isOpen && (
        <Overlay onClick={onClose}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <Sidebar>
              <SidebarHeader>
                <Title>Quest Log</Title>
                <CloseButton onClick={onClose}>×</CloseButton>
              </SidebarHeader>

              <QuestList>
                {allDisplayQuests.length === 0 ? (
                  <EmptyState>No quests available</EmptyState>
                ) : (
                  allDisplayQuests.map((quest) => {
                    const progress = calculateProgress(quest);
                    const completedCount = quest.objectives.filter(
                      (obj) => obj.isCompleted,
                    ).length;

                    return (
                      <QuestListItem
                        key={quest.id}
                        isSelected={selectedQuest?.id === quest.id}
                        status={quest.status}
                        onClick={() => handleQuestSelect(quest)}
                      >
                        <QuestItemHeader>
                          <QuestIcon status={quest.status}>
                            {quest.status === QuestStatus.COMPLETED
                              ? "✓"
                              : getQuestIcon(quest.questType)}
                          </QuestIcon>
                          <QuestItemTitle status={quest.status}>
                            {quest.title}
                          </QuestItemTitle>
                        </QuestItemHeader>

                        <QuestProgress>
                          {completedCount}/{quest.objectives.length} objectives
                        </QuestProgress>

                        <ProgressBar>
                          <ProgressFill
                            progress={progress}
                            status={quest.status}
                          />
                        </ProgressBar>
                      </QuestListItem>
                    );
                  })
                )}
              </QuestList>
            </Sidebar>

            <MainContent>
              {selectedQuest ? (
                <>
                  <QuestDetailsHeader>
                    <QuestTitle>{selectedQuest.title}</QuestTitle>
                    <QuestDescription>
                      {selectedQuest.description}
                    </QuestDescription>

                    <QuestMeta>
                      <MetaItem>Type: {selectedQuest.questType}</MetaItem>
                      <MetaItem>
                        Category: {selectedQuest.learningCategory}
                      </MetaItem>
                      {selectedQuest.experienceReward > 0 && (
                        <MetaItem>
                          XP: {selectedQuest.experienceReward}
                        </MetaItem>
                      )}
                      {selectedQuest.moneyReward > 0 && (
                        <MetaItem>Money: ${selectedQuest.moneyReward}</MetaItem>
                      )}
                    </QuestMeta>
                  </QuestDetailsHeader>

                  <ObjectivesSection>
                    <SectionTitle>
                      Objectives (
                      {
                        selectedQuest.objectives.filter(
                          (obj) => obj.isCompleted,
                        ).length
                      }
                      /{selectedQuest.objectives.length})
                    </SectionTitle>

                    {selectedQuest.objectives.map((objective, index) => {
                      const isCurrent =
                        index === selectedQuest.currentObjectiveIndex;

                      return (
                        <ObjectiveItem
                          key={objective.id}
                          isCompleted={objective.isCompleted}
                          isCurrent={isCurrent && !objective.isCompleted}
                        >
                          <ObjectiveHeader>
                            <ObjectiveStatus
                              isCompleted={objective.isCompleted}
                              isCurrent={isCurrent && !objective.isCompleted}
                            >
                              {objective.isCompleted
                                ? "✓"
                                : isCurrent
                                  ? "►"
                                  : "○"}
                            </ObjectiveStatus>
                            <ObjectiveText isCompleted={objective.isCompleted}>
                              {objective.description}
                            </ObjectiveText>
                            {objective.targetCount > 1 && (
                              <ObjectiveProgress>
                                ({objective.currentCount}/
                                {objective.targetCount})
                              </ObjectiveProgress>
                            )}
                          </ObjectiveHeader>

                          {isCurrent && objective.hint && (
                            <HintText>💡 {objective.hint}</HintText>
                          )}
                        </ObjectiveItem>
                      );
                    })}
                  </ObjectivesSection>

                  <RewardsSection>
                    <SectionTitle>Rewards</SectionTitle>
                    {selectedQuest.experienceReward > 0 && (
                      <RewardItem>
                        📈 {selectedQuest.experienceReward} Experience
                      </RewardItem>
                    )}
                    {selectedQuest.moneyReward > 0 && (
                      <RewardItem>💰 ${selectedQuest.moneyReward}</RewardItem>
                    )}
                    {selectedQuest.newVocabulary.length > 0 && (
                      <RewardItem>
                        📚 Vocabulary: {selectedQuest.newVocabulary.join(", ")}
                      </RewardItem>
                    )}
                  </RewardsSection>
                </>
              ) : (
                <EmptyState>Select a quest to view details</EmptyState>
              )}
            </MainContent>
          </Modal>
        </Overlay>
      )}
    </>
  );
};

export default QuestLog;
