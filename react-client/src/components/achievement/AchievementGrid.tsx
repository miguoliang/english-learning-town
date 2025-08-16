import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { Achievement, AchievementType, AchievementRarity } from '../../types';
import { AchievementType as AchievementTypeEnum, AchievementRarity as AchievementRarityEnum } from '../../types';
import { AchievementBadge } from './AchievementBadge';

const GridContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const GridHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const GridTitle = styled.h2`
  font-family: 'Comic Neue', 'Fredoka One', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const GridSubtitle = styled.p`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
`;

const ProgressSummary = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const ProgressItem = styled.div`
  text-align: center;
  padding: 15px 25px;
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.fun};
  min-width: 120px;
`;

const ProgressNumber = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.surface};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const ProgressLabel = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  opacity: 0.9;
  margin-top: 5px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.isActive 
    ? `
      background: ${props.theme.gradients.primary};
      color: ${props.theme.colors.surface};
      box-shadow: ${props.theme.shadows.fun};
      transform: translateY(-2px);
    `
    : `
      background: ${props.theme.colors.surface};
      color: ${props.theme.colors.text};
      border: 2px solid ${props.theme.colors.textSecondary};
      
      &:hover {
        background: ${props.theme.colors.background};
        transform: translateY(-1px);
      }
    `
  }
`;

const AchievementSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h3`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: 2px;
    max-width: 100px;
  }
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 25px;
  justify-items: center;
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyEmoji = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const EmptyText = styled.p`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const EmptyHint = styled.p`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1rem;
  opacity: 0.8;
`;

interface AchievementGridProps {
  achievements: Achievement[];
  unlockedAchievements: string[];
  onAchievementClick?: (achievement: Achievement) => void;
}

type FilterType = 'all' | AchievementType | AchievementRarity;

const getTypeLabel = (type: AchievementType): string => {
  switch (type) {
    case AchievementTypeEnum.VOCABULARY: return '📚 Vocabulary';
    case AchievementTypeEnum.QUEST: return '🗺️ Quests';
    case AchievementTypeEnum.CONVERSATION: return '💬 Conversations';
    case AchievementTypeEnum.STREAK: return '🔥 Streaks';
    case AchievementTypeEnum.EXPLORATION: return '🗺️ Exploration';
    case AchievementTypeEnum.LEARNING: return '🎓 Learning';
    case AchievementTypeEnum.SOCIAL: return '👥 Social';
    case AchievementTypeEnum.MILESTONE: return '🌟 Milestones';
    default: return type;
  }
};

const getRarityLabel = (rarity: AchievementRarity): string => {
  switch (rarity) {
    case AchievementRarityEnum.COMMON: return '● Common';
    case AchievementRarityEnum.UNCOMMON: return '◆ Uncommon';
    case AchievementRarityEnum.RARE: return '★ Rare';
    case AchievementRarityEnum.EPIC: return '♦ Epic';
    case AchievementRarityEnum.LEGENDARY: return '♛ Legendary';
    default: return rarity;
  }
};

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  unlockedAchievements,
  onAchievementClick
}) => {
  const [currentFilter, setCurrentFilter] = React.useState<FilterType>('all');
  
  const progressStats = useMemo(() => {
    const total = achievements.length;
    const unlocked = unlockedAchievements.length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    
    const rarityStats = achievements.reduce((acc, achievement) => {
      const isUnlocked = unlockedAchievements.includes(achievement.id);
      if (!acc[achievement.rarity]) {
        acc[achievement.rarity] = { total: 0, unlocked: 0 };
      }
      acc[achievement.rarity].total++;
      if (isUnlocked) {
        acc[achievement.rarity].unlocked++;
      }
      return acc;
    }, {} as Record<AchievementRarity, { total: number; unlocked: number }>);
    
    return { total, unlocked, percentage, rarityStats };
  }, [achievements, unlockedAchievements]);
  
  const filteredAchievements = useMemo(() => {
    if (currentFilter === 'all') return achievements;
    
    // Check if it's a type filter
    if (Object.values(AchievementTypeEnum).includes(currentFilter as AchievementType)) {
      return achievements.filter(a => a.type === currentFilter);
    }
    
    // Check if it's a rarity filter  
    if (Object.values(AchievementRarityEnum).includes(currentFilter as AchievementRarity)) {
      return achievements.filter(a => a.rarity === currentFilter);
    }
    
    return achievements;
  }, [achievements, currentFilter]);
  
  const achievementsByType = useMemo(() => {
    const grouped = filteredAchievements.reduce((acc, achievement) => {
      if (!acc[achievement.type]) {
        acc[achievement.type] = [];
      }
      acc[achievement.type].push(achievement);
      return acc;
    }, {} as Record<AchievementType, Achievement[]>);
    
    // Sort by rarity within each type
    Object.keys(grouped).forEach(type => {
      grouped[type as AchievementType].sort((a, b) => {
        const rarityOrder = [
          AchievementRarityEnum.COMMON,
          AchievementRarityEnum.UNCOMMON,
          AchievementRarityEnum.RARE,
          AchievementRarityEnum.EPIC,
          AchievementRarityEnum.LEGENDARY
        ];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      });
    });
    
    return grouped;
  }, [filteredAchievements]);
  
  const handleAchievementClick = (achievement: Achievement) => {
    if (onAchievementClick) {
      onAchievementClick(achievement);
    }
  };
  
  if (achievements.length === 0) {
    return (
      <GridContainer>
        <EmptyState>
          <EmptyEmoji>🏆</EmptyEmoji>
          <EmptyText>No achievements yet!</EmptyText>
          <EmptyHint>Start your English learning adventure to unlock achievements!</EmptyHint>
        </EmptyState>
      </GridContainer>
    );
  }
  
  return (
    <GridContainer>
      <GridHeader>
        <GridTitle>🏆 Achievement Collection 🏆</GridTitle>
        <GridSubtitle>Collect badges as you learn and explore!</GridSubtitle>
      </GridHeader>
      
      <ProgressSummary>
        <ProgressItem>
          <ProgressNumber>{progressStats.unlocked}</ProgressNumber>
          <ProgressLabel>Unlocked</ProgressLabel>
        </ProgressItem>
        <ProgressItem>
          <ProgressNumber>{progressStats.total}</ProgressNumber>
          <ProgressLabel>Total</ProgressLabel>
        </ProgressItem>
        <ProgressItem>
          <ProgressNumber>{progressStats.percentage}%</ProgressNumber>
          <ProgressLabel>Complete</ProgressLabel>
        </ProgressItem>
      </ProgressSummary>
      
      <FilterContainer>
        <FilterButton 
          isActive={currentFilter === 'all'}
          onClick={() => setCurrentFilter('all')}
        >
          🌟 All
        </FilterButton>
        
        {Object.values(AchievementTypeEnum).map(type => (
          <FilterButton
            key={type}
            isActive={currentFilter === type}
            onClick={() => setCurrentFilter(type)}
          >
            {getTypeLabel(type)}
          </FilterButton>
        ))}
        
        {Object.values(AchievementRarityEnum).map(rarity => (
          <FilterButton
            key={rarity}
            isActive={currentFilter === rarity}
            onClick={() => setCurrentFilter(rarity)}
          >
            {getRarityLabel(rarity)}
          </FilterButton>
        ))}
      </FilterContainer>
      
      {Object.entries(achievementsByType).map(([type, typeAchievements]) => (
        <AchievementSection key={type}>
          <SectionTitle>
            {getTypeLabel(type as AchievementType)}
          </SectionTitle>
          <BadgeGrid>
            {typeAchievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={unlockedAchievements.includes(achievement.id)}
                onClick={() => handleAchievementClick(achievement)}
              />
            ))}
          </BadgeGrid>
        </AchievementSection>
      ))}
      
      {filteredAchievements.length === 0 && currentFilter !== 'all' && (
        <EmptyState>
          <EmptyEmoji>🔍</EmptyEmoji>
          <EmptyText>No achievements found</EmptyText>
          <EmptyHint>Try a different filter to see more achievements!</EmptyHint>
        </EmptyState>
      )}
    </GridContainer>
  );
};