import React from 'react';
import styled from 'styled-components';
import { AnimatedEmoji } from '../ui/AnimatedEmoji';
import type { PlayerProgress } from '../../types';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: 20px;
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadows.fun};
  border: 2px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const StatTitle = styled.h3`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.surface};
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const StatValue = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #FFD700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
`;

const StatDescription = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const SkillCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
`;

const SkillName = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  margin-bottom: 8px;
  text-transform: capitalize;
`;

const SkillLevel = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #FFD700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const SkillStars = styled.div`
  margin-top: 5px;
  font-size: 0.8rem;
`;

const StreakCard = styled(StatCard)<{ isActive: boolean }>`
  ${props => props.isActive && `
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  `}
`;

const AchievementProgress = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

const ProgressRing = styled.div<{ progress: number }>`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    #FFD700 0deg,
    #FFD700 ${props => props.progress * 3.6}deg,
    rgba(255, 255, 255, 0.2) ${props => props.progress * 3.6}deg,
    rgba(255, 255, 255, 0.2) 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const ProgressText = styled.div`
  position: relative;
  z-index: 1;
  font-family: 'Comic Neue', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.surface};
`;

interface GameStatsProps {
  progress: PlayerProgress;
  achievementCount: {
    unlocked: number;
    total: number;
  };
  level: number;
}

const getSkillEmoji = (skill: string): string => {
  const emojiMap: Record<string, string> = {
    vocabulary: '📚',
    grammar: '📝',
    speaking: '🗣️',
    listening: '👂',
    reading: '📖',
    writing: '✏️',
    pronunciation: '🔊'
  };
  return emojiMap[skill] || '📚';
};

const getSkillStars = (level: number): string => {
  const stars = Math.min(Math.floor(level / 2), 5);
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak!';
  if (streak === 1) return 'Great start!';
  if (streak < 7) return 'Keep it up!';
  if (streak < 14) return 'Amazing streak!';
  if (streak < 30) return 'Incredible dedication!';
  return 'Legendary streaker!';
};

export const GameStats: React.FC<GameStatsProps> = ({
  progress,
  achievementCount
}) => {
  const achievementProgress = achievementCount.total > 0 
    ? (achievementCount.unlocked / achievementCount.total) * 100 
    : 0;
  
  const hasActiveStreak = progress.currentStreak > 0;
  
  return (
    <StatsContainer>
      {/* Total XP */}
      <StatCard>
        <StatIcon>
          <AnimatedEmoji emoji="⭐" mood="floating" size="2.5rem" />
        </StatIcon>
        <StatTitle>Total Experience</StatTitle>
        <StatValue>{formatNumber(progress.totalXP)}</StatValue>
        <StatDescription>XP earned from learning!</StatDescription>
      </StatCard>
      
      {/* Vocabulary Learned */}
      <StatCard>
        <StatIcon>
          <AnimatedEmoji emoji="📚" mood="happy" size="2.5rem" />
        </StatIcon>
        <StatTitle>Words Learned</StatTitle>
        <StatValue>{progress.vocabularyLearned}</StatValue>
        <StatDescription>English words mastered!</StatDescription>
      </StatCard>
      
      {/* Quests Completed */}
      <StatCard>
        <StatIcon>
          <AnimatedEmoji emoji="🗺️" mood="excited" size="2.5rem" />
        </StatIcon>
        <StatTitle>Adventures</StatTitle>
        <StatValue>{progress.questsCompleted}</StatValue>
        <StatDescription>Quests completed!</StatDescription>
      </StatCard>
      
      {/* Conversations */}
      <StatCard>
        <StatIcon>
          <AnimatedEmoji emoji="💬" mood="happy" size="2.5rem" />
        </StatIcon>
        <StatTitle>Conversations</StatTitle>
        <StatValue>{progress.dialoguesCompleted}</StatValue>
        <StatDescription>Chats with friends!</StatDescription>
      </StatCard>
      
      {/* Daily Streak */}
      <StreakCard isActive={hasActiveStreak}>
        <StatIcon>
          <AnimatedEmoji 
            emoji={hasActiveStreak ? "🔥" : "📅"} 
            mood={hasActiveStreak ? "excited" : "normal"} 
            size="2.5rem" 
          />
        </StatIcon>
        <StatTitle>Daily Streak</StatTitle>
        <StatValue>{progress.currentStreak}</StatValue>
        <StatDescription>{getStreakMessage(progress.currentStreak)}</StatDescription>
      </StreakCard>
      
      {/* Achievement Progress */}
      <StatCard>
        <StatIcon>
          <AnimatedEmoji emoji="🏆" mood="floating" size="2.5rem" />
        </StatIcon>
        <StatTitle>Achievements</StatTitle>
        <StatValue>{achievementCount.unlocked}/{achievementCount.total}</StatValue>
        <StatDescription>Badges collected!</StatDescription>
        <AchievementProgress>
          <ProgressRing progress={achievementProgress}>
            <ProgressText>{Math.round(achievementProgress)}%</ProgressText>
          </ProgressRing>
        </AchievementProgress>
      </StatCard>
      
      {/* Skills Overview */}
      <StatCard style={{ gridColumn: 'span 2' }}>
        <StatIcon>
          <AnimatedEmoji emoji="🎓" mood="floating" size="2.5rem" />
        </StatIcon>
        <StatTitle>English Skills</StatTitle>
        <StatDescription>Your progress in different areas</StatDescription>
        <SkillsGrid>
          {Object.entries(progress.skillLevels).map(([skill, skillLevel]) => (
            <SkillCard key={skill}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                {getSkillEmoji(skill)}
              </div>
              <SkillName>{skill}</SkillName>
              <SkillLevel>Level {skillLevel}</SkillLevel>
              <SkillStars>{getSkillStars(skillLevel)}</SkillStars>
            </SkillCard>
          ))}
        </SkillsGrid>
      </StatCard>
    </StatsContainer>
  );
};