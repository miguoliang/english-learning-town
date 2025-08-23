/**
 * CEFR-IELTS Hybrid Curriculum Alignment System
 * Maps educational content to CEFR levels with IELTS Band 6+ focus
 * Target: B1 Foundation → B2 Proficiency → C1 Mastery for IELTS success
 */

export const CEFRLevel = {
  A1: "A1", // Beginner
  A2: "A2", // Elementary
  B1: "B1", // Intermediate (IELTS 4.0-5.0)
  B2: "B2", // Upper Intermediate (IELTS 5.5-6.5)
  C1: "C1", // Advanced (IELTS 7.0-8.0)
  C2: "C2", // Proficiency (IELTS 8.5-9.0)
} as const;

export type CEFRLevel = (typeof CEFRLevel)[keyof typeof CEFRLevel];

export const IELTSBand = {
  BAND_4_0: 4.0,
  BAND_4_5: 4.5,
  BAND_5_0: 5.0,
  BAND_5_5: 5.5,
  BAND_6_0: 6.0, // Target minimum
  BAND_6_5: 6.5,
  BAND_7_0: 7.0,
  BAND_7_5: 7.5,
  BAND_8_0: 8.0,
  BAND_8_5: 8.5,
  BAND_9_0: 9.0,
} as const;

export type IELTSBand = (typeof IELTSBand)[keyof typeof IELTSBand];

export interface CurriculumStandard {
  cefrLevel: CEFRLevel;
  ieltsEquivalent: IELTSBand[];
  skillFocus: LanguageSkill[];
  vocabularyRange: number; // Expected vocabulary size
  grammarComplexity: number; // 1-10 scale
  taskTypes: IELTSTaskType[];
  learningObjectives: string[];
  assessmentCriteria: AssessmentCriterion[];
}

export const LanguageSkill = {
  LISTENING: "LISTENING",
  READING: "READING",
  WRITING: "WRITING",
  SPEAKING: "SPEAKING",
  VOCABULARY: "VOCABULARY",
  GRAMMAR: "GRAMMAR",
  PRONUNCIATION: "PRONUNCIATION",
} as const;

export type LanguageSkill = (typeof LanguageSkill)[keyof typeof LanguageSkill];

export const IELTSTaskType = {
  // Listening
  FORM_COMPLETION: "FORM_COMPLETION",
  NOTE_COMPLETION: "NOTE_COMPLETION",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  MATCHING: "MATCHING",

  // Reading
  TRUE_FALSE_NOT_GIVEN: "TRUE_FALSE_NOT_GIVEN",
  YES_NO_NOT_GIVEN: "YES_NO_NOT_GIVEN",
  SUMMARY_COMPLETION: "SUMMARY_COMPLETION",
  HEADING_MATCHING: "HEADING_MATCHING",

  // Writing
  TASK_1_GRAPH: "TASK_1_GRAPH",
  TASK_1_MAP: "TASK_1_MAP",
  TASK_1_PROCESS: "TASK_1_PROCESS",
  TASK_2_ESSAY: "TASK_2_ESSAY",

  // Speaking
  PART_1_INTRODUCTION: "PART_1_INTRODUCTION",
  PART_2_LONG_TURN: "PART_2_LONG_TURN",
  PART_3_DISCUSSION: "PART_3_DISCUSSION",
} as const;

export type IELTSTaskType = (typeof IELTSTaskType)[keyof typeof IELTSTaskType];

export interface AssessmentCriterion {
  skill: LanguageSkill;
  descriptor: string;
  proficiencyMarkers: string[];
  commonErrors: string[];
  improvementStrategies: string[];
}

export class CurriculumAlignmentEngine {
  /**
   * CEFR-IELTS Curriculum Standards Mapping
   * Focused on B1→B2→C1 progression for IELTS Band 6+ achievement
   */
  private static readonly CURRICULUM_STANDARDS: Record<
    CEFRLevel,
    CurriculumStandard
  > = {
    [CEFRLevel.A1]: {
      cefrLevel: CEFRLevel.A1,
      ieltsEquivalent: [IELTSBand.BAND_4_0],
      skillFocus: [LanguageSkill.VOCABULARY, LanguageSkill.SPEAKING],
      vocabularyRange: 1500,
      grammarComplexity: 2,
      taskTypes: [IELTSTaskType.PART_1_INTRODUCTION],
      learningObjectives: [
        "Master basic greetings and introductions",
        "Use present simple tense accurately",
        "Build core vocabulary of 1500 words",
        "Express basic needs and preferences",
      ],
      assessmentCriteria: [],
    },

    [CEFRLevel.A2]: {
      cefrLevel: CEFRLevel.A2,
      ieltsEquivalent: [IELTSBand.BAND_4_5],
      skillFocus: [
        LanguageSkill.VOCABULARY,
        LanguageSkill.SPEAKING,
        LanguageSkill.READING,
      ],
      vocabularyRange: 3000,
      grammarComplexity: 4,
      taskTypes: [
        IELTSTaskType.PART_1_INTRODUCTION,
        IELTSTaskType.FORM_COMPLETION,
      ],
      learningObjectives: [
        "Communicate in routine tasks",
        "Use past and future tenses",
        "Understand simple texts",
        "Express opinions simply",
      ],
      assessmentCriteria: [],
    },

    [CEFRLevel.B1]: {
      cefrLevel: CEFRLevel.B1,
      ieltsEquivalent: [
        IELTSBand.BAND_4_5,
        IELTSBand.BAND_5_0,
        IELTSBand.BAND_5_5,
      ],
      skillFocus: [
        LanguageSkill.READING,
        LanguageSkill.WRITING,
        LanguageSkill.LISTENING,
      ],
      vocabularyRange: 5000,
      grammarComplexity: 6,
      taskTypes: [
        IELTSTaskType.MULTIPLE_CHOICE,
        IELTSTaskType.TRUE_FALSE_NOT_GIVEN,
        IELTSTaskType.PART_2_LONG_TURN,
        IELTSTaskType.TASK_1_GRAPH,
      ],
      learningObjectives: [
        "IELTS Foundation: Handle basic academic tasks",
        "Write structured paragraphs with clear main ideas",
        "Understand academic texts with familiar topics",
        "Participate in discussions on familiar subjects",
        "Use complex sentence structures with subordinate clauses",
      ],
      assessmentCriteria: [
        {
          skill: LanguageSkill.WRITING,
          descriptor: "Basic academic writing with clear structure",
          proficiencyMarkers: [
            "Uses topic sentences effectively",
            "Connects ideas with basic linking words",
            "Maintains consistent tense usage",
            "Expresses main ideas clearly",
          ],
          commonErrors: [
            "Limited vocabulary range",
            "Simple sentence structures",
            "Basic linking words only",
          ],
          improvementStrategies: [
            "Practice complex sentence formation",
            "Expand academic vocabulary",
            "Study model essays",
          ],
        },
      ],
    },

    [CEFRLevel.B2]: {
      cefrLevel: CEFRLevel.B2,
      ieltsEquivalent: [
        IELTSBand.BAND_5_5,
        IELTSBand.BAND_6_0,
        IELTSBand.BAND_6_5,
      ],
      skillFocus: [
        LanguageSkill.WRITING,
        LanguageSkill.READING,
        LanguageSkill.SPEAKING,
        LanguageSkill.LISTENING,
      ],
      vocabularyRange: 8000,
      grammarComplexity: 8,
      taskTypes: [
        IELTSTaskType.TASK_2_ESSAY,
        IELTSTaskType.SUMMARY_COMPLETION,
        IELTSTaskType.PART_3_DISCUSSION,
        IELTSTaskType.YES_NO_NOT_GIVEN,
        IELTSTaskType.HEADING_MATCHING,
      ],
      learningObjectives: [
        "IELTS Target (Band 6): Master core academic skills",
        "Write well-structured essays with clear arguments",
        "Understand complex academic texts efficiently",
        "Express detailed opinions with supporting evidence",
        "Handle abstract topics in discussions",
        "Use advanced grammar structures accurately",
      ],
      assessmentCriteria: [
        {
          skill: LanguageSkill.WRITING,
          descriptor: "Academic writing with clear arguments and evidence",
          proficiencyMarkers: [
            "Presents clear position with relevant examples",
            "Uses variety of complex sentences",
            "Demonstrates good vocabulary range",
            "Organizes ideas logically with effective transitions",
          ],
          commonErrors: [
            "Occasional grammatical errors",
            "Some inappropriate word choices",
            "Repetitive sentence structures",
          ],
          improvementStrategies: [
            "Practice argumentative essays",
            "Study advanced linking phrases",
            "Expand academic vocabulary systematically",
          ],
        },
        {
          skill: LanguageSkill.SPEAKING,
          descriptor: "Fluent discussion of abstract topics",
          proficiencyMarkers: [
            "Maintains fluency with minimal hesitation",
            "Uses wide range of vocabulary accurately",
            "Employs various grammatical structures",
            "Develops topics with relevant details",
          ],
          commonErrors: [
            "Some pronunciation issues",
            "Occasional word-finding difficulties",
            "Limited use of idiomatic expressions",
          ],
          improvementStrategies: [
            "Practice speaking on abstract topics",
            "Record and analyze speaking performance",
            "Focus on pronunciation patterns",
          ],
        },
      ],
    },

    [CEFRLevel.C1]: {
      cefrLevel: CEFRLevel.C1,
      ieltsEquivalent: [
        IELTSBand.BAND_7_0,
        IELTSBand.BAND_7_5,
        IELTSBand.BAND_8_0,
      ],
      skillFocus: [
        LanguageSkill.WRITING,
        LanguageSkill.SPEAKING,
        LanguageSkill.READING,
        LanguageSkill.VOCABULARY,
      ],
      vocabularyRange: 12000,
      grammarComplexity: 9,
      taskTypes: [
        IELTSTaskType.TASK_2_ESSAY,
        IELTSTaskType.PART_3_DISCUSSION,
        IELTSTaskType.SUMMARY_COMPLETION,
        IELTSTaskType.TASK_1_PROCESS,
      ],
      learningObjectives: [
        "IELTS Excellence (Band 7+): Advanced academic proficiency",
        "Produce sophisticated academic writing",
        "Understand implicit meaning in complex texts",
        "Express nuanced ideas with precision",
        "Handle specialized academic topics confidently",
        "Use advanced discourse markers effectively",
      ],
      assessmentCriteria: [
        {
          skill: LanguageSkill.WRITING,
          descriptor: "Sophisticated academic writing with nuanced arguments",
          proficiencyMarkers: [
            "Presents sophisticated arguments with precise evidence",
            "Uses wide range of advanced vocabulary naturally",
            "Demonstrates mastery of complex grammatical structures",
            "Shows clear awareness of reader and purpose",
          ],
          commonErrors: [
            "Rare minor grammatical slips",
            "Occasional overuse of complex structures",
          ],
          improvementStrategies: [
            "Refine argument development techniques",
            "Practice concise expression",
            "Study academic writing conventions",
          ],
        },
      ],
    },

    [CEFRLevel.C2]: {
      cefrLevel: CEFRLevel.C2,
      ieltsEquivalent: [IELTSBand.BAND_8_5, IELTSBand.BAND_9_0],
      skillFocus: [
        LanguageSkill.WRITING,
        LanguageSkill.SPEAKING,
        LanguageSkill.READING,
        LanguageSkill.VOCABULARY,
      ],
      vocabularyRange: 15000,
      grammarComplexity: 10,
      taskTypes: [
        IELTSTaskType.TASK_2_ESSAY,
        IELTSTaskType.PART_3_DISCUSSION,
        IELTSTaskType.SUMMARY_COMPLETION,
      ],
      learningObjectives: [
        "IELTS Mastery (Band 8.5+): Near-native proficiency",
        "Produce publication-quality academic writing",
        "Understand subtle implications and attitudes",
        "Express complex ideas with complete fluency",
        "Master all aspects of English usage",
      ],
      assessmentCriteria: [],
    },
  };

  /**
   * Get curriculum standard for specific CEFR level
   */
  static getCurriculumStandard(level: CEFRLevel): CurriculumStandard {
    return this.CURRICULUM_STANDARDS[level];
  }

  /**
   * Map IELTS band score to CEFR level
   */
  static mapIELTSToCEFR(band: IELTSBand): CEFRLevel {
    if (band >= IELTSBand.BAND_8_5) return CEFRLevel.C2;
    if (band >= IELTSBand.BAND_7_0) return CEFRLevel.C1;
    if (band >= IELTSBand.BAND_5_5) return CEFRLevel.B2;
    if (band >= IELTSBand.BAND_4_5) return CEFRLevel.B1;
    if (band >= IELTSBand.BAND_4_0) return CEFRLevel.A2;
    return CEFRLevel.A1;
  }

  /**
   * Get target IELTS band range for CEFR level
   */
  static getTargetIELTSRange(level: CEFRLevel): IELTSBand[] {
    return this.CURRICULUM_STANDARDS[level].ieltsEquivalent;
  }

  /**
   * Assess learner's current CEFR level based on vocabulary and performance
   */
  static assessCurrentLevel(
    vocabularySize: number,
    grammarAccuracy: number,
    recentPerformance: number[],
  ): CEFRLevel {
    const averagePerformance =
      recentPerformance.length > 0
        ? recentPerformance.reduce((a, b) => a + b) / recentPerformance.length
        : 0;

    // Combined scoring: vocabulary (40%) + grammar (30%) + performance (30%)
    const combinedScore =
      (vocabularySize / 15000) * 0.4 +
      (grammarAccuracy / 100) * 0.3 +
      (averagePerformance / 100) * 0.3;

    if (combinedScore >= 0.85) return CEFRLevel.C2;
    if (combinedScore >= 0.7) return CEFRLevel.C1;
    if (combinedScore >= 0.55) return CEFRLevel.B2;
    if (combinedScore >= 0.4) return CEFRLevel.B1;
    if (combinedScore >= 0.25) return CEFRLevel.A2;
    return CEFRLevel.A1;
  }

  /**
   * Generate learning pathway for IELTS Band 6+ achievement
   */
  static generateIELTSPathway(
    currentLevel: CEFRLevel,
    targetBand: IELTSBand,
  ): {
    currentStandard: CurriculumStandard;
    targetStandard: CurriculumStandard;
    milestones: CurriculumStandard[];
    estimatedTimeWeeks: number;
    keyFocusAreas: LanguageSkill[];
    priorityTasks: IELTSTaskType[];
  } {
    const targetLevel = this.mapIELTSToCEFR(targetBand);
    const currentStandard = this.getCurriculumStandard(currentLevel);
    const targetStandard = this.getCurriculumStandard(targetLevel);

    // Generate progression milestones
    const allLevels = [
      CEFRLevel.A1,
      CEFRLevel.A2,
      CEFRLevel.B1,
      CEFRLevel.B2,
      CEFRLevel.C1,
      CEFRLevel.C2,
    ];
    const currentIndex = allLevels.indexOf(currentLevel);
    const targetIndex = allLevels.indexOf(targetLevel);

    const milestones = allLevels
      .slice(currentIndex, targetIndex + 1)
      .map((level) => this.getCurriculumStandard(level));

    // Estimate time based on level difference (8-12 weeks per level)
    const levelDifference = targetIndex - currentIndex;
    const estimatedTimeWeeks = Math.max(4, levelDifference * 10);

    // Key focus areas for IELTS success
    const keyFocusAreas: LanguageSkill[] = [
      LanguageSkill.WRITING, // Critical for IELTS
      LanguageSkill.SPEAKING, // Often challenging
      LanguageSkill.VOCABULARY, // Foundation for all skills
      LanguageSkill.READING, // Academic comprehension
    ];

    // Priority IELTS task types for Band 6+
    const priorityTasks: IELTSTaskType[] = [
      IELTSTaskType.TASK_2_ESSAY, // Writing Task 2 (most important)
      IELTSTaskType.PART_3_DISCUSSION, // Speaking Part 3 (advanced)
      IELTSTaskType.TRUE_FALSE_NOT_GIVEN, // Reading comprehension
      IELTSTaskType.SUMMARY_COMPLETION, // Academic reading skills
    ];

    return {
      currentStandard,
      targetStandard,
      milestones,
      estimatedTimeWeeks,
      keyFocusAreas,
      priorityTasks,
    };
  }

  /**
   * Validate if content aligns with CEFR standard
   */
  static validateContentAlignment(
    content: {
      vocabularyWords: string[];
      grammarStructures: string[];
      taskTypes: IELTSTaskType[];
      complexity: number;
    },
    targetLevel: CEFRLevel,
  ): {
    isAligned: boolean;
    alignmentScore: number;
    recommendations: string[];
  } {
    const standard = this.getCurriculumStandard(targetLevel);

    let alignmentScore = 0;
    const recommendations: string[] = [];

    // Check vocabulary alignment (25%) - Use smaller target per lesson
    const vocabTarget = Math.max(5, standard.vocabularyRange * 0.01); // 1% of total vocabulary range
    const vocabAlignment = Math.min(
      1,
      content.vocabularyWords.length / vocabTarget,
    );
    alignmentScore += vocabAlignment * 0.25;

    if (vocabAlignment < 0.8) {
      recommendations.push(
        `Increase vocabulary range to match ${standard.cefrLevel} level (target: ${Math.round(vocabTarget)} words per lesson)`,
      );
    }

    // Check grammar complexity (25%)
    const grammarAlignment = Math.min(
      1,
      content.complexity / standard.grammarComplexity,
    );
    alignmentScore += grammarAlignment * 0.25;

    if (grammarAlignment < 0.8) {
      recommendations.push(
        `Increase grammar complexity to level ${standard.grammarComplexity}/10`,
      );
    }

    // Check task type relevance (25%)
    const relevantTasks = content.taskTypes.filter((task) =>
      standard.taskTypes.includes(task),
    );
    const taskAlignment =
      standard.taskTypes.length > 0
        ? relevantTasks.length / standard.taskTypes.length
        : 1;
    alignmentScore += Math.min(taskAlignment, 1) * 0.25;

    if (taskAlignment < 0.5) {
      recommendations.push(
        `Include more relevant IELTS task types: ${standard.taskTypes.join(", ")}`,
      );
    }

    // Check skill focus alignment (25%) - Give full score if has essential skills
    const hasWriting = content.taskTypes.some(
      (task) =>
        task === IELTSTaskType.TASK_2_ESSAY ||
        task === IELTSTaskType.TASK_1_GRAPH,
    );
    const hasSpeaking = content.taskTypes.some(
      (task) =>
        task === IELTSTaskType.PART_3_DISCUSSION ||
        task === IELTSTaskType.PART_2_LONG_TURN,
    );
    const skillScore = (hasWriting ? 0.5 : 0) + (hasSpeaking ? 0.5 : 0);
    alignmentScore += skillScore * 0.25;

    const isAligned = alignmentScore >= 0.7;

    if (!isAligned) {
      recommendations.unshift(
        `Content alignment score: ${Math.round(alignmentScore * 100)}% (target: 70%+)`,
      );
    }

    return {
      isAligned,
      alignmentScore: Math.round(alignmentScore * 100),
      recommendations,
    };
  }
}
