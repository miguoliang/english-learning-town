/**
 * Vocabulary Review Dashboard
 * Main interface for spaced repetition vocabulary learning
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, AnimatedEmoji } from "@elt/ui";
import {
  SpacedRepetitionEngine,
  type VocabularyCard,
  type ReviewSession,
} from "@elt/learning-algorithms";
import {
  LearningAnalyticsEngine,
  type LearningAnalytics,
} from "@elt/learning-analytics";
import { LearningErrorBoundary } from "./ErrorBoundary";

const DashboardContainer = styled.div`
  background: ${({ theme }) => theme.gradients.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 800px;
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

const DashboardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
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

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ActionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ActionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: 1.5;
`;

const ProgressSection = styled.div`
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  color: ${({ theme }) => theme.colors.surface};
`;

const ProgressTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 12px;
  margin: ${({ theme }) => theme.spacing[4]} 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: ${({ theme }) => theme.colors.surface};
  height: 100%;
  width: ${(props) => props.progress}%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

interface VocabularyReviewDashboardProps {
  vocabularyCards: VocabularyCard[];
  reviewSessions: ReviewSession[];
  onStartReview: () => void;
  onStartCustomSession: () => void;
  onViewAnalytics: () => void;
  onManageCards: () => void;
}

export const VocabularyReviewDashboard: React.FC<
  VocabularyReviewDashboardProps
> = ({
  vocabularyCards,
  reviewSessions,
  onStartReview,
  onStartCustomSession,
  onViewAnalytics,
  onManageCards,
}) => {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [dueCards, setDueCards] = useState<VocabularyCard[]>([]);
  const [newCards, setNewCards] = useState<VocabularyCard[]>([]);

  useEffect(() => {
    // Generate analytics
    const generatedAnalytics = LearningAnalyticsEngine.generateAnalytics(
      vocabularyCards,
      reviewSessions,
    );
    setAnalytics(generatedAnalytics);

    // Get due and new cards
    const due = SpacedRepetitionEngine.getDueCards(vocabularyCards, 20);
    const newCardsToLearn = SpacedRepetitionEngine.getNewCards(
      vocabularyCards,
      5,
    );

    setDueCards(due);
    setNewCards(newCardsToLearn);
  }, [vocabularyCards, reviewSessions]);

  if (!analytics) {
    return (
      <DashboardContainer>
        <DashboardTitle>
          <AnimatedEmoji emoji="📚" mood="floating" />
          Loading...
        </DashboardTitle>
      </DashboardContainer>
    );
  }

  // const dailyStats = SpacedRepetitionEngine.getDailyStats(vocabularyCards);

  return (
    <LearningErrorBoundary
      componentName="Vocabulary Review Dashboard"
      onRetry={() => window.location.reload()}
    >
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>
            <AnimatedEmoji emoji="🧠" mood="excited" />
            Vocabulary Learning
            <AnimatedEmoji emoji="⭐" mood="floating" />
          </DashboardTitle>
          <DashboardSubtitle>
            Master English vocabulary with spaced repetition
          </DashboardSubtitle>
        </DashboardHeader>

        <StatsGrid>
          <StatCard>
            <StatValue>{analytics.totalWordsLearned}</StatValue>
            <StatLabel>Words Learned</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{dueCards.length}</StatValue>
            <StatLabel>Due Today</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{newCards.length}</StatValue>
            <StatLabel>New Words</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{analytics.averageMastery}%</StatValue>
            <StatLabel>Mastery Level</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{analytics.dailyStreak}</StatValue>
            <StatLabel>Day Streak</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{analytics.overallAccuracy}%</StatValue>
            <StatLabel>Accuracy</StatLabel>
          </StatCard>
        </StatsGrid>

        <ActionGrid>
          <ActionCard>
            <ActionTitle>
              <AnimatedEmoji emoji="🎯" mood="excited" />
              Daily Review
            </ActionTitle>
            <ActionDescription>
              Review {dueCards.length} words that are due today. Perfect for
              maintaining your vocabulary.
            </ActionDescription>
            <Button
              variant="primary"
              size="lg"
              onClick={onStartReview}
              disabled={dueCards.length === 0}
            >
              {dueCards.length > 0
                ? `Review ${dueCards.length} Words`
                : "All Caught Up! 🎉"}
            </Button>
          </ActionCard>

          <ActionCard>
            <ActionTitle>
              <AnimatedEmoji emoji="🌟" mood="happy" />
              Learn New Words
            </ActionTitle>
            <ActionDescription>
              Discover {newCards.length} new vocabulary words to expand your
              English skills.
            </ActionDescription>
            <Button
              variant="secondary"
              size="lg"
              onClick={onStartCustomSession}
              disabled={newCards.length === 0}
            >
              {newCards.length > 0
                ? `Learn ${newCards.length} New Words`
                : "No New Words"}
            </Button>
          </ActionCard>

          <ActionCard>
            <ActionTitle>
              <AnimatedEmoji emoji="📊" mood="thinking" />
              View Progress
            </ActionTitle>
            <ActionDescription>
              Check your learning analytics, insights, and progress tracking.
            </ActionDescription>
            <Button variant="outline" size="lg" onClick={onViewAnalytics}>
              View Analytics
            </Button>
          </ActionCard>

          <ActionCard>
            <ActionTitle>
              <AnimatedEmoji emoji="🔧" mood="happy" />
              Manage Cards
            </ActionTitle>
            <ActionDescription>
              Add, edit, or organize your vocabulary cards and learning
              preferences.
            </ActionDescription>
            <Button variant="ghost" size="lg" onClick={onManageCards}>
              Manage Vocabulary
            </Button>
          </ActionCard>
        </ActionGrid>

        <ProgressSection>
          <ProgressTitle>
            <AnimatedEmoji emoji="🏆" mood="excited" />
            Weekly Progress
          </ProgressTitle>
          <ProgressBar>
            <ProgressFill progress={analytics.weeklyProgress} />
          </ProgressBar>
          <ProgressText>
            {analytics.weeklyProgress}% of weekly goal completed
          </ProgressText>
        </ProgressSection>
      </DashboardContainer>
    </LearningErrorBoundary>
  );
};
