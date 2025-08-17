/**
 * Learning Analytics Dashboard
 * Comprehensive view of learning progress and insights
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, AnimatedEmoji } from '@elt/ui';
import { 
  LearningAnalyticsEngine,
  type LearningAnalytics,
  type LearningInsight,
  type VocabularyCard,
  type ReviewSession,
} from '@elt/core';
import { DashboardErrorBoundary } from './ErrorBoundary';

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
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Section = styled.div`
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const MetricCard = styled.div`
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

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const MetricSubtext = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const InsightsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const InsightCard = styled.div<{ priority: 'low' | 'medium' | 'high' }>`
  background: ${({ theme }) => theme.colors.surface};
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return props.theme.colors.error;
      case 'medium': return props.theme.colors.warning;
      case 'low': return props.theme.colors.success;
      default: return props.theme.colors.accent;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const InsightTypeDisplay = styled.span<{ type: string }>`
  background: ${props => {
    switch (props.type) {
      case 'CELEBRATION': return props.theme.colors.success;
      case 'WARNING': return props.theme.colors.error;
      case 'RECOMMENDATION': return props.theme.colors.warning;
      case 'TIP': return props.theme.colors.accent;
      default: return props.theme.colors.textSecondary;
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

const InsightTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const InsightDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  line-height: 1.5;
`;

const InsightAction = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin: 0;
`;

const ProgressSection = styled.div`
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  color: ${({ theme }) => theme.colors.surface};
  text-align: center;
`;

const ProgressTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ProgressItem = styled.div`
  text-align: center;
`;

const ProgressValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const ProgressLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.9;
`;

const CategorySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[6]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const CategoryTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CategoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CategoryItem = styled.li`
  padding: ${({ theme }) => theme.spacing[2]} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceLight};
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:last-child {
    border-bottom: none;
  }
`;

interface LearningAnalyticsDashboardProps {
  vocabularyCards: VocabularyCard[];
  reviewSessions: ReviewSession[];
  onClose: () => void;
}

export const LearningAnalyticsDashboard: React.FC<LearningAnalyticsDashboardProps> = ({
  vocabularyCards,
  reviewSessions,
  onClose
}) => {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [insights, setInsights] = useState<LearningInsight[]>([]);

  useEffect(() => {
    const generatedAnalytics = LearningAnalyticsEngine.generateAnalytics(
      vocabularyCards,
      reviewSessions
    );
    const generatedInsights = LearningAnalyticsEngine.generateInsights(generatedAnalytics);
    
    setAnalytics(generatedAnalytics);
    setInsights(generatedInsights);
  }, [vocabularyCards, reviewSessions]);

  if (!analytics) {
    return (
      <DashboardContainer>
        <DashboardTitle>
          <AnimatedEmoji emoji="📊" mood="floating" />
          Loading Analytics...
        </DashboardTitle>
      </DashboardContainer>
    );
  }

  const getInsightEmoji = (type: string) => {
    switch (type) {
      case 'CELEBRATION': return '🎉';
      case 'WARNING': return '⚠️';
      case 'RECOMMENDATION': return '💡';
      case 'TIP': return '💭';
      default: return '📈';
    }
  };

  return (
    <DashboardErrorBoundary dashboardName="Learning Analytics">
      <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>
          <AnimatedEmoji emoji="📊" mood="excited" />
          Learning Analytics
          <AnimatedEmoji emoji="📈" mood="floating" />
        </DashboardTitle>
        <Button variant="ghost" onClick={onClose}>← Back to Dashboard</Button>
      </DashboardHeader>

      <Section>
        <SectionTitle>
          <AnimatedEmoji emoji="🎯" mood="happy" />
          Overall Progress
        </SectionTitle>
        <MetricsGrid>
          <MetricCard>
            <MetricValue>{analytics.totalWordsLearned}</MetricValue>
            <MetricLabel>Total Words Learned</MetricLabel>
            <MetricSubtext>Growing your vocabulary</MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.activeCards}</MetricValue>
            <MetricLabel>Active Learning</MetricLabel>
            <MetricSubtext>Words in progress</MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.masteredCards}</MetricValue>
            <MetricLabel>Mastered Words</MetricLabel>
            <MetricSubtext>Well learned vocabulary</MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.averageMastery}%</MetricValue>
            <MetricLabel>Average Mastery</MetricLabel>
            <MetricSubtext>Overall skill level</MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.overallAccuracy}%</MetricValue>
            <MetricLabel>Accuracy Rate</MetricLabel>
            <MetricSubtext>Correct answers</MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.learningVelocity}</MetricValue>
            <MetricLabel>Words/Week</MetricLabel>
            <MetricSubtext>Learning pace</MetricSubtext>
          </MetricCard>
        </MetricsGrid>
      </Section>

      <Section>
        <ProgressSection>
          <ProgressTitle>
            <AnimatedEmoji emoji="📅" mood="excited" />
            Time-Based Progress
          </ProgressTitle>
          <ProgressGrid>
            <ProgressItem>
              <ProgressValue>{analytics.dailyStreak}</ProgressValue>
              <ProgressLabel>Day Streak</ProgressLabel>
            </ProgressItem>
            <ProgressItem>
              <ProgressValue>{analytics.weeklyProgress}%</ProgressValue>
              <ProgressLabel>Weekly Goal</ProgressLabel>
            </ProgressItem>
            <ProgressItem>
              <ProgressValue>{analytics.monthlyProgress}%</ProgressValue>
              <ProgressLabel>Monthly Goal</ProgressLabel>
            </ProgressItem>
            <ProgressItem>
              <ProgressValue>{analytics.totalStudyTime}min</ProgressValue>
              <ProgressLabel>Total Study Time</ProgressLabel>
            </ProgressItem>
            <ProgressItem>
              <ProgressValue>{analytics.averageSessionLength}min</ProgressValue>
              <ProgressLabel>Avg. Session</ProgressLabel>
            </ProgressItem>
            <ProgressItem>
              <ProgressValue>{analytics.bestTimeOfDay}</ProgressValue>
              <ProgressLabel>Best Time</ProgressLabel>
            </ProgressItem>
          </ProgressGrid>
        </ProgressSection>
      </Section>

      <Section>
        <SectionTitle>
          <AnimatedEmoji emoji="💡" mood="thinking" />
          Learning Insights
        </SectionTitle>
        <InsightsContainer>
          {insights.map((insight, index) => (
            <InsightCard key={index} priority={insight.priority}>
              <InsightHeader>
                <AnimatedEmoji emoji={getInsightEmoji(insight.type)} mood="happy" />
                <InsightTypeDisplay type={insight.type}>{insight.type}</InsightTypeDisplay>
                <InsightTitle>{insight.title}</InsightTitle>
              </InsightHeader>
              <InsightDescription>{insight.description}</InsightDescription>
              <InsightAction>💫 {insight.actionable}</InsightAction>
            </InsightCard>
          ))}
        </InsightsContainer>
      </Section>

      <Section>
        <SectionTitle>
          <AnimatedEmoji emoji="📚" mood="happy" />
          Category Performance
        </SectionTitle>
        <CategorySection>
          <CategoryCard>
            <CategoryTitle>
              <AnimatedEmoji emoji="💪" mood="excited" />
              Strongest Areas
            </CategoryTitle>
            <CategoryList>
              {analytics.strongestCategories.length > 0 ? (
                analytics.strongestCategories.map((category, index) => (
                  <CategoryItem key={index}>✅ {category}</CategoryItem>
                ))
              ) : (
                <CategoryItem>Keep learning to discover your strengths!</CategoryItem>
              )}
            </CategoryList>
          </CategoryCard>
          
          <CategoryCard>
            <CategoryTitle>
              <AnimatedEmoji emoji="🎯" mood="thinking" />
              Areas to Improve
            </CategoryTitle>
            <CategoryList>
              {analytics.weakestCategories.length > 0 ? (
                analytics.weakestCategories.map((category, index) => (
                  <CategoryItem key={index}>🔄 {category}</CategoryItem>
                ))
              ) : (
                <CategoryItem>You're doing great across all areas!</CategoryItem>
              )}
            </CategoryList>
          </CategoryCard>
        </CategorySection>
      </Section>

      <Section>
        <SectionTitle>
          <AnimatedEmoji emoji="🚀" mood="excited" />
          Recommendations
        </SectionTitle>
        <MetricsGrid>
          <MetricCard>
            <MetricValue>{analytics.readinessLevel}%</MetricValue>
            <MetricLabel>Ready for Challenges</MetricLabel>
            <MetricSubtext>
              {analytics.readinessLevel >= 80 ? 'Try harder words!' : 'Keep practicing current level'}
            </MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.suggestedDailyGoal}</MetricValue>
            <MetricLabel>Suggested Daily Goal</MetricLabel>
            <MetricSubtext>Cards to review per day</MetricSubtext>
          </MetricCard>
          
          <MetricCard>
            <MetricValue>{analytics.estimatedTimeToMastery}</MetricValue>
            <MetricLabel>Days to Mastery</MetricLabel>
            <MetricSubtext>At current pace</MetricSubtext>
          </MetricCard>
        </MetricsGrid>
      </Section>
    </DashboardContainer>
    </DashboardErrorBoundary>
  );
};