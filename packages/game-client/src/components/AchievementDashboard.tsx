/**
 * Achievement Dashboard Component
 * Displays educational progress achievements and milestones
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, AnimatedEmoji } from "@elt/ui";
import {
  AchievementEngine,
  AchievementCategory,
  AchievementRarity,
  type EducationalAchievement,
} from "@elt/learning-analytics";
import type { VocabularyCard, ReviewSession } from "@elt/learning-algorithms";

const DashboardContainer = styled.div`
  background: ${({ theme }) => theme.gradients.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 1000px;
  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const DashboardTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const StatsSection = styled.div`
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.surface};
  text-align: center;
`;

const StatsTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.9;
`;

const FilterSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
  justify-content: center;
`;

const FilterButton = styled(Button)<{ isActive: boolean }>`
  background: ${(props) =>
    props.isActive ? props.theme.colors.accent : props.theme.colors.surface};
  color: ${(props) =>
    props.isActive ? props.theme.colors.surface : props.theme.colors.text};
  border: 2px solid
    ${(props) =>
      props.isActive
        ? props.theme.colors.accent
        : props.theme.colors.surfaceLight};
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const AchievementCard = styled.div<{
  rarity: AchievementRarity;
  isUnlocked: boolean;
}>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 2px solid
    ${(props) => {
      if (!props.isUnlocked) return props.theme.colors.surfaceLight;
      switch (props.rarity) {
        case "LEGENDARY":
          return "#FFD700";
        case "EPIC":
          return "#9B59B6";
        case "RARE":
          return "#3498DB";
        case "UNCOMMON":
          return "#27AE60";
        case "COMMON":
          return "#95A5A6";
        default:
          return props.theme.colors.surfaceLight;
      }
    }};
  opacity: ${(props) => (props.isUnlocked ? 1 : 0.6)};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => {
      if (!props.isUnlocked) return "transparent";
      switch (props.rarity) {
        case "LEGENDARY":
          return "linear-gradient(90deg, #FFD700, #FFA500)";
        case "EPIC":
          return "linear-gradient(90deg, #9B59B6, #8E44AD)";
        case "RARE":
          return "linear-gradient(90deg, #3498DB, #2980B9)";
        case "UNCOMMON":
          return "linear-gradient(90deg, #27AE60, #229954)";
        case "COMMON":
          return "linear-gradient(90deg, #95A5A6, #7F8C8D)";
        default:
          return "transparent";
      }
    }};
  }

  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const AchievementHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const AchievementIcon = styled.div<{ isUnlocked: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  filter: ${(props) => (props.isUnlocked ? "none" : "grayscale(100%)")};
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const AchievementRarityBadge = styled.span<{ rarity: AchievementRarity }>`
  background: ${(props) => {
    switch (props.rarity) {
      case "LEGENDARY":
        return "#FFD700";
      case "EPIC":
        return "#9B59B6";
      case "RARE":
        return "#3498DB";
      case "UNCOMMON":
        return "#27AE60";
      case "COMMON":
        return "#95A5A6";
      default:
        return props.theme.colors.textSecondary;
    }
  }};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AchievementDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacing[2]} 0;
  line-height: 1.4;
`;

const ProgressSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ProgressText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const XPReward = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ProgressBar = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{
  progress: number;
  rarity: AchievementRarity;
}>`
  background: ${(props) => {
    switch (props.rarity) {
      case "LEGENDARY":
        return "linear-gradient(90deg, #FFD700, #FFA500)";
      case "EPIC":
        return "linear-gradient(90deg, #9B59B6, #8E44AD)";
      case "RARE":
        return "linear-gradient(90deg, #3498DB, #2980B9)";
      case "UNCOMMON":
        return "linear-gradient(90deg, #27AE60, #229954)";
      case "COMMON":
        return "linear-gradient(90deg, #95A5A6, #7F8C8D)";
      default:
        return props.theme.colors.accent;
    }
  }};
  height: 100%;
  width: ${(props) => Math.min(props.progress, 100)}%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
`;

const UnlockedBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface AchievementDashboardProps {
  vocabularyCards: VocabularyCard[];
  reviewSessions: ReviewSession[];
  onClose: () => void;
}

type FilterType = "all" | AchievementCategory | AchievementRarity;

export const AchievementDashboard: React.FC<AchievementDashboardProps> = ({
  vocabularyCards,
  reviewSessions,
  onClose,
}) => {
  const [achievements, setAchievements] = useState<EducationalAchievement[]>(
    [],
  );
  const [filter, setFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const defaultAchievements = AchievementEngine.getDefaultAchievements();
    const updatedAchievements = AchievementEngine.calculateProgress(
      defaultAchievements,
      vocabularyCards,
      reviewSessions,
    );
    const achievementStats =
      AchievementEngine.getStatistics(updatedAchievements);

    setAchievements(updatedAchievements);
    setStats(achievementStats);
  }, [vocabularyCards, reviewSessions]);

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "all") return true;
    if (
      Object.values(AchievementCategory).includes(filter as AchievementCategory)
    ) {
      return achievement.category === filter;
    }
    if (
      Object.values(AchievementRarity).includes(filter as AchievementRarity)
    ) {
      return achievement.rarity === filter;
    }
    return true;
  });

  const getRarityIcon = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case AchievementRarity.LEGENDARY:
        return "👑";
      case AchievementRarity.EPIC:
        return "💫";
      case AchievementRarity.RARE:
        return "⭐";
      case AchievementRarity.UNCOMMON:
        return "🌟";
      case AchievementRarity.COMMON:
        return "✨";
      default:
        return "🏆";
    }
  };

  if (!stats) {
    return (
      <DashboardContainer>
        <DashboardTitle>
          <AnimatedEmoji emoji="🏆" mood="floating" />
          Loading Achievements...
        </DashboardTitle>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>
          <AnimatedEmoji emoji="🏆" mood="excited" />
          Achievements
          <AnimatedEmoji emoji="🌟" mood="floating" />
        </DashboardTitle>
        <Button variant="ghost" onClick={onClose}>
          ← Back to Dashboard
        </Button>
      </DashboardHeader>

      <StatsSection>
        <StatsTitle>
          <AnimatedEmoji emoji="📊" mood="happy" />
          Your Progress
        </StatsTitle>
        <StatsGrid>
          <StatItem>
            <StatValue>{stats.unlocked}</StatValue>
            <StatLabel>Unlocked</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.totalXP}</StatValue>
            <StatLabel>XP Earned</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.legendary}</StatValue>
            <StatLabel>Legendary</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.epic}</StatValue>
            <StatLabel>Epic</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.rare}</StatValue>
            <StatLabel>Rare</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>

      <FilterSection>
        <FilterButton
          variant="outline"
          isActive={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </FilterButton>

        {Object.values(AchievementCategory).map((category) => (
          <FilterButton
            key={category}
            variant="outline"
            isActive={filter === category}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0) + category.slice(1).toLowerCase()}
          </FilterButton>
        ))}

        {Object.values(AchievementRarity).map((rarity) => (
          <FilterButton
            key={rarity}
            variant="outline"
            isActive={filter === rarity}
            onClick={() => setFilter(rarity)}
          >
            {getRarityIcon(rarity)}{" "}
            {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
          </FilterButton>
        ))}
      </FilterSection>

      <AchievementsGrid>
        {filteredAchievements.map((achievement) => {
          const progressPercentage =
            (achievement.currentProgress / achievement.targetProgress) * 100;

          return (
            <AchievementCard
              key={achievement.id}
              rarity={achievement.rarity}
              isUnlocked={achievement.isUnlocked}
            >
              {achievement.isUnlocked && (
                <UnlockedBadge>
                  <AnimatedEmoji emoji="✅" mood="excited" />
                  Unlocked
                </UnlockedBadge>
              )}

              <AchievementHeader>
                <AchievementIcon isUnlocked={achievement.isUnlocked}>
                  {achievement.icon}
                </AchievementIcon>
                <AchievementInfo>
                  <AchievementTitle>{achievement.title}</AchievementTitle>
                  <AchievementRarityBadge rarity={achievement.rarity}>
                    {achievement.rarity}
                  </AchievementRarityBadge>
                </AchievementInfo>
              </AchievementHeader>

              <AchievementDescription>
                {achievement.description}
              </AchievementDescription>

              <ProgressSection>
                <ProgressHeader>
                  <ProgressText>
                    {achievement.currentProgress} / {achievement.targetProgress}
                  </ProgressText>
                  <XPReward>
                    <AnimatedEmoji emoji="⭐" mood="floating" />
                    {achievement.xpReward} XP
                  </XPReward>
                </ProgressHeader>
                <ProgressBar>
                  <ProgressFill
                    progress={progressPercentage}
                    rarity={achievement.rarity}
                  />
                </ProgressBar>
              </ProgressSection>
            </AchievementCard>
          );
        })}
      </AchievementsGrid>
    </DashboardContainer>
  );
};
