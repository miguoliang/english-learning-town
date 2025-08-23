// Quest Management Store

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestData } from "../types";
import {
  QuestStatus,
  QuestType,
  LearningCategory,
  ObjectiveType,
} from "../types";

interface QuestStore {
  // State
  allQuests: Record<string, QuestData>;
  activeQuests: QuestData[];
  completedQuests: string[];
  availableQuests: string[];
  currentActiveQuest: QuestData | null;

  // Actions
  addQuest: (quest: QuestData) => void;
  startQuest: (questId: string) => boolean;
  completeQuest: (questId: string) => boolean;
  updateQuestObjective: (
    questId: string,
    objectiveType: ObjectiveType,
    targetId?: string,
    amount?: number,
  ) => boolean;
  setActiveQuest: (questId: string) => boolean;
  loadQuests: () => void;

  // Getters
  getQuest: (questId: string) => QuestData | undefined;
  getActiveQuests: () => QuestData[];
  getAvailableQuests: () => QuestData[];
  getCurrentActiveQuest: () => QuestData | null;
  isQuestCompleted: (questId: string) => boolean;
  isQuestActive: (questId: string) => boolean;
}

const createStarterQuests = (): QuestData[] => [
  {
    id: "welcome",
    title: "Welcome to English Learning Town!",
    description:
      "Welcome to our friendly town! Let's start by learning how to greet people. Find the teacher at the school and practice saying hello.",
    shortDescription: "Learn basic greetings",
    questType: QuestType.CONVERSATION,
    learningCategory: LearningCategory.SPEAKING,
    requiredLevel: 1,
    prerequisiteQuests: [],
    targetNpcId: "teacher",
    targetLocation: "school",
    objectives: [
      {
        id: "welcome_obj1",
        description: "Go to the school building",
        objectiveType: ObjectiveType.GO_TO_LOCATION,
        targetId: "school",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        isOptional: false,
        requiredPhrases: [],
        vocabularyToUse: [],
        hint: "Look for the building with books and desks!",
      },
      {
        id: "welcome_obj2",
        description: "Talk to the teacher",
        objectiveType: ObjectiveType.TALK_TO_NPC,
        targetId: "teacher",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        isOptional: false,
        requiredPhrases: ["Hello", "Good morning", "Nice to meet you"],
        vocabularyToUse: [],
        hint: "Try greeting the teacher politely!",
      },
    ],
    currentObjectiveIndex: 0,
    status: QuestStatus.NOT_STARTED,
    isMainQuest: true,
    isDailyQuest: false,
    experienceReward: 100,
    moneyReward: 20,
    vocabularyRewards: [],
    itemRewards: [],
    newVocabulary: ["hello", "good morning", "nice to meet you", "welcome"],
    grammarFocus: [],
    dialoguePractice: [],
  },
  {
    id: "first_shopping",
    title: "Your First Shopping Trip",
    description:
      "The teacher asked you to buy some school supplies. Go to the shop and practice asking for items and using numbers.",
    shortDescription: "Buy school supplies",
    questType: QuestType.SHOPPING,
    learningCategory: LearningCategory.VOCABULARY,
    requiredLevel: 1,
    prerequisiteQuests: ["welcome"],
    targetNpcId: "shopkeeper",
    targetLocation: "shop",
    objectives: [
      {
        id: "shopping_obj1",
        description: "Go to the shop",
        objectiveType: ObjectiveType.GO_TO_LOCATION,
        targetId: "shop",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        isOptional: false,
        requiredPhrases: [],
        vocabularyToUse: [],
      },
      {
        id: "shopping_obj2",
        description: "Buy a pencil",
        objectiveType: ObjectiveType.BUY_ITEM,
        targetId: "pencil",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        isOptional: false,
        requiredPhrases: [],
        vocabularyToUse: ["please", "how much", "thank you"],
      },
      {
        id: "shopping_obj3",
        description: "Buy a book",
        objectiveType: ObjectiveType.BUY_ITEM,
        targetId: "book",
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        isOptional: false,
        requiredPhrases: [],
        vocabularyToUse: [],
      },
    ],
    currentObjectiveIndex: 0,
    status: QuestStatus.NOT_STARTED,
    isMainQuest: false,
    isDailyQuest: false,
    experienceReward: 75,
    moneyReward: 15,
    vocabularyRewards: [],
    itemRewards: [],
    newVocabulary: [
      "pencil",
      "book",
      "eraser",
      "how much",
      "please",
      "thank you",
    ],
    grammarFocus: [],
    dialoguePractice: [],
  },
];

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      // Initial state
      allQuests: {},
      activeQuests: [],
      completedQuests: [],
      availableQuests: [],
      currentActiveQuest: null,

      // Actions
      addQuest: (quest) =>
        set((state) => ({
          allQuests: { ...state.allQuests, [quest.id]: quest },
        })),

      startQuest: (questId) => {
        const state = get();
        const quest = state.allQuests[questId];

        if (!quest || quest.status !== QuestStatus.NOT_STARTED) {
          return false;
        }

        // Check prerequisites
        const hasPrerequisites = quest.prerequisiteQuests.every((prereqId) =>
          state.completedQuests.includes(prereqId),
        );

        if (!hasPrerequisites) {
          return false;
        }

        const updatedQuest = { ...quest, status: QuestStatus.ACTIVE };

        set((state) => ({
          allQuests: { ...state.allQuests, [questId]: updatedQuest },
          activeQuests: [...state.activeQuests, updatedQuest],
          currentActiveQuest: state.currentActiveQuest || updatedQuest,
        }));

        return true;
      },

      completeQuest: (questId) => {
        const state = get();
        const quest = state.allQuests[questId];

        if (!quest || quest.status !== QuestStatus.ACTIVE) {
          return false;
        }

        const updatedQuest = { ...quest, status: QuestStatus.COMPLETED };

        set((state) => ({
          allQuests: { ...state.allQuests, [questId]: updatedQuest },
          activeQuests: state.activeQuests.filter((q) => q.id !== questId),
          completedQuests: [...state.completedQuests, questId],
          currentActiveQuest:
            state.currentActiveQuest?.id === questId
              ? state.activeQuests.find((q) => q.id !== questId) || null
              : state.currentActiveQuest,
        }));

        return true;
      },

      updateQuestObjective: (
        questId,
        objectiveType,
        targetId = "",
        amount = 1,
      ) => {
        const state = get();
        const quest = state.allQuests[questId];

        if (!quest || quest.status !== QuestStatus.ACTIVE) {
          return false;
        }

        const currentObjective = quest.objectives[quest.currentObjectiveIndex];
        if (!currentObjective) {
          return false;
        }

        // Check if this update matches the current objective
        if (
          currentObjective.objectiveType === objectiveType &&
          (targetId === "" || currentObjective.targetId === targetId)
        ) {
          const newCount = Math.min(
            currentObjective.currentCount + amount,
            currentObjective.targetCount,
          );

          const isCompleted = newCount >= currentObjective.targetCount;

          const updatedObjective = {
            ...currentObjective,
            currentCount: newCount,
            isCompleted,
          };

          const updatedObjectives = [...quest.objectives];
          updatedObjectives[quest.currentObjectiveIndex] = updatedObjective;

          let newObjectiveIndex = quest.currentObjectiveIndex;
          let questCompleted = false;

          if (isCompleted) {
            newObjectiveIndex++;
            if (newObjectiveIndex >= quest.objectives.length) {
              questCompleted = true;
            }
          }

          const updatedQuest = {
            ...quest,
            objectives: updatedObjectives,
            currentObjectiveIndex: newObjectiveIndex,
            status: questCompleted ? QuestStatus.COMPLETED : QuestStatus.ACTIVE,
          };

          set((state) => ({
            allQuests: { ...state.allQuests, [questId]: updatedQuest },
            activeQuests: questCompleted
              ? state.activeQuests.filter((q) => q.id !== questId)
              : state.activeQuests.map((q) =>
                  q.id === questId ? updatedQuest : q,
                ),
            completedQuests: questCompleted
              ? [...state.completedQuests, questId]
              : state.completedQuests,
            currentActiveQuest:
              state.currentActiveQuest?.id === questId
                ? questCompleted
                  ? state.activeQuests.find((q) => q.id !== questId) || null
                  : updatedQuest
                : state.currentActiveQuest,
          }));

          return true;
        }

        return false;
      },

      setActiveQuest: (questId) => {
        const state = get();
        const quest = state.activeQuests.find((q) => q.id === questId);

        if (quest) {
          set({ currentActiveQuest: quest });
          return true;
        }

        return false;
      },

      loadQuests: () => {
        const starterQuests = createStarterQuests();
        const questsMap = starterQuests.reduce(
          (acc, quest) => {
            acc[quest.id] = quest;
            return acc;
          },
          {} as Record<string, QuestData>,
        );

        set((state) => ({
          allQuests: { ...state.allQuests, ...questsMap },
          availableQuests: starterQuests
            .filter((q) => q.status === QuestStatus.NOT_STARTED)
            .map((q) => q.id),
        }));

        // Auto-start welcome quest if no active quests
        const currentState = get();
        if (currentState.activeQuests.length === 0) {
          currentState.startQuest("welcome");
        }
      },

      // Getters
      getQuest: (questId) => get().allQuests[questId],

      getActiveQuests: () => get().activeQuests,

      getAvailableQuests: () => {
        const state = get();
        return state.availableQuests
          .map((id) => state.allQuests[id])
          .filter(Boolean);
      },

      getCurrentActiveQuest: () => get().currentActiveQuest,

      isQuestCompleted: (questId) => get().completedQuests.includes(questId),

      isQuestActive: (questId) =>
        get().activeQuests.some((q) => q.id === questId),
    }),
    {
      name: "english-learning-town-quest-state",
      partialize: (state) => ({
        allQuests: state.allQuests,
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        availableQuests: state.availableQuests,
        currentActiveQuest: state.currentActiveQuest,
      }),
    },
  ),
);
