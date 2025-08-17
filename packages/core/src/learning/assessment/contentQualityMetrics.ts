/**
 * Content Quality Metrics and Assessment System
 * Measures and evaluates the effectiveness of educational content
 * Provides data-driven insights for content optimization and IELTS preparation
 */

import type { CEFRLevel, IELTSTaskType, LanguageSkill } from './curriculumAlignment';
import type { SpacedRepetition } from '../shared/types';
import { LearningValidation, ValidationError } from '../shared/validation';

export const ContentType = {
  DIALOGUE: 'DIALOGUE',
  EXERCISE: 'EXERCISE', 
  LESSON: 'LESSON',
  ASSESSMENT: 'ASSESSMENT',
  VOCABULARY: 'VOCABULARY',
  GRAMMAR: 'GRAMMAR'
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];

export const QualityDimension = {
  EDUCATIONAL_EFFECTIVENESS: 'EDUCATIONAL_EFFECTIVENESS',
  ENGAGEMENT: 'ENGAGEMENT',
  DIFFICULTY_APPROPRIATENESS: 'DIFFICULTY_APPROPRIATENESS',
  IELTS_RELEVANCE: 'IELTS_RELEVANCE',
  LEARNING_PROGRESSION: 'LEARNING_PROGRESSION',
  ACCESSIBILITY: 'ACCESSIBILITY'
} as const;

export type QualityDimension = typeof QualityDimension[keyof typeof QualityDimension];

export interface ContentQualityMetrics {
  contentId: string;
  contentType: ContentType;
  
  // Overall Quality Score (0-100)
  overallQuality: number;
  
  // Dimension Scores (0-100 each)
  educationalEffectiveness: number;
  engagement: number;
  difficultyAppropriateness: number;
  ieltsRelevance: number;
  learningProgression: number;
  accessibility: number;
  
  // Performance Metrics
  completionRate: number;         // % of learners who complete content
  averageAccuracy: number;        // % correct answers
  averageTimeSpent: number;       // Minutes spent on content
  retentionRate: number;          // % who remember after 1 week
  
  // Learner Feedback
  satisfactionScore: number;      // 1-5 star rating
  difficultyRating: number;       // 1-5 scale (1=too easy, 5=too hard)
  relevanceRating: number;        // 1-5 scale for IELTS preparation
  
  // Learning Outcomes
  vocabularyLearned: number;      // New words learned
  skillsImproved: LanguageSkill[];
  cefrProgress: number;           // CEFR level advancement (0-1)
  
  // Quality Indicators
  issues: QualityIssue[];
  recommendations: string[];
  lastUpdated: Date;
  sampleSize: number;             // Number of learners assessed
}

export interface QualityIssue {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: QualityDimension;
  description: string;
  impact: string;
  suggestedFix: string;
  affectedLearners: number;
}

export interface ContentUsageData {
  contentId: string;
  learnerAttempts: LearnerAttempt[];
  vocabularyInteractions: VocabularyInteraction[];
  feedbackSubmissions: FeedbackSubmission[];
  completionData: CompletionData[];
}

export interface LearnerAttempt {
  learnerId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  accuracy: number;
  responseTime: number;
  skillsAssessed: LanguageSkill[];
  cefrLevel: CEFRLevel;
  struggledWith: string[];
  masteredConcepts: string[];
}

export interface VocabularyInteraction {
  learnerId: string;
  word: string;
  definition: string;
  wasHighlighted: boolean;
  wasLearned: boolean;
  contextOfUse: string;
  difficultyPerceived: number; // 1-5 scale
  timestamp: Date;
}

export interface FeedbackSubmission {
  learnerId: string;
  overall: number;           // 1-5 stars
  difficulty: number;        // 1-5 scale
  relevance: number;         // 1-5 scale
  engagement: number;        // 1-5 scale
  textFeedback?: string;
  timestamp: Date;
}

export interface CompletionData {
  learnerId: string;
  timeSpent: number;         // minutes
  completed: boolean;
  dropoffPoint?: string;     // Where they stopped if incomplete
  retestPerformance?: number; // Performance on retest after 1 week
  timestamp: Date;
}

export class ContentQualityEngine {
  
  private static readonly QUALITY_WEIGHTS = {
    educationalEffectiveness: 0.25,
    engagement: 0.15,
    difficultyAppropriateness: 0.20,
    ieltsRelevance: 0.20,
    learningProgression: 0.15,
    accessibility: 0.05
  };
  
  private static readonly MIN_SAMPLE_SIZE = 10;
  
  /**
   * Calculate comprehensive quality metrics for content
   */
  static calculateQualityMetrics(
    contentId: string,
    contentType: ContentType,
    usageData: ContentUsageData
  ): ContentQualityMetrics {
    this.validateUsageData(usageData);
    
    const sampleSize = usageData.learnerAttempts.length;
    if (sampleSize < this.MIN_SAMPLE_SIZE) {
      throw new ValidationError(
        `Insufficient data for quality assessment. Need at least ${this.MIN_SAMPLE_SIZE} learner attempts.`,
        'sampleSize',
        sampleSize
      );
    }
    
    // Calculate dimension scores
    const educationalEffectiveness = this.calculateEducationalEffectiveness(usageData);
    const engagement = this.calculateEngagement(usageData);
    const difficultyAppropriateness = this.calculateDifficultyAppropriateness(usageData);
    const ieltsRelevance = this.calculateIELTSRelevance(usageData, contentType);
    const learningProgression = this.calculateLearningProgression(usageData);
    const accessibility = this.calculateAccessibility(usageData);
    
    // Calculate overall quality (weighted average)
    const overallQuality = 
      educationalEffectiveness * this.QUALITY_WEIGHTS.educationalEffectiveness +
      engagement * this.QUALITY_WEIGHTS.engagement +
      difficultyAppropriateness * this.QUALITY_WEIGHTS.difficultyAppropriateness +
      ieltsRelevance * this.QUALITY_WEIGHTS.ieltsRelevance +
      learningProgression * this.QUALITY_WEIGHTS.learningProgression +
      accessibility * this.QUALITY_WEIGHTS.accessibility;
    
    // Calculate performance metrics
    const completionRate = this.calculateCompletionRate(usageData);
    const averageAccuracy = this.calculateAverageAccuracy(usageData);
    const averageTimeSpent = this.calculateAverageTimeSpent(usageData);
    const retentionRate = this.calculateRetentionRate(usageData);
    
    // Calculate learner feedback
    const satisfactionScore = this.calculateSatisfactionScore(usageData);
    const difficultyRating = this.calculateDifficultyRating(usageData);
    const relevanceRating = this.calculateRelevanceRating(usageData);
    
    // Calculate learning outcomes
    const vocabularyLearned = this.calculateVocabularyLearned(usageData);
    const skillsImproved = this.calculateSkillsImproved(usageData);
    const cefrProgress = this.calculateCEFRProgress(usageData);
    
    // Identify issues and generate recommendations
    const issues = this.identifyQualityIssues(
      { educationalEffectiveness, engagement, difficultyAppropriateness, 
        ieltsRelevance, learningProgression, accessibility },
      usageData
    );
    const recommendations = this.generateRecommendations(issues, usageData);
    
    return {
      contentId,
      contentType,
      overallQuality: Math.round(overallQuality),
      educationalEffectiveness: Math.round(educationalEffectiveness),
      engagement: Math.round(engagement),
      difficultyAppropriateness: Math.round(difficultyAppropriateness),
      ieltsRelevance: Math.round(ieltsRelevance),
      learningProgression: Math.round(learningProgression),
      accessibility: Math.round(accessibility),
      completionRate: Math.round(completionRate),
      averageAccuracy: Math.round(averageAccuracy),
      averageTimeSpent: Math.round(averageTimeSpent * 100) / 100,
      retentionRate: Math.round(retentionRate),
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      difficultyRating: Math.round(difficultyRating * 10) / 10,
      relevanceRating: Math.round(relevanceRating * 10) / 10,
      vocabularyLearned: Math.round(vocabularyLearned),
      skillsImproved,
      cefrProgress: Math.round(cefrProgress * 100) / 100,
      issues,
      recommendations,
      lastUpdated: new Date(),
      sampleSize
    };
  }
  
  /**
   * Calculate educational effectiveness score
   */
  private static calculateEducationalEffectiveness(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    
    // Factors: accuracy, completion rate, concept mastery
    const averageAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
    const completionRate = attempts.filter(a => a.completed).length / attempts.length * 100;
    const masteryRate = attempts.reduce((sum, a) => sum + a.masteredConcepts.length, 0) / attempts.length;
    
    // Weight: accuracy 40%, completion 30%, mastery 30%
    return averageAccuracy * 0.4 + completionRate * 0.3 + Math.min(masteryRate * 10, 100) * 0.3;
  }
  
  /**
   * Calculate engagement score
   */
  private static calculateEngagement(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    const completions = usageData.completionData;
    
    // Factors: time spent, completion rate, feedback engagement
    const averageTime = completions.reduce((sum, c) => sum + c.timeSpent, 0) / completions.length;
    const completionRate = attempts.filter(a => a.completed).length / attempts.length * 100;
    const feedbackRate = usageData.feedbackSubmissions.length / attempts.length * 100;
    
    // Normalize time spent (assume 5-15 minutes is optimal)
    const timeScore = Math.min(Math.max((averageTime - 2) / 8 * 100, 0), 100);
    
    // Weight: time 40%, completion 40%, feedback 20%
    return timeScore * 0.4 + completionRate * 0.4 + Math.min(feedbackRate, 100) * 0.2;
  }
  
  /**
   * Calculate difficulty appropriateness score
   */
  private static calculateDifficultyAppropriateness(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    const feedback = usageData.feedbackSubmissions;
    
    // Target: 70-80% accuracy, difficulty rating around 3
    const averageAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
    const averageDifficultyRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.difficulty, 0) / feedback.length 
      : 3;
    
    // Score accuracy (optimal around 75%)
    const accuracyScore = Math.max(0, 100 - Math.abs(averageAccuracy - 75) * 2);
    
    // Score difficulty rating (optimal around 3.0)
    const difficultyScore = Math.max(0, 100 - Math.abs(averageDifficultyRating - 3) * 25);
    
    return (accuracyScore + difficultyScore) / 2;
  }
  
  /**
   * Calculate IELTS relevance score
   */
  private static calculateIELTSRelevance(usageData: ContentUsageData, contentType: ContentType): number {
    const feedback = usageData.feedbackSubmissions;
    const attempts = usageData.learnerAttempts;
    
    // Base relevance by content type
    const typeRelevance = {
      [ContentType.DIALOGUE]: 70,    // Good for speaking practice
      [ContentType.EXERCISE]: 85,    // Direct skill practice
      [ContentType.LESSON]: 80,      // Structured learning
      [ContentType.ASSESSMENT]: 95,  // Direct IELTS practice
      [ContentType.VOCABULARY]: 90,  // Essential for IELTS
      [ContentType.GRAMMAR]: 85      // Important foundation
    };
    
    const baseScore = typeRelevance[contentType];
    
    // Adjust based on feedback
    const relevanceFeedback = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.relevance, 0) / feedback.length 
      : 3;
    
    const feedbackAdjustment = (relevanceFeedback - 3) * 10; // ±20 points max
    
    return Math.max(0, Math.min(100, baseScore + feedbackAdjustment));
  }
  
  /**
   * Calculate learning progression score
   */
  private static calculateLearningProgression(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    const vocab = usageData.vocabularyInteractions;
    
    // Factors: skill improvement, vocabulary learning, concept progression
    const skillProgressions = attempts.filter(a => a.masteredConcepts.length > 0).length / attempts.length * 100;
    const vocabularyLearningRate = vocab.filter(v => v.wasLearned).length / Math.max(vocab.length, 1) * 100;
    
    // CEFR progression (estimate based on mastered concepts)
    const averageMastery = attempts.reduce((sum, a) => sum + a.masteredConcepts.length, 0) / attempts.length;
    const cefrProgress = Math.min(averageMastery * 20, 100); // 5 concepts = 100%
    
    return (skillProgressions * 0.4 + vocabularyLearningRate * 0.3 + cefrProgress * 0.3);
  }
  
  /**
   * Calculate accessibility score
   */
  private static calculateAccessibility(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    const completions = usageData.completionData;
    
    // Factors: completion across different skill levels, time variance, dropout patterns
    const cefrLevels = [...new Set(attempts.map(a => a.cefrLevel))];
    const levelDiversity = Math.min(cefrLevels.length / 3, 1) * 100; // Up to 3 different levels
    
    // Completion rate consistency across levels
    const completionConsistency = cefrLevels.map(level => {
      const levelAttempts = attempts.filter(a => a.cefrLevel === level);
      return levelAttempts.filter(a => a.completed).length / levelAttempts.length;
    }).reduce((sum, rate) => sum + rate, 0) / cefrLevels.length * 100;
    
    // Time variance (lower variance = more accessible)
    const times = completions.map(c => c.timeSpent);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length;
    const timeConsistency = Math.max(0, 100 - variance / 10); // Normalize variance
    
    return (levelDiversity * 0.3 + completionConsistency * 0.4 + timeConsistency * 0.3);
  }
  
  /**
   * Calculate completion rate
   */
  private static calculateCompletionRate(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    return attempts.filter(a => a.completed).length / attempts.length * 100;
  }
  
  /**
   * Calculate average accuracy
   */
  private static calculateAverageAccuracy(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    return attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
  }
  
  /**
   * Calculate average time spent
   */
  private static calculateAverageTimeSpent(usageData: ContentUsageData): number {
    const completions = usageData.completionData;
    return completions.reduce((sum, c) => sum + c.timeSpent, 0) / completions.length;
  }
  
  /**
   * Calculate retention rate
   */
  private static calculateRetentionRate(usageData: ContentUsageData): number {
    const retests = usageData.completionData.filter(c => c.retestPerformance !== undefined);
    if (retests.length === 0) return 0;
    
    return retests.filter(r => r.retestPerformance! >= 70).length / retests.length * 100;
  }
  
  /**
   * Calculate satisfaction score
   */
  private static calculateSatisfactionScore(usageData: ContentUsageData): number {
    const feedback = usageData.feedbackSubmissions;
    if (feedback.length === 0) return 3; // Default neutral
    
    return feedback.reduce((sum, f) => sum + f.overall, 0) / feedback.length;
  }
  
  /**
   * Calculate difficulty rating
   */
  private static calculateDifficultyRating(usageData: ContentUsageData): number {
    const feedback = usageData.feedbackSubmissions;
    if (feedback.length === 0) return 3; // Default neutral
    
    return feedback.reduce((sum, f) => sum + f.difficulty, 0) / feedback.length;
  }
  
  /**
   * Calculate relevance rating
   */
  private static calculateRelevanceRating(usageData: ContentUsageData): number {
    const feedback = usageData.feedbackSubmissions;
    if (feedback.length === 0) return 3; // Default neutral
    
    return feedback.reduce((sum, f) => sum + f.relevance, 0) / feedback.length;
  }
  
  /**
   * Calculate vocabulary learned
   */
  private static calculateVocabularyLearned(usageData: ContentUsageData): number {
    return usageData.vocabularyInteractions.filter(v => v.wasLearned).length;
  }
  
  /**
   * Calculate skills improved
   */
  private static calculateSkillsImproved(usageData: ContentUsageData): LanguageSkill[] {
    const skillCounts: Record<LanguageSkill, number> = {
      LISTENING: 0, READING: 0, WRITING: 0, SPEAKING: 0,
      VOCABULARY: 0, GRAMMAR: 0, PRONUNCIATION: 0
    };
    
    usageData.learnerAttempts.forEach(attempt => {
      attempt.skillsAssessed.forEach(skill => {
        if (attempt.accuracy > 70) { // Threshold for improvement
          skillCounts[skill]++;
        }
      });
    });
    
    // Return skills with significant improvement (>30% of learners)
    const threshold = usageData.learnerAttempts.length * 0.3;
    return Object.entries(skillCounts)
      .filter(([_, count]) => count >= threshold)
      .map(([skill, _]) => skill as LanguageSkill);
  }
  
  /**
   * Calculate CEFR progress
   */
  private static calculateCEFRProgress(usageData: ContentUsageData): number {
    const attempts = usageData.learnerAttempts;
    const averageMastery = attempts.reduce((sum, a) => sum + a.masteredConcepts.length, 0) / attempts.length;
    
    // Estimate CEFR progress based on concept mastery
    // Assume 10 concepts per sub-level (A1.1 → A1.2 = 0.1 progress)
    return Math.min(averageMastery / 10, 1);
  }
  
  /**
   * Identify quality issues
   */
  private static identifyQualityIssues(
    scores: Record<string, number>,
    usageData: ContentUsageData
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const attempts = usageData.learnerAttempts;
    
    // Check each dimension for issues
    Object.entries(scores).forEach(([dimension, score]) => {
      if (score < 50) {
        issues.push({
          severity: 'CRITICAL',
          category: dimension as QualityDimension,
          description: `${dimension} score is critically low (${score.toFixed(1)})`,
          impact: 'Major negative impact on learning outcomes',
          suggestedFix: this.getSuggestedFix(dimension, score, usageData),
          affectedLearners: attempts.length
        });
      } else if (score < 70) {
        issues.push({
          severity: 'HIGH',
          category: dimension as QualityDimension,
          description: `${dimension} score below target (${score.toFixed(1)})`,
          impact: 'Reduced learning effectiveness',
          suggestedFix: this.getSuggestedFix(dimension, score, usageData),
          affectedLearners: Math.floor(attempts.length * 0.7)
        });
      }
    });
    
    // Check specific performance issues
    const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
    if (avgAccuracy < 60) {
      issues.push({
        severity: 'HIGH',
        category: QualityDimension.DIFFICULTY_APPROPRIATENESS,
        description: `Average accuracy too low (${avgAccuracy.toFixed(1)}%)`,
        impact: 'Learners experiencing frustration',
        suggestedFix: 'Reduce content difficulty or add scaffolding',
        affectedLearners: attempts.filter(a => a.accuracy < 60).length
      });
    }
    
    const completionRate = attempts.filter(a => a.completed).length / attempts.length * 100;
    if (completionRate < 70) {
      issues.push({
        severity: 'MEDIUM',
        category: QualityDimension.ENGAGEMENT,
        description: `Low completion rate (${completionRate.toFixed(1)}%)`,
        impact: 'Content not holding learner attention',
        suggestedFix: 'Improve engagement elements or reduce length',
        affectedLearners: attempts.filter(a => !a.completed).length
      });
    }
    
    return issues;
  }
  
  /**
   * Generate recommendations based on quality analysis
   */
  private static generateRecommendations(issues: QualityIssue[], usageData: ContentUsageData): string[] {
    const recommendations: string[] = [];
    const attempts = usageData.learnerAttempts;
    
    // Priority recommendations based on critical issues
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      recommendations.push('🚨 URGENT: Address critical quality issues immediately');
      criticalIssues.forEach(issue => {
        recommendations.push(`• ${issue.suggestedFix}`);
      });
    }
    
    // Specific improvement recommendations
    const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
    if (avgAccuracy < 70) {
      recommendations.push('📉 Consider reducing difficulty or adding more guidance');
    } else if (avgAccuracy > 90) {
      recommendations.push('📈 Content may be too easy - consider increasing challenge');
    }
    
    const completionRate = attempts.filter(a => a.completed).length / attempts.length * 100;
    if (completionRate < 80) {
      recommendations.push('⏱️ Analyze dropout points and reduce content length or complexity');
    }
    
    const vocabularyLearned = usageData.vocabularyInteractions.filter(v => v.wasLearned).length;
    if (vocabularyLearned < 3) {
      recommendations.push('📚 Add more vocabulary learning opportunities');
    }
    
    // IELTS-specific recommendations
    const feedback = usageData.feedbackSubmissions;
    const relevanceRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.relevance, 0) / feedback.length 
      : 3;
    
    if (relevanceRating < 3.5) {
      recommendations.push('🎯 Strengthen connection to IELTS exam format and skills');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Content quality meets standards - monitor ongoing performance');
    }
    
    return recommendations;
  }
  
  /**
   * Get suggested fix for quality issues
   */
  private static getSuggestedFix(dimension: string, score: number, usageData: ContentUsageData): string {
    const attempts = usageData.learnerAttempts;
    
    switch (dimension) {
      case 'educationalEffectiveness':
        return score < 50 
          ? 'Redesign learning objectives and add assessment activities'
          : 'Improve concept explanations and add practice exercises';
          
      case 'engagement':
        return score < 50
          ? 'Add interactive elements and gamification features'
          : 'Optimize content length and add variety in activities';
          
      case 'difficultyAppropriateness':
        const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
        return avgAccuracy < 60
          ? 'Reduce difficulty and add scaffolding support'
          : 'Adjust difficulty calibration based on learner performance';
          
      case 'ieltsRelevance':
        return 'Align content with IELTS task types and assessment criteria';
        
      case 'learningProgression':
        return 'Improve skill building sequence and add progress indicators';
        
      case 'accessibility':
        return 'Optimize for different skill levels and learning preferences';
        
      default:
        return 'Review and optimize content based on learner feedback';
    }
  }
  
  /**
   * Validate usage data input
   */
  private static validateUsageData(usageData: ContentUsageData): void {
    if (!usageData || typeof usageData !== 'object') {
      throw new ValidationError('Usage data must be an object', 'usageData', usageData);
    }
    
    if (!Array.isArray(usageData.learnerAttempts)) {
      throw new ValidationError('Learner attempts must be an array', 'learnerAttempts', usageData.learnerAttempts);
    }
    
    if (!Array.isArray(usageData.vocabularyInteractions)) {
      throw new ValidationError('Vocabulary interactions must be an array', 'vocabularyInteractions', usageData.vocabularyInteractions);
    }
    
    if (!Array.isArray(usageData.feedbackSubmissions)) {
      throw new ValidationError('Feedback submissions must be an array', 'feedbackSubmissions', usageData.feedbackSubmissions);
    }
    
    if (!Array.isArray(usageData.completionData)) {
      throw new ValidationError('Completion data must be an array', 'completionData', usageData.completionData);
    }
  }
}