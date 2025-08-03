// Quest Tracker Component - Shows active quests with progress

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useQuestStore } from '../../stores/questStore';
import type { QuestData } from '../../types';
import { QuestType } from '../../types';

const TrackerContainer = styled(motion.div)`
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

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const QuestList = styled(motion.div)`
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

const QuestItem = styled(motion.div)<{ isPrimary?: boolean }>`
  background: ${props => props.isPrimary 
    ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.1))'
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.isPrimary ? '#ffa500' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isPrimary 
      ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.3), rgba(255, 140, 0, 0.2))'
      : 'rgba(255, 255, 255, 0.1)'
    };
    transform: translateX(-2px);
  }
`;

const QuestHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const QuestIcon = styled.span<{ isPrimary?: boolean }>`
  font-size: 16px;
  color: ${props => props.isPrimary ? '#ffa500' : 'white'};
`;

const QuestTitle = styled.div<{ isPrimary?: boolean }>`
  color: ${props => props.isPrimary ? '#ffa500' : 'white'};
  font-weight: ${props => props.isPrimary ? '600' : '500'};
  font-size: ${props => props.isPrimary ? '14px' : '13px'};
  flex: 1;
  line-height: 1.3;
`;

const ProgressInfo = styled.div`
  font-size: 11px;
  color: #ccc;
  margin-bottom: 6px;
`;

const ProgressBar = styled.div<{ isPrimary?: boolean }>`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ isPrimary?: boolean }>`
  height: 100%;
  background: ${props => props.isPrimary 
    ? 'linear-gradient(90deg, #ffa500, #ff8c00)'
    : 'linear-gradient(90deg, #4a90e2, #357abd)'
  };
  border-radius: 2px;
`;

const CurrentObjective = styled.div`
  font-size: 11px;
  color: #87ceeb;
  margin-top: 6px;
  line-height: 1.3;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  padding: 20px;
  font-style: italic;
`;

const getQuestIcon = (questType: QuestType): string => {
  switch (questType) {
    case QuestType.CONVERSATION: return '💬';
    case QuestType.DELIVERY: return '📦';
    case QuestType.SHOPPING: return '🛒';
    case QuestType.EXPLORATION: return '🗺️';
    case QuestType.COLLECTION: return '📚';
    case QuestType.LEARNING: return '🎓';
    default: return '⭐';
  }
};

interface QuestTrackerProps {
  className?: string;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { 
    activeQuests, 
    currentActiveQuest, 
    setActiveQuest 
  } = useQuestStore();

  const handleQuestClick = (quest: QuestData) => {
    setActiveQuest(quest.id);
  };

  const calculateProgress = (quest: QuestData): number => {
    const completedObjectives = quest.objectives.filter(obj => obj.isCompleted).length;
    return (completedObjectives / quest.objectives.length) * 100;
  };

  const getCurrentObjectiveText = (quest: QuestData): string => {
    const currentObj = quest.objectives[quest.currentObjectiveIndex];
    return currentObj ? currentObj.description : 'Quest completed!';
  };

  // Show max 5 quests
  const displayQuests = activeQuests.slice(0, 5);

  return (
    <TrackerContainer
      className={className}
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Header>
        <Title>Active Quests ({activeQuests.length})</Title>
        <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '◄' : '►'}
        </ToggleButton>
      </Header>

      <AnimatePresence>
        {isExpanded && (
          <QuestList
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {displayQuests.length === 0 ? (
              <EmptyState>No active quests</EmptyState>
            ) : (
              displayQuests.map((quest) => {
                const isPrimary = currentActiveQuest?.id === quest.id;
                const progress = calculateProgress(quest);
                const completedCount = quest.objectives.filter(obj => obj.isCompleted).length;

                return (
                  <QuestItem
                    key={quest.id}
                    isPrimary={isPrimary}
                    onClick={() => handleQuestClick(quest)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <QuestHeader>
                      <QuestIcon isPrimary={isPrimary}>
                        {getQuestIcon(quest.questType)}
                      </QuestIcon>
                      <QuestTitle isPrimary={isPrimary}>
                        {quest.title}
                      </QuestTitle>
                    </QuestHeader>

                    <ProgressInfo>
                      Objectives: {completedCount}/{quest.objectives.length}
                      {quest.experienceReward > 0 && ` • ${quest.experienceReward} XP`}
                    </ProgressInfo>

                    <ProgressBar isPrimary={isPrimary}>
                      <ProgressFill
                        isPrimary={isPrimary}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </ProgressBar>

                    {isPrimary && (
                      <CurrentObjective>
                        • {getCurrentObjectiveText(quest)}
                      </CurrentObjective>
                    )}
                  </QuestItem>
                );
              })
            )}
          </QuestList>
        )}
      </AnimatePresence>
    </TrackerContainer>
  );
};

export default QuestTracker;