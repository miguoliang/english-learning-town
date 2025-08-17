/**
 * Motivation Dashboard Component
 * Displays gamification elements, rewards, and motivational features
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, AnimatedEmoji } from '@elt/ui';
import {
  MotivationEngine,
  MotivationStyle,
  EncouragementLevel,
  RewardRarity,
  type MotivationProfile,
  type Reward,
  type StreakBonus,
  type VocabularyCard,
  type ReviewSession,
  type EducationalAchievement,
  type LearningAnalytics,
  LearningAnalyticsEngine
} from '@elt/core';

const DashboardContainer = styled.div`
  background: ${({ theme }) => theme.gradients.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const DashboardTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const LevelSection = styled.div`
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.surface};
  text-align: center;
`;

const LevelInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LevelNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const XPInfo = styled.div`
  text-align: left;
`;

const XPLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const XPAmount = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const XPBar = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 12px;
  width: 100%;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const XPFill = styled.div<{ progress: number }>`
  background: ${({ theme }) => theme.colors.surface};
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
`;

const XPText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StreakSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const StreakHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const StreakTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StreakDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const StreakNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.error};
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
`;

const StreakLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StreakBonus = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.surface};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const RewardsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const RewardCard = styled.div<{ rarity: RewardRarity; isUnlocked: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 2px solid ${props => {
    if (!props.isUnlocked) return props.theme.colors.surfaceLight;
    switch (props.rarity) {
      case 'LEGENDARY': return '#FFD700';
      case 'EPIC': return '#9B59B6';
      case 'RARE': return '#3498DB';
      case 'UNCOMMON': return '#27AE60';
      case 'COMMON': return '#95A5A6';
      default: return props.theme.colors.surfaceLight;
    }
  }};
  opacity: ${props => props.isUnlocked ? 1 : 0.6};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const RewardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const RewardIcon = styled.div<{ isUnlocked: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  filter: ${props => props.isUnlocked ? 'none' : 'grayscale(100%)'};
`;

const RewardInfo = styled.div`
  flex: 1;
`;

const RewardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const RewardRarityBadge = styled.span<{ rarity: RewardRarity }>`
  background: ${props => {
    switch (props.rarity) {
      case 'LEGENDARY': return '#FFD700';
      case 'EPIC': return '#9B59B6';
      case 'RARE': return '#3498DB';
      case 'UNCOMMON': return '#27AE60';
      case 'COMMON': return '#95A5A6';
      default: return props.theme.colors.textSecondary;
    }
  }};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
`;

const RewardDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacing[2]} 0;
`;

const RewardXP = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const UnlockedBadge = styled.div`
  background: ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  align-self: flex-start;
`;

interface MotivationDashboardProps {
  vocabularyCards: VocabularyCard[];
  reviewSessions: ReviewSession[];
  achievements: EducationalAchievement[];
  onClose: () => void;
}

export const MotivationDashboard: React.FC<MotivationDashboardProps> = ({
  vocabularyCards,
  reviewSessions,
  achievements,
  onClose
}) => {
  const [profile, setProfile] = useState<MotivationProfile | null>(null);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [streakBonus, setStreakBonus] = useState<StreakBonus | null>(null);

  useEffect(() => {
    // Generate analytics
    const generatedAnalytics = LearningAnalyticsEngine.generateAnalytics(
      vocabularyCards,
      reviewSessions
    );
    setAnalytics(generatedAnalytics);

    // Create or load motivation profile (in real app, this would come from storage)
    const userProfile = MotivationEngine.createProfile('user1', {
      motivationStyle: MotivationStyle.ACHIEVER,
      encouragementLevel: EncouragementLevel.HIGH
    });

    // Update profile with current analytics
    const updatedProfile = MotivationEngine.updateProfile(
      userProfile,
      generatedAnalytics,
      achievements,
      []
    );

    // Get rewards and check for unlocks
    const defaultRewards = MotivationEngine.getDefaultRewards();
    const { profile: profileWithRewards } = MotivationEngine.checkRewardUnlocks(
      updatedProfile,
      generatedAnalytics,
      achievements,
      defaultRewards
    );

    setProfile(profileWithRewards);
    setRewards(defaultRewards);

    // Get current streak bonus
    const currentStreakBonus = MotivationEngine.getCurrentStreakBonus(generatedAnalytics.dailyStreak);
    setStreakBonus(currentStreakBonus);
  }, [vocabularyCards, reviewSessions, achievements]);

  if (!profile || !analytics) {
    return (
      <DashboardContainer>
        <DashboardTitle>
          <AnimatedEmoji emoji="🎮" mood="floating" />
          Loading Motivation...
        </DashboardTitle>
      </DashboardContainer>
    );
  }

  const levelProgress = profile.level > 1 ? 
    100 - (profile.xpToNextLevel / (100 + (profile.level - 1) * 50)) * 100 : 
    (100 - profile.xpToNextLevel);

  const unlockedRewards = rewards.filter(r => r.isUnlocked);
  const pendingRewards = rewards.filter(r => !r.isUnlocked);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>
          <AnimatedEmoji emoji="🎮" mood="excited" />
          Motivation Hub
          <AnimatedEmoji emoji="🏆" mood="floating" />
        </DashboardTitle>
        <Button variant="ghost" onClick={onClose}>← Back to Dashboard</Button>
      </DashboardHeader>

      <LevelSection>
        <LevelInfo>
          <LevelNumber>{profile.level}</LevelNumber>
          <XPInfo>
            <XPLabel>Level {profile.level}</XPLabel>
            <XPAmount>{profile.totalXP} XP</XPAmount>
          </XPInfo>
        </LevelInfo>
        
        <XPBar>
          <XPFill progress={levelProgress} />
        </XPBar>
        <XPText>{profile.xpToNextLevel} XP to next level</XPText>
      </LevelSection>

      <StatsGrid>
        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatValue>{profile.engagementScore}%</StatValue>
          <StatLabel>Engagement Score</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>🎯</StatIcon>
          <StatValue>{profile.weeklyGoalProgress}%</StatValue>
          <StatLabel>Weekly Goals</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>⏱️</StatIcon>
          <StatValue>{profile.averageSessionLength}</StatValue>
          <StatLabel>Avg Session (min)</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>🏅</StatIcon>
          <StatValue>{unlockedRewards.length}</StatValue>
          <StatLabel>Rewards Earned</StatLabel>
        </StatCard>
      </StatsGrid>

      <StreakSection>
        <StreakHeader>
          <StreakTitle>
            <AnimatedEmoji emoji="🔥" mood="excited" />
            Current Streak
          </StreakTitle>
        </StreakHeader>
        
        <StreakDisplay>
          <StreakNumber>{profile.currentStreak}</StreakNumber>
          <StreakLabel>days</StreakLabel>
        </StreakDisplay>
        
        {streakBonus && (
          <StreakBonus>
            <AnimatedEmoji emoji="⚡" mood="floating" />
            {streakBonus.message} ({streakBonus.xpMultiplier}x XP bonus)
          </StreakBonus>
        )}
      </StreakSection>

      {unlockedRewards.length > 0 && (
        <RewardsSection>
          <SectionTitle>
            <AnimatedEmoji emoji="🏆" mood="excited" />
            Earned Rewards
          </SectionTitle>
          <RewardsGrid>
            {unlockedRewards.map(reward => (
              <RewardCard
                key={reward.id}
                rarity={reward.rarity}
                isUnlocked={reward.isUnlocked}
              >
                <RewardHeader>
                  <RewardIcon isUnlocked={reward.isUnlocked}>
                    {reward.icon}
                  </RewardIcon>
                  <RewardInfo>
                    <RewardTitle>{reward.title}</RewardTitle>
                    <RewardRarityBadge rarity={reward.rarity}>
                      {reward.rarity}
                    </RewardRarityBadge>
                  </RewardInfo>
                  <UnlockedBadge>
                    <AnimatedEmoji emoji="✅" mood="excited" />
                    Earned
                  </UnlockedBadge>
                </RewardHeader>
                
                <RewardDescription>{reward.description}</RewardDescription>
                
                <RewardXP>
                  <AnimatedEmoji emoji="⭐" mood="floating" />
                  {reward.xpValue} XP
                </RewardXP>
              </RewardCard>
            ))}
          </RewardsGrid>
        </RewardsSection>
      )}

      <RewardsSection>
        <SectionTitle>
          <AnimatedEmoji emoji="🎯" mood="thinking" />
          Available Rewards
        </SectionTitle>
        <RewardsGrid>
          {pendingRewards.slice(0, 6).map(reward => (
            <RewardCard
              key={reward.id}
              rarity={reward.rarity}
              isUnlocked={reward.isUnlocked}
            >
              <RewardHeader>
                <RewardIcon isUnlocked={reward.isUnlocked}>
                  {reward.icon}
                </RewardIcon>
                <RewardInfo>
                  <RewardTitle>{reward.title}</RewardTitle>
                  <RewardRarityBadge rarity={reward.rarity}>
                    {reward.rarity}
                  </RewardRarityBadge>
                </RewardInfo>
              </RewardHeader>
              
              <RewardDescription>{reward.description}</RewardDescription>
              
              <RewardXP>
                <AnimatedEmoji emoji="⭐" mood="floating" />
                {reward.xpValue} XP
              </RewardXP>
            </RewardCard>
          ))}
        </RewardsGrid>
      </RewardsSection>
    </DashboardContainer>
  );
};