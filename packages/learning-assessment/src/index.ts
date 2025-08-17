/**
 * @elt/learning-assessment - Content Quality and Curriculum Alignment
 * 
 * Content quality evaluation and CEFR-IELTS curriculum alignment systems
 * for educational content assessment.
 */

// Content Quality Assessment
export * from './contentQualityMetrics';

// CEFR-IELTS Curriculum Alignment
export * from './curriculumAlignment';

// Note: Shared types cause conflicts and will be refactored
// export type * from './shared/types';
export { LearningValidation, ValidationError } from './shared/validation';

// Assessment constants
export const ASSESSMENT_CONSTANTS = {
  QUALITY_METRICS: {
    MIN_SAMPLE_SIZE: 10,
    QUALITY_WEIGHTS: {
      educationalEffectiveness: 0.25,
      engagement: 0.15,
      difficultyAppropriateness: 0.20,
      ieltsRelevance: 0.20,
      learningProgression: 0.15,
      accessibility: 0.05
    },
    SCORE_THRESHOLDS: {
      EXCELLENT: 85,
      GOOD: 70,
      NEEDS_IMPROVEMENT: 50,
      POOR: 30
    }
  },
  IELTS_MAPPING: {
    BAND_6_REQUIREMENTS: {
      vocabularySize: 8000,
      grammarComplexity: 8,
      taskTypes: ['TASK_2_ESSAY', 'PART_3_DISCUSSION', 'TRUE_FALSE_NOT_GIVEN']
    },
    BAND_7_REQUIREMENTS: {
      vocabularySize: 12000,
      grammarComplexity: 9,
      taskTypes: ['TASK_2_ESSAY', 'PART_3_DISCUSSION', 'SUMMARY_COMPLETION']
    }
  },
  CEFR_STANDARDS: {
    A1: { vocabularyRange: 1500, grammarComplexity: 2 },
    A2: { vocabularyRange: 3000, grammarComplexity: 4 },
    B1: { vocabularyRange: 5000, grammarComplexity: 6 },
    B2: { vocabularyRange: 8000, grammarComplexity: 8 },
    C1: { vocabularyRange: 12000, grammarComplexity: 9 },
    C2: { vocabularyRange: 15000, grammarComplexity: 10 }
  }
} as const;

// Assessment utilities
export const ASSESSMENT_UTILS = {
  /**
   * Map IELTS band score to CEFR level
   */
  mapIELTSToCEFR: (band: number): keyof typeof ASSESSMENT_CONSTANTS.CEFR_STANDARDS => {
    if (band >= 8.5) return 'C2';
    if (band >= 7.0) return 'C1';
    if (band >= 5.5) return 'B2';
    if (band >= 4.5) return 'B1';
    if (band >= 4.0) return 'A2';
    return 'A1';
  },

  /**
   * Calculate weighted quality score
   */
  calculateQualityScore: (scores: Record<string, number>): number => {
    const weights = ASSESSMENT_CONSTANTS.QUALITY_METRICS.QUALITY_WEIGHTS;
    return Object.entries(scores).reduce((total, [dimension, score]) => {
      const weight = weights[dimension as keyof typeof weights] || 0;
      return total + (score * weight);
    }, 0);
  },

  /**
   * Determine quality grade from score
   */
  getQualityGrade: (score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' => {
    const thresholds = ASSESSMENT_CONSTANTS.QUALITY_METRICS.SCORE_THRESHOLDS;
    if (score >= 95) return 'A+';
    if (score >= thresholds.EXCELLENT) return 'A';
    if (score >= thresholds.GOOD) return 'B';
    if (score >= thresholds.NEEDS_IMPROVEMENT) return 'C';
    if (score >= thresholds.POOR) return 'D';
    return 'F';
  },

  /**
   * Validate content alignment with CEFR level
   */
  validateCEFRAlignment: (content: any, targetLevel: keyof typeof ASSESSMENT_CONSTANTS.CEFR_STANDARDS): boolean => {
    const standard = ASSESSMENT_CONSTANTS.CEFR_STANDARDS[targetLevel];
    const vocabularyCount = content.vocabularyWords?.length || 0;
    const expectedVocabPerLesson = standard.vocabularyRange * 0.01; // 1% of total range
    
    return vocabularyCount >= expectedVocabPerLesson * 0.8; // 80% threshold
  }
} as const;