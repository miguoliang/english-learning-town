/**
 * Comprehensive tests for CEFR-IELTS Curriculum Alignment System
 * Tests curriculum standards, level assessment, and content validation
 */

import { 
  CurriculumAlignmentEngine, 
  CEFRLevel, 
  IELTSBand, 
  LanguageSkill,
  IELTSTaskType 
} from '../curriculumAlignment';

describe('CurriculumAlignmentEngine', () => {
  
  describe('CEFR-IELTS Mapping', () => {
    it('should correctly map IELTS bands to CEFR levels', () => {
      expect(CurriculumAlignmentEngine.mapIELTSToCEFR(IELTSBand.BAND_4_0)).toBe(CEFRLevel.A2);
      expect(CurriculumAlignmentEngine.mapIELTSToCEFR(IELTSBand.BAND_5_5)).toBe(CEFRLevel.B2);
      expect(CurriculumAlignmentEngine.mapIELTSToCEFR(IELTSBand.BAND_6_0)).toBe(CEFRLevel.B2);
      expect(CurriculumAlignmentEngine.mapIELTSToCEFR(IELTSBand.BAND_6_5)).toBe(CEFRLevel.B2);
      expect(CurriculumAlignmentEngine.mapIELTSToCEFR(IELTSBand.BAND_7_0)).toBe(CEFRLevel.C1);
      expect(CurriculumAlignmentEngine.mapIELTSToCEFR(IELTSBand.BAND_8_5)).toBe(CEFRLevel.C2);
    });

    it('should return correct IELTS equivalent ranges for CEFR levels', () => {
      const b2Range = CurriculumAlignmentEngine.getTargetIELTSRange(CEFRLevel.B2);
      expect(b2Range).toContain(IELTSBand.BAND_6_0);
      expect(b2Range).toContain(IELTSBand.BAND_6_5);
      
      const c1Range = CurriculumAlignmentEngine.getTargetIELTSRange(CEFRLevel.C1);
      expect(c1Range).toContain(IELTSBand.BAND_7_0);
    });
  });

  describe('Curriculum Standards', () => {
    it('should provide complete curriculum standard for B2 level', () => {
      const b2Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      
      expect(b2Standard.cefrLevel).toBe(CEFRLevel.B2);
      expect(b2Standard.ieltsEquivalent).toContain(IELTSBand.BAND_6_0);
      expect(b2Standard.vocabularyRange).toBe(8000);
      expect(b2Standard.grammarComplexity).toBe(8);
      expect(b2Standard.skillFocus).toContain(LanguageSkill.WRITING);
      expect(b2Standard.taskTypes).toContain(IELTSTaskType.TASK_2_ESSAY);
      expect(b2Standard.learningObjectives).toContain(
        'IELTS Target (Band 6): Master core academic skills'
      );
    });

    it('should provide assessment criteria for B2 writing skills', () => {
      const b2Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      const writingCriteria = b2Standard.assessmentCriteria.find(
        criteria => criteria.skill === LanguageSkill.WRITING
      );
      
      expect(writingCriteria).toBeDefined();
      expect(writingCriteria!.proficiencyMarkers).toContain(
        'Presents clear position with relevant examples'
      );
      expect(writingCriteria!.improvementStrategies).toContain(
        'Practice argumentative essays'
      );
    });

    it('should have progressive vocabulary requirements', () => {
      const a1 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.A1);
      const b1 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B1);
      const b2 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      const c1 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.C1);
      
      expect(a1.vocabularyRange).toBeLessThan(b1.vocabularyRange);
      expect(b1.vocabularyRange).toBeLessThan(b2.vocabularyRange);
      expect(b2.vocabularyRange).toBeLessThan(c1.vocabularyRange);
      
      // Specific expectations for IELTS preparation
      expect(b2.vocabularyRange).toBe(8000);  // Band 6 target
      expect(c1.vocabularyRange).toBe(12000); // Band 7+ target
    });

    it('should have progressive grammar complexity', () => {
      const a1 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.A1);
      const b2 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      const c1 = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.C1);
      
      expect(a1.grammarComplexity).toBeLessThan(b2.grammarComplexity);
      expect(b2.grammarComplexity).toBeLessThan(c1.grammarComplexity);
    });
  });

  describe('Level Assessment', () => {
    it('should assess beginner level correctly', () => {
      const level = CurriculumAlignmentEngine.assessCurrentLevel(
        800,   // vocabulary size (lower for A1)
        45,    // grammar accuracy (lower for A1)
        [30, 35, 25] // recent performance (lower for A1)
      );
      
      expect(level).toBe(CEFRLevel.A1);
    });

    it('should assess intermediate level correctly', () => {
      const level = CurriculumAlignmentEngine.assessCurrentLevel(
        4000,  // vocabulary size
        75,    // grammar accuracy  
        [65, 70, 68] // recent performance
      );
      
      expect(level).toBe(CEFRLevel.B1);
    });

    it('should assess IELTS Band 6 level correctly', () => {
      const level = CurriculumAlignmentEngine.assessCurrentLevel(
        7500,  // vocabulary size
        80,    // grammar accuracy
        [75, 78, 72] // recent performance
      );
      
      expect(level).toBe(CEFRLevel.B2);
    });

    it('should assess advanced level correctly', () => {
      const level = CurriculumAlignmentEngine.assessCurrentLevel(
        11000, // vocabulary size
        88,    // grammar accuracy
        [85, 87, 83] // recent performance
      );
      
      expect(level).toBe(CEFRLevel.C1);
    });

    it('should handle edge cases for assessment', () => {
      // No performance data
      const levelNoPerf = CurriculumAlignmentEngine.assessCurrentLevel(5000, 80, []);
      expect([CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2]).toContain(levelNoPerf);
      
      // Perfect scores
      const levelPerfect = CurriculumAlignmentEngine.assessCurrentLevel(15000, 100, [100, 100, 100]);
      expect(levelPerfect).toBe(CEFRLevel.C2);
      
      // Very low scores
      const levelLow = CurriculumAlignmentEngine.assessCurrentLevel(500, 30, [20, 25, 15]);
      expect(levelLow).toBe(CEFRLevel.A1);
    });
  });

  describe('IELTS Learning Pathway Generation', () => {
    it('should generate realistic pathway from B1 to Band 6.5', () => {
      const pathway = CurriculumAlignmentEngine.generateIELTSPathway(
        CEFRLevel.B1, 
        IELTSBand.BAND_6_5
      );
      
      expect(pathway.currentStandard.cefrLevel).toBe(CEFRLevel.B1);
      expect(pathway.targetStandard.cefrLevel).toBe(CEFRLevel.B2);
      expect(pathway.milestones).toHaveLength(2); // B1 → B2
      expect(pathway.estimatedTimeWeeks).toBeGreaterThan(8);
      expect(pathway.estimatedTimeWeeks).toBeLessThan(15);
      
      // Should focus on critical IELTS skills
      expect(pathway.keyFocusAreas).toContain(LanguageSkill.WRITING);
      expect(pathway.keyFocusAreas).toContain(LanguageSkill.SPEAKING);
      expect(pathway.priorityTasks).toContain(IELTSTaskType.TASK_2_ESSAY);
    });

    it('should generate pathway from A2 to Band 7.0', () => {
      const pathway = CurriculumAlignmentEngine.generateIELTSPathway(
        CEFRLevel.A2, 
        IELTSBand.BAND_7_0
      );
      
      expect(pathway.currentStandard.cefrLevel).toBe(CEFRLevel.A2);
      expect(pathway.targetStandard.cefrLevel).toBe(CEFRLevel.C1);
      expect(pathway.milestones).toHaveLength(4); // A2 → B1 → B2 → C1
      expect(pathway.estimatedTimeWeeks).toBeGreaterThan(25);
      expect(pathway.estimatedTimeWeeks).toBeLessThan(35);
    });

    it('should handle same-level pathway', () => {
      const pathway = CurriculumAlignmentEngine.generateIELTSPathway(
        CEFRLevel.B2, 
        IELTSBand.BAND_6_0
      );
      
      expect(pathway.milestones).toHaveLength(1); // Just B2
      expect(pathway.estimatedTimeWeeks).toBe(4); // Minimum time for review
    });

    it('should prioritize IELTS-specific tasks', () => {
      const pathway = CurriculumAlignmentEngine.generateIELTSPathway(
        CEFRLevel.B1, 
        IELTSBand.BAND_6_5
      );
      
      expect(pathway.priorityTasks).toContain(IELTSTaskType.TASK_2_ESSAY);
      expect(pathway.priorityTasks).toContain(IELTSTaskType.PART_3_DISCUSSION);
      expect(pathway.priorityTasks).toContain(IELTSTaskType.TRUE_FALSE_NOT_GIVEN);
      expect(pathway.priorityTasks).toContain(IELTSTaskType.SUMMARY_COMPLETION);
    });
  });

  describe('Content Alignment Validation', () => {
    it('should validate well-aligned B2 content', () => {
      const content = {
        vocabularyWords: Array(90).fill('academic').map((word, i) => `${word}${i}`), // 90 words (more than 80 required)
        grammarStructures: ['complex conditionals', 'passive voice', 'relative clauses'],
        taskTypes: [IELTSTaskType.TASK_2_ESSAY, IELTSTaskType.PART_3_DISCUSSION, IELTSTaskType.YES_NO_NOT_GIVEN, IELTSTaskType.SUMMARY_COMPLETION],
        complexity: 8
      };
      
      const validation = CurriculumAlignmentEngine.validateContentAlignment(content, CEFRLevel.B2);
      
      expect(validation.isAligned).toBe(true);
      expect(validation.alignmentScore).toBeGreaterThan(70);
      expect(validation.recommendations.length).toBeLessThanOrEqual(1);
    });

    it('should identify under-aligned content', () => {
      const content = {
        vocabularyWords: ['hello', 'good', 'nice'],
        grammarStructures: ['present simple'],
        taskTypes: [IELTSTaskType.PART_1_INTRODUCTION],
        complexity: 3
      };
      
      const validation = CurriculumAlignmentEngine.validateContentAlignment(content, CEFRLevel.B2);
      
      expect(validation.isAligned).toBe(false);
      expect(validation.alignmentScore).toBeLessThan(70);
      expect(validation.recommendations.length).toBeGreaterThan(0);
      expect(validation.recommendations.some(rec => rec.includes('vocabulary'))).toBe(true);
      expect(validation.recommendations.some(rec => rec.includes('complexity'))).toBe(true);
    });

    it('should provide specific improvement recommendations', () => {
      const content = {
        vocabularyWords: ['cat', 'dog'],
        grammarStructures: ['present simple'],
        taskTypes: [IELTSTaskType.PART_1_INTRODUCTION],
        complexity: 2
      };
      
      const validation = CurriculumAlignmentEngine.validateContentAlignment(content, CEFRLevel.C1);
      
      // Check that recommendations include relevant improvements
      expect(validation.recommendations.length).toBeGreaterThan(0);
      expect(validation.recommendations.some(rec => rec.includes('vocabulary'))).toBe(true);
      expect(validation.recommendations.some(rec => rec.includes('complexity'))).toBe(true);
      expect(validation.recommendations.some(rec => rec.includes('IELTS task types'))).toBe(true);
    });

    it('should handle edge cases in validation', () => {
      // Empty content
      const emptyContent = {
        vocabularyWords: [],
        grammarStructures: [],
        taskTypes: [],
        complexity: 0
      };
      
      const validation = CurriculumAlignmentEngine.validateContentAlignment(emptyContent, CEFRLevel.B1);
      expect(validation.isAligned).toBe(false);
      expect(validation.alignmentScore).toBeLessThan(30);
      
      // Over-complex content for level
      const complexContent = {
        vocabularyWords: Array(2000).fill('word'),
        grammarStructures: ['advanced'],
        taskTypes: [IELTSTaskType.TASK_2_ESSAY],
        complexity: 10
      };
      
      const validationComplex = CurriculumAlignmentEngine.validateContentAlignment(complexContent, CEFRLevel.A1);
      expect(validationComplex.alignmentScore).toBeGreaterThan(50); // Good vocabulary, but too complex
    });
  });

  describe('IELTS Band 6+ Focus', () => {
    it('should emphasize writing skills for Band 6+ preparation', () => {
      const b2Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      const c1Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.C1);
      
      expect(b2Standard.skillFocus).toContain(LanguageSkill.WRITING);
      expect(c1Standard.skillFocus).toContain(LanguageSkill.WRITING);
      
      expect(b2Standard.taskTypes).toContain(IELTSTaskType.TASK_2_ESSAY);
      expect(c1Standard.taskTypes).toContain(IELTSTaskType.TASK_2_ESSAY);
    });

    it('should include academic reading skills for IELTS success', () => {
      const b2Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      
      expect(b2Standard.skillFocus).toContain(LanguageSkill.READING);
      expect(b2Standard.taskTypes).toContain(IELTSTaskType.YES_NO_NOT_GIVEN);
      expect(b2Standard.taskTypes).toContain(IELTSTaskType.SUMMARY_COMPLETION);
    });

    it('should focus on speaking fluency for Band 6+', () => {
      const pathway = CurriculumAlignmentEngine.generateIELTSPathway(
        CEFRLevel.B1, 
        IELTSBand.BAND_6_5
      );
      
      expect(pathway.keyFocusAreas).toContain(LanguageSkill.SPEAKING);
      expect(pathway.priorityTasks).toContain(IELTSTaskType.PART_3_DISCUSSION);
    });

    it('should ensure vocabulary size meets IELTS Band 6+ requirements', () => {
      const b2Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.B2);
      const c1Standard = CurriculumAlignmentEngine.getCurriculumStandard(CEFRLevel.C1);
      
      // Band 6.0-6.5 requires ~8000 words
      expect(b2Standard.vocabularyRange).toBeGreaterThanOrEqual(8000);
      
      // Band 7.0+ requires ~12000 words  
      expect(c1Standard.vocabularyRange).toBeGreaterThanOrEqual(12000);
    });
  });
});