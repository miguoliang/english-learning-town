import React from 'react';
import styled from 'styled-components';

const TrackerContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: ${({ theme }) => theme.zIndex.fixed};
  backdrop-filter: blur(5px);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 280px;
    top: 60px;
    right: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-family: ${({ theme }) => theme.fonts.heading};
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
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 2px;
  }
`;

const EmptyState = styled.div`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: ${({ theme }) => theme.spacing[5]};
  font-style: italic;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const QuestItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop),
})<{ isActive?: boolean }>`
  padding: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme, isActive }) => 
    isActive ? theme.gradients.accent : 'rgba(255, 255, 255, 0.05)'
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.accent
  };
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ theme }) => theme.gradients.secondary};
    transform: translateX(4px);
  }
`;

const QuestTitle = styled.h4`
  color: ${({ theme }) => theme.colors.surface};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const QuestProgress = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: rgba(255, 255, 255, 0.8);
  font-family: ${({ theme }) => theme.fonts.body};
`;

const ProgressBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['progress'].includes(prop),
})<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: ${({ theme }) => theme.spacing[1]};
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: ${({ theme }) => theme.gradients.success};
    border-radius: 2px;
    transition: width ${({ theme }) => theme.transitions.base};
  }
`;

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  isActive?: boolean;
}

export interface QuestTrackerProps {
  /** List of quests to display */
  quests: Quest[];
  /** Currently active quest ID */
  activeQuestId?: string;
  /** Click handler for quest selection */
  onQuestClick?: (questId: string) => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * QuestTracker - A fixed-position quest tracking component
 * 
 * Features:
 * - Fixed positioning on screen
 * - Scrollable quest list
 * - Progress indicators
 * - Active quest highlighting
 * - Click interactions
 * - Responsive design
 * - Themed styling
 */
export const QuestTracker: React.FC<QuestTrackerProps> = ({ 
  quests, 
  activeQuestId,
  onQuestClick,
  className 
}) => {
  if (!quests.length) {
    return (
      <TrackerContainer className={className}>
        <Header>
          <Title>📝 Quests</Title>
        </Header>
        <EmptyState>
          No active quests. Start exploring to find new adventures!
        </EmptyState>
      </TrackerContainer>
    );
  }

  return (
    <TrackerContainer className={className}>
      <Header>
        <Title>📝 Quests ({quests.length})</Title>
      </Header>
      
      <QuestList>
        {quests.map((quest) => {
          const isActive = quest.id === activeQuestId || quest.isActive;
          return (
            <QuestItem
              key={quest.id}
              {...(isActive !== undefined && { isActive })}
              onClick={() => onQuestClick?.(quest.id)}
            >
              <QuestTitle>{quest.title}</QuestTitle>
              <QuestProgress>
                {quest.progress} / {quest.maxProgress} completed
              </QuestProgress>
              <ProgressBar progress={(quest.progress / quest.maxProgress) * 100} />
            </QuestItem>
          );
        })}
      </QuestList>
    </TrackerContainer>
  );
};