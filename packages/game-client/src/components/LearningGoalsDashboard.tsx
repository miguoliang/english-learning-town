/**
 * Learning Goals Dashboard Component
 * Allows users to set, track, and manage their learning goals
 */

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Button, AnimatedEmoji } from "@elt/ui";
import {
  LearningGoalEngine,
  GoalPriority,
  type LearningGoal,
  type GoalRecommendation,
  type GoalProgress,
  type LearningAnalytics,
  LearningAnalyticsEngine,
} from "@elt/learning-analytics";
import type { VocabularyCard, ReviewSession } from "@elt/learning-algorithms";

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
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  justify-content: center;
  flex-wrap: wrap;
`;

const TabButton = styled(Button)<{ isActive: boolean }>`
  background: ${(props) =>
    props.isActive ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${(props) =>
    props.isActive ? props.theme.colors.surface : props.theme.colors.text};
  border: 2px solid
    ${(props) =>
      props.isActive
        ? props.theme.colors.primary
        : props.theme.colors.surfaceLight};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
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
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const GoalCard = styled.div<{ priority: GoalPriority; isCompleted: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border-left: 4px solid
    ${(props) => {
      if (props.isCompleted) return props.theme.colors.success;
      switch (props.priority) {
        case "CRITICAL":
          return props.theme.colors.error;
        case "HIGH":
          return props.theme.colors.warning;
        case "MEDIUM":
          return props.theme.colors.accent;
        case "LOW":
          return props.theme.colors.textSecondary;
        default:
          return props.theme.colors.accent;
      }
    }};
  opacity: ${(props) => (props.isCompleted ? 0.8 : 1)};
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const GoalInfo = styled.div`
  flex: 1;
`;

const GoalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const GoalCategoryBadge = styled.span<{ category: string }>`
  background: ${(props) => {
    switch (props.category) {
      case "VOCABULARY":
        return "#3498DB";
      case "ACCURACY":
        return "#27AE60";
      case "CONSISTENCY":
        return "#E74C3C";
      case "SPEED":
        return "#F39C12";
      case "MASTERY":
        return "#9B59B6";
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
`;

const PriorityBadge = styled.div<{ priority: GoalPriority }>`
  background: ${(props) => {
    switch (props.priority) {
      case "CRITICAL":
        return props.theme.colors.error;
      case "HIGH":
        return props.theme.colors.warning;
      case "MEDIUM":
        return props.theme.colors.accent;
      case "LOW":
        return props.theme.colors.textSecondary;
      default:
        return props.theme.colors.accent;
    }
  }};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const GoalDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacing[2]} 0;
  line-height: 1.4;
`;

const ProgressSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
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

const ProgressPercentage = styled.div<{ isOnTrack: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${(props) =>
    props.isOnTrack ? props.theme.colors.success : props.theme.colors.warning};
`;

const ProgressBar = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 8px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const ProgressFill = styled.div<{ progress: number; isOnTrack: boolean }>`
  background: ${(props) =>
    props.isOnTrack
      ? "linear-gradient(90deg, #27AE60, #2ECC71)"
      : "linear-gradient(90deg, #F39C12, #E67E22)"};
  height: 100%;
  width: ${(props) => Math.min(props.progress, 100)}%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
`;

const GoalStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompletedBadge = styled.div`
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

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const RecommendationCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px dashed ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-style: solid;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const RecommendationTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const RecommendationReason = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

interface LearningGoalsDashboardProps {
  vocabularyCards: VocabularyCard[];
  reviewSessions: ReviewSession[];
  onClose: () => void;
}

type TabType = "active" | "completed" | "recommendations" | "stats";

export const LearningGoalsDashboard: React.FC<LearningGoalsDashboardProps> = ({
  vocabularyCards,
  reviewSessions,
  onClose,
}) => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>(
    [],
  );
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Generate analytics
    const generatedAnalytics = LearningAnalyticsEngine.generateAnalytics(
      vocabularyCards,
      reviewSessions,
    );
    setAnalytics(generatedAnalytics);

    // Load existing goals (in real app, this would come from storage)
    const existingGoals: LearningGoal[] = [];

    // Generate recommendations
    const goalRecommendations = LearningGoalEngine.generateRecommendations(
      generatedAnalytics,
      existingGoals,
    );
    setRecommendations(goalRecommendations);

    // Update goal progress
    const updatedGoals = LearningGoalEngine.updateGoalProgress(
      existingGoals,
      vocabularyCards,
      reviewSessions,
    );
    setGoals(updatedGoals);

    // Calculate goal progress
    const progress = LearningGoalEngine.getGoalProgress(updatedGoals);
    setGoalProgress(progress);

    // Calculate statistics
    const goalStats = LearningGoalEngine.calculateStatistics(updatedGoals);
    setStats(goalStats);
  }, [vocabularyCards, reviewSessions]);

  const handleCreateGoal = useCallback(
    (recommendation: GoalRecommendation) => {
      const newGoal = LearningGoalEngine.createGoal(
        recommendation.goalTemplate,
      );
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);

      // Remove this recommendation
      setRecommendations((prev) =>
        prev.filter((rec) => rec !== recommendation),
      );

      // Recalculate progress
      const progress = LearningGoalEngine.getGoalProgress(updatedGoals);
      setGoalProgress(progress);
    },
    [goals],
  );

  const activeGoals = goals.filter(
    (goal) => goal.isActive && !goal.isCompleted,
  );
  const completedGoals = goals.filter((goal) => goal.isCompleted);

  const getPriorityIcon = (priority: GoalPriority): string => {
    switch (priority) {
      case GoalPriority.CRITICAL:
        return "🔥";
      case GoalPriority.HIGH:
        return "⭐";
      case GoalPriority.MEDIUM:
        return "📌";
      case GoalPriority.LOW:
        return "📝";
      default:
        return "🎯";
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case "VOCABULARY":
        return "📚";
      case "ACCURACY":
        return "🎯";
      case "CONSISTENCY":
        return "🔥";
      case "SPEED":
        return "⚡";
      case "MASTERY":
        return "🧠";
      case "REVIEW":
        return "🔄";
      case "TIME":
        return "⏰";
      default:
        return "🎯";
    }
  };

  if (!analytics || !stats) {
    return (
      <DashboardContainer>
        <DashboardTitle>
          <AnimatedEmoji emoji="🎯" mood="floating" />
          Loading Goals...
        </DashboardTitle>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>
          <AnimatedEmoji emoji="🎯" mood="excited" />
          Learning Goals
          <AnimatedEmoji emoji="🚀" mood="floating" />
        </DashboardTitle>
        <Button variant="ghost" onClick={onClose}>
          ← Back to Dashboard
        </Button>
      </DashboardHeader>

      <TabContainer>
        <TabButton
          variant="outline"
          isActive={activeTab === "active"}
          onClick={() => setActiveTab("active")}
        >
          Active Goals ({activeGoals.length})
        </TabButton>
        <TabButton
          variant="outline"
          isActive={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({completedGoals.length})
        </TabButton>
        <TabButton
          variant="outline"
          isActive={activeTab === "recommendations"}
          onClick={() => setActiveTab("recommendations")}
        >
          Recommendations ({recommendations.length})
        </TabButton>
        <TabButton
          variant="outline"
          isActive={activeTab === "stats"}
          onClick={() => setActiveTab("stats")}
        >
          Statistics
        </TabButton>
      </TabContainer>

      {activeTab === "stats" && (
        <Section>
          <SectionTitle>
            <AnimatedEmoji emoji="📊" mood="happy" />
            Goal Statistics
          </SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.active}</StatValue>
              <StatLabel>Active Goals</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.completed}</StatValue>
              <StatLabel>Completed</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.completionRate}%</StatValue>
              <StatLabel>Success Rate</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.onTrack}</StatValue>
              <StatLabel>On Track</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.overdue}</StatValue>
              <StatLabel>Overdue</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.averageTimeToComplete}</StatValue>
              <StatLabel>Avg. Days</StatLabel>
            </StatCard>
          </StatsGrid>
        </Section>
      )}

      {activeTab === "active" && (
        <Section>
          <SectionTitle>
            <AnimatedEmoji emoji="🎯" mood="excited" />
            Active Goals
          </SectionTitle>
          {activeGoals.length > 0 ? (
            <GoalsGrid>
              {activeGoals.map((goal) => {
                const progress = goalProgress.find(
                  (gp) => gp.goal.id === goal.id,
                );
                return (
                  <GoalCard
                    key={goal.id}
                    priority={goal.priority}
                    isCompleted={goal.isCompleted}
                  >
                    <GoalHeader>
                      <GoalInfo>
                        <GoalTitle>{goal.title}</GoalTitle>
                        <GoalCategoryBadge category={goal.category}>
                          {getCategoryIcon(goal.category)} {goal.category}
                        </GoalCategoryBadge>
                      </GoalInfo>
                      <PriorityBadge priority={goal.priority}>
                        {getPriorityIcon(goal.priority)} {goal.priority}
                      </PriorityBadge>
                    </GoalHeader>

                    <GoalDescription>{goal.description}</GoalDescription>

                    <ProgressSection>
                      <ProgressHeader>
                        <ProgressText>
                          {goal.currentProgress} / {goal.target}
                        </ProgressText>
                        <ProgressPercentage
                          isOnTrack={progress?.isOnTrack || false}
                        >
                          {progress?.progressPercentage.toFixed(0)}%
                        </ProgressPercentage>
                      </ProgressHeader>
                      <ProgressBar>
                        <ProgressFill
                          progress={progress?.progressPercentage || 0}
                          isOnTrack={progress?.isOnTrack || false}
                        />
                      </ProgressBar>
                      <GoalStatus>
                        <span>📅 {progress?.daysRemaining} days left</span>
                        <span>📈 {progress?.recentTrend}</span>
                      </GoalStatus>
                    </ProgressSection>
                  </GoalCard>
                );
              })}
            </GoalsGrid>
          ) : (
            <RecommendationCard>
              <AnimatedEmoji emoji="🎯" mood="thinking" />
              <RecommendationTitle>No Active Goals</RecommendationTitle>
              <RecommendationReason>
                Check out our recommendations to get started on your learning
                journey!
              </RecommendationReason>
              <Button onClick={() => setActiveTab("recommendations")}>
                View Recommendations
              </Button>
            </RecommendationCard>
          )}
        </Section>
      )}

      {activeTab === "completed" && (
        <Section>
          <SectionTitle>
            <AnimatedEmoji emoji="🏆" mood="excited" />
            Completed Goals
          </SectionTitle>
          {completedGoals.length > 0 ? (
            <GoalsGrid>
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  priority={goal.priority}
                  isCompleted={true}
                >
                  <CompletedBadge>
                    <AnimatedEmoji emoji="✅" mood="excited" />
                    Completed
                  </CompletedBadge>

                  <GoalHeader>
                    <GoalInfo>
                      <GoalTitle>{goal.title}</GoalTitle>
                      <GoalCategoryBadge category={goal.category}>
                        {getCategoryIcon(goal.category)} {goal.category}
                      </GoalCategoryBadge>
                    </GoalInfo>
                  </GoalHeader>

                  <GoalDescription>{goal.description}</GoalDescription>

                  <GoalStatus>
                    <span>
                      🎉 Completed {goal.completedAt?.toLocaleDateString()}
                    </span>
                  </GoalStatus>
                </GoalCard>
              ))}
            </GoalsGrid>
          ) : (
            <RecommendationCard>
              <AnimatedEmoji emoji="🏆" mood="thinking" />
              <RecommendationTitle>No Completed Goals Yet</RecommendationTitle>
              <RecommendationReason>
                Complete your first goal to see it here!
              </RecommendationReason>
            </RecommendationCard>
          )}
        </Section>
      )}

      {activeTab === "recommendations" && (
        <Section>
          <SectionTitle>
            <AnimatedEmoji emoji="💡" mood="thinking" />
            Recommended Goals
          </SectionTitle>
          {recommendations.length > 0 ? (
            <RecommendationsGrid>
              {recommendations.map((recommendation, index) => (
                <RecommendationCard key={index}>
                  <AnimatedEmoji
                    emoji={getCategoryIcon(
                      recommendation.goalTemplate.category!,
                    )}
                    mood="happy"
                  />
                  <RecommendationTitle>
                    {recommendation.goalTemplate.title}
                  </RecommendationTitle>
                  <RecommendationReason>
                    {recommendation.reason}
                  </RecommendationReason>
                  <div style={{ marginBottom: "16px" }}>
                    <GoalCategoryBadge
                      category={recommendation.goalTemplate.category!}
                    >
                      {recommendation.goalTemplate.category}
                    </GoalCategoryBadge>
                  </div>
                  <Button onClick={() => handleCreateGoal(recommendation)}>
                    Set This Goal
                  </Button>
                </RecommendationCard>
              ))}
            </RecommendationsGrid>
          ) : (
            <RecommendationCard>
              <AnimatedEmoji emoji="🎉" mood="excited" />
              <RecommendationTitle>All Set!</RecommendationTitle>
              <RecommendationReason>
                You have all the goals you need right now. Keep working on your
                current goals!
              </RecommendationReason>
            </RecommendationCard>
          )}
        </Section>
      )}
    </DashboardContainer>
  );
};
