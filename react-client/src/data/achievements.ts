import type { Achievement } from '../types';
import { AchievementType, AchievementRarity } from '../types';

/**
 * Predefined achievements for English Learning Town
 * Designed for kids aged 7-12 with engaging, motivational goals
 */
export const ACHIEVEMENTS: Achievement[] = [
  // VOCABULARY ACHIEVEMENTS
  {
    id: 'first_word',
    title: 'First Steps! 👶',
    description: 'Learn your very first English word!',
    type: AchievementType.VOCABULARY,
    rarity: AchievementRarity.COMMON,
    icon: '🎉',
    xpReward: 50,
    requirement: {
      type: 'vocabulary_count',
      target: 1
    },
    isSecret: false
  },
  {
    id: 'word_collector_10',
    title: 'Word Collector 📚',
    description: 'Collect 10 amazing English words!',
    type: AchievementType.VOCABULARY,
    rarity: AchievementRarity.COMMON,
    icon: '📚',
    xpReward: 100,
    requirement: {
      type: 'vocabulary_count',
      target: 10
    },
    isSecret: false
  },
  {
    id: 'word_master_25',
    title: 'Word Master! ⭐',
    description: 'Wow! You know 25 English words!',
    type: AchievementType.VOCABULARY,
    rarity: AchievementRarity.UNCOMMON,
    icon: '⭐',
    xpReward: 200,
    requirement: {
      type: 'vocabulary_count',
      target: 25
    },
    isSecret: false
  },
  {
    id: 'word_wizard_50',
    title: 'Word Wizard! 🧙‍♂️',
    description: 'Amazing! You\'re a wizard with 50 words!',
    type: AchievementType.VOCABULARY,
    rarity: AchievementRarity.RARE,
    icon: '🧙‍♂️',
    xpReward: 350,
    requirement: {
      type: 'vocabulary_count',
      target: 50
    },
    isSecret: false
  },
  {
    id: 'vocabulary_legend_100',
    title: 'Vocabulary Legend! 🏆',
    description: 'Incredible! You know 100 English words!',
    type: AchievementType.VOCABULARY,
    rarity: AchievementRarity.LEGENDARY,
    icon: '🏆',
    xpReward: 750,
    requirement: {
      type: 'vocabulary_count',
      target: 100
    },
    isSecret: false
  },

  // CONVERSATION ACHIEVEMENTS
  {
    id: 'first_chat',
    title: 'Hello There! 👋',
    description: 'Have your first conversation in English!',
    type: AchievementType.CONVERSATION,
    rarity: AchievementRarity.COMMON,
    icon: '👋',
    xpReward: 75,
    requirement: {
      type: 'dialogue_count',
      target: 1
    },
    isSecret: false
  },
  {
    id: 'chatter_box_5',
    title: 'Chatter Box! 💬',
    description: 'Complete 5 conversations - you love to talk!',
    type: AchievementType.CONVERSATION,
    rarity: AchievementRarity.COMMON,
    icon: '💬',
    xpReward: 150,
    requirement: {
      type: 'dialogue_count',
      target: 5
    },
    isSecret: false
  },
  {
    id: 'social_butterfly_15',
    title: 'Social Butterfly! 🦋',
    description: 'Chat with friends 15 times - so social!',
    type: AchievementType.CONVERSATION,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🦋',
    xpReward: 300,
    requirement: {
      type: 'dialogue_count',
      target: 15
    },
    isSecret: false
  },

  // QUEST ACHIEVEMENTS
  {
    id: 'first_quest',
    title: 'Adventure Begins! 🗺️',
    description: 'Complete your very first quest!',
    type: AchievementType.QUEST,
    rarity: AchievementRarity.COMMON,
    icon: '🗺️',
    xpReward: 100,
    requirement: {
      type: 'quest_count',
      target: 1
    },
    isSecret: false
  },
  {
    id: 'quest_hero_5',
    title: 'Quest Hero! ⚔️',
    description: 'Complete 5 quests like a true hero!',
    type: AchievementType.QUEST,
    rarity: AchievementRarity.UNCOMMON,
    icon: '⚔️',
    xpReward: 250,
    requirement: {
      type: 'quest_count',
      target: 5
    },
    isSecret: false
  },
  {
    id: 'legendary_adventurer_15',
    title: 'Legendary Adventurer! 🌟',
    description: 'Complete 15 quests - you\'re legendary!',
    type: AchievementType.QUEST,
    rarity: AchievementRarity.EPIC,
    icon: '🌟',
    xpReward: 500,
    requirement: {
      type: 'quest_count',
      target: 15
    },
    isSecret: false
  },

  // STREAK ACHIEVEMENTS
  {
    id: 'daily_learner_3',
    title: 'Daily Learner! 📅',
    description: 'Learn English 3 days in a row!',
    type: AchievementType.STREAK,
    rarity: AchievementRarity.COMMON,
    icon: '📅',
    xpReward: 150,
    requirement: {
      type: 'streak_count',
      target: 3
    },
    isSecret: false
  },
  {
    id: 'week_warrior_7',
    title: 'Week Warrior! 🔥',
    description: 'Amazing! 7 days of English learning!',
    type: AchievementType.STREAK,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🔥',
    xpReward: 300,
    requirement: {
      type: 'streak_count',
      target: 7
    },
    isSecret: false
  },
  {
    id: 'unstoppable_14',
    title: 'Unstoppable! ⚡',
    description: 'Incredible! 14 days of non-stop learning!',
    type: AchievementType.STREAK,
    rarity: AchievementRarity.RARE,
    icon: '⚡',
    xpReward: 600,
    requirement: {
      type: 'streak_count',
      target: 14
    },
    isSecret: false
  },

  // MILESTONE ACHIEVEMENTS  
  {
    id: 'level_up_5',
    title: 'Rising Star! 🌠',
    description: 'Reach level 5 - you\'re a star!',
    type: AchievementType.MILESTONE,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🌠',
    xpReward: 250,
    requirement: {
      type: 'level_reached',
      target: 5
    },
    isSecret: false
  },
  {
    id: 'level_up_10',
    title: 'Super Student! 🎓',
    description: 'Level 10 achieved - you\'re super!',
    type: AchievementType.MILESTONE,
    rarity: AchievementRarity.RARE,
    icon: '🎓',
    xpReward: 500,
    requirement: {
      type: 'level_reached',
      target: 10
    },
    isSecret: false
  },
  {
    id: 'level_up_20',
    title: 'English Master! 👑',
    description: 'Level 20! You\'re the master of English!',
    type: AchievementType.MILESTONE,
    rarity: AchievementRarity.EPIC,
    icon: '👑',
    xpReward: 1000,
    requirement: {
      type: 'level_reached',
      target: 20
    },
    isSecret: false
  },

  // SECRET ACHIEVEMENTS
  {
    id: 'speed_learner',
    title: 'Speed Learner! 💨',
    description: 'Learn 5 words in one conversation!',
    type: AchievementType.LEARNING,
    rarity: AchievementRarity.RARE,
    icon: '💨',
    xpReward: 400,
    requirement: {
      type: 'words_per_dialogue',
      target: 5
    },
    isSecret: true
  },
  {
    id: 'night_owl',
    title: 'Night Owl! 🦉',
    description: 'Learn English after 8 PM - dedicated!',
    type: AchievementType.LEARNING,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🦉',
    xpReward: 200,
    requirement: {
      type: 'learning_time',
      target: 20, // 8 PM in 24h format
      data: { timeCondition: 'after' }
    },
    isSecret: true
  },
  {
    id: 'early_bird',
    title: 'Early Bird! 🐦',
    description: 'Learn English before 7 AM - impressive!',
    type: AchievementType.LEARNING,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🐦',
    xpReward: 200,
    requirement: {
      type: 'learning_time',
      target: 7, // 7 AM
      data: { timeCondition: 'before' }
    },
    isSecret: true
  }
];

/**
 * Experience curve for leveling up
 * Designed to be achievable for kids but still rewarding
 */
export const XP_CURVE = {
  // XP required to reach each level (cumulative)
  levelRequirements: [
    0,    // Level 0 (starting)
    100,  // Level 1
    250,  // Level 2
    450,  // Level 3
    700,  // Level 4
    1000, // Level 5
    1350, // Level 6
    1750, // Level 7
    2200, // Level 8
    2700, // Level 9
    3250, // Level 10
    3850, // Level 11
    4500, // Level 12
    5200, // Level 13
    5950, // Level 14
    6750, // Level 15
    7600, // Level 16
    8500, // Level 17
    9450, // Level 18
    10450, // Level 19
    11500, // Level 20
    12600, // Level 21
    13750, // Level 22
    14950, // Level 23
    16200, // Level 24
    17500  // Level 25 (max for now)
  ],
  
  // XP rewards for different activities
  rewards: {
    vocabularyLearned: 25,
    dialogueCompleted: 50,
    questCompleted: 100,
    dailyLogin: 20,
    streakBonus: 10, // per day in streak
    achievementUnlocked: 0 // handled per achievement
  }
};

/**
 * Helper function to calculate level from total XP
 */
export const calculateLevel = (totalXP: number): number => {
  for (let i = XP_CURVE.levelRequirements.length - 1; i >= 0; i--) {
    if (totalXP >= XP_CURVE.levelRequirements[i]) {
      return i;
    }
  }
  return 0;
};

/**
 * Helper function to calculate XP needed for next level
 */
export const calculateXPToNextLevel = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;
  
  if (nextLevel >= XP_CURVE.levelRequirements.length) {
    return 0; // Max level reached
  }
  
  return XP_CURVE.levelRequirements[nextLevel] - totalXP;
};

/**
 * Helper function to calculate current level progress (0-1)
 */
export const calculateLevelProgress = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;
  
  if (nextLevel >= XP_CURVE.levelRequirements.length) {
    return 1; // Max level reached
  }
  
  const currentLevelXP = XP_CURVE.levelRequirements[currentLevel];
  const nextLevelXP = XP_CURVE.levelRequirements[nextLevel];
  const progressXP = totalXP - currentLevelXP;
  const levelRange = nextLevelXP - currentLevelXP;
  
  return Math.min(progressXP / levelRange, 1);
};