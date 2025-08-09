import React from 'react';
import styled from 'styled-components';
import type { QuestData } from '../../types';

const Item = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isPrimary'].includes(prop),
})<{ isPrimary?: boolean }>` 
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

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Icon = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isPrimary'].includes(prop),
})<{ isPrimary?: boolean }>` 
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isPrimary ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50%;
`;

const Title = styled.h4.withConfig({
  shouldForwardProp: (prop) => !['isPrimary'].includes(prop),
})<{ isPrimary?: boolean }>` 
  color: ${props => props.isPrimary ? '#ffa500' : 'white'};
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
`;

const ProgressInfo = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isPrimary'].includes(prop),
})<{ isPrimary?: boolean }>` 
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isPrimary', 'progress'].includes(prop),
})<{ isPrimary?: boolean; progress: number }>` 
  height: 100%;
  background: ${props => props.isPrimary 
    ? 'linear-gradient(90deg, #ffa500, #ff8c00)'
    : 'linear-gradient(90deg, #4a90e2, #357abd)'
  };
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const CurrentObjective = styled.div`
  color: #ffa500;
  font-size: 11px;
  font-style: italic;
  margin-top: 4px;
`;

interface QuestItemProps {
  quest: QuestData;
  isPrimary: boolean;
  progress: number;
  completedCount: number;
  icon: string;
  currentObjectiveText: string;
  onClick: () => void;
}

export const QuestItem: React.FC<QuestItemProps> = ({
  quest,
  isPrimary,
  progress,
  completedCount,
  icon,
  currentObjectiveText,
  onClick,
}) => {
  return (
    <Item
      isPrimary={isPrimary}
      onClick={onClick}
    >
      <Header>
        <Icon isPrimary={isPrimary}>
          {icon}
        </Icon>
        <Title isPrimary={isPrimary}>
          {quest.title}
        </Title>
      </Header>

      <ProgressInfo>
        Objectives: {completedCount}/{quest.objectives.length}
        {quest.experienceReward > 0 && ` • ${quest.experienceReward} XP`}
      </ProgressInfo>

      <ProgressBar isPrimary={isPrimary}>
        <ProgressFill
          isPrimary={isPrimary}
          progress={progress}
        />
      </ProgressBar>

      {isPrimary && (
        <CurrentObjective>
          • {currentObjectiveText}
        </CurrentObjective>
      )}
    </Item>
  );
};