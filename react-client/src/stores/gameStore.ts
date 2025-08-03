// Game State Management with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  GameState, 
  PlayerData, 
  QuestData,
  Notification 
} from '../types';

interface GameStore extends GameState {
  // Actions
  setCurrentScene: (scene: string) => void;
  setInDialogue: (inDialogue: boolean) => void;
  setPaused: (paused: boolean) => void;
  
  // Player actions
  updatePlayer: (playerData: Partial<PlayerData>) => void;
  addExperience: (amount: number) => void;
  addMoney: (amount: number) => void;
  addVocabulary: (words: string[]) => void;
  
  // Quest actions
  startQuest: (quest: QuestData) => void;
  completeQuest: (questId: string) => void;
  updateQuestObjective: (questId: string, objectiveIndex: number, progress: number) => void;
  setCurrentQuest: (quest: QuestData | undefined) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // Initial state
      currentScene: 'MainMenu',
      isInDialogue: false,
      isPaused: false,
      player: {
        id: '',
        name: 'Player',
        level: 1,
        experience: 0,
        money: 100,
        currentLocation: 'town_center',
        completedQuests: [],
        activeQuests: [],
        knownVocabulary: [],
        unlockedAreas: ['town_center']
      },
      currentQuest: undefined,
      notifications: [],

      // Scene management
      setCurrentScene: (scene) => set({ currentScene: scene }),
      setInDialogue: (inDialogue) => set({ isInDialogue: inDialogue }),
      setPaused: (paused) => set({ isPaused: paused }),

      // Player management
      updatePlayer: (playerData) =>
        set((state) => ({
          player: { ...state.player, ...playerData }
        })),

      addExperience: (amount) =>
        set((state) => {
          const newExperience = state.player.experience + amount;
          const experiencePerLevel = state.player.level * 100;
          const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;
          
          const leveledUp = newLevel > state.player.level;
          
          return {
            player: {
              ...state.player,
              experience: newExperience,
              level: Math.max(newLevel, state.player.level)
            },
            notifications: leveledUp
              ? [
                  ...state.notifications,
                  {
                    id: Date.now().toString(),
                    type: 'level_up' as const,
                    title: 'Level Up!',
                    message: `Congratulations! You reached Level ${newLevel}!`,
                    duration: 6000,
                    timestamp: Date.now()
                  }
                ]
              : state.notifications
          };
        }),

      addMoney: (amount) =>
        set((state) => ({
          player: {
            ...state.player,
            money: state.player.money + amount
          }
        })),

      addVocabulary: (words) =>
        set((state) => {
          const newWords = words.filter(
            word => !state.player.knownVocabulary.includes(word)
          );
          
          if (newWords.length === 0) return state;
          
          return {
            player: {
              ...state.player,
              knownVocabulary: [...state.player.knownVocabulary, ...newWords]
            },
            notifications: [
              ...state.notifications,
              {
                id: Date.now().toString(),
                type: 'experience_gained' as const,
                title: 'New Vocabulary!',
                message: `Learned: ${newWords.join(', ')}`,
                duration: 4000,
                timestamp: Date.now()
              }
            ]
          };
        }),

      // Quest management
      startQuest: (quest) =>
        set((state) => ({
          player: {
            ...state.player,
            activeQuests: [...state.player.activeQuests, quest.id]
          },
          currentQuest: state.currentQuest || quest,
          notifications: [
            ...state.notifications,
            {
              id: Date.now().toString(),
              type: 'quest_started' as const,
              title: 'New Quest!',
              message: `Started: ${quest.title}`,
              duration: 5000,
              timestamp: Date.now()
            }
          ]
        })),

      completeQuest: (questId) =>
        set((state) => ({
          player: {
            ...state.player,
            activeQuests: state.player.activeQuests.filter(id => id !== questId),
            completedQuests: [...state.player.completedQuests, questId]
          },
          currentQuest: state.currentQuest?.id === questId ? undefined : state.currentQuest
        })),

      updateQuestObjective: (_questId, _objectiveIndex, progress) =>
        set((state) => {
          // This would update quest objectives in the quest data
          // For now, we'll just add a notification
          return {
            notifications: [
              ...state.notifications,
              {
                id: Date.now().toString(),
                type: 'objective_completed' as const,
                title: 'Objective Complete!',
                message: 'Quest objective completed',
                duration: 4000,
                progress,
                timestamp: Date.now()
              }
            ]
          };
        }),

      setCurrentQuest: (quest) => set({ currentQuest: quest }),

      // Notification management
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: Date.now()
            }
          ]
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'english-learning-town-game-state',
      partialize: (state) => ({
        player: state.player,
        currentQuest: state.currentQuest,
        currentScene: state.currentScene
      })
    }
  )
);