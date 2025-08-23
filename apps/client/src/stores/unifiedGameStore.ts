/**
 * Unified Game Store - Single source of truth for all game state
 * Combines ECS engine management with game data persistence
 * Eliminates parallel architecture for perfect SRP compliance
 */

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import {
  World,
  type PositionComponent,
  type SizeComponent,
  type RenderableComponent,
  type PlayerComponent,
  ecsEventBus,
  ECSEventTypes,
} from "@elt/core";
import { SceneLoader } from "../ecs/sceneLoader";
import { SystemFactory, type SystemRegistry } from "../ecs/systemRegistry";
import type {
  PlayerData,
  QuestData,
  Notification,
  PlayerProgress,
} from "../types";
import {
  ACHIEVEMENTS,
  calculateLevel,
  calculateXPToNextLevel,
  XP_CURVE,
} from "../data/achievements";
import { logger } from "../utils/logger";

// Types for the unified store
interface RenderableEntity {
  id: string;
  position: PositionComponent;
  size: SizeComponent;
  renderable: RenderableComponent;
}

interface UnifiedGameState {
  // =============================================================================
  // ECS ENGINE STATE (Non-persistent - Runtime only)
  // =============================================================================

  // Core ECS
  world: InstanceType<typeof World> | null;
  sceneLoader: SceneLoader | null;
  systems: SystemRegistry | null;

  // ECS Runtime state
  isECSInitialized: boolean;
  renderableEntities: RenderableEntity[];
  playerPosition: { x: number; y: number } | null;

  // =============================================================================
  // GAME DATA STATE (Persistent - Save data)
  // =============================================================================

  // Game progression
  currentScene: string;
  isInDialogue: boolean;
  isPaused: boolean;

  // Player data
  player: PlayerData;
  currentQuest: QuestData | undefined;
  notifications: Notification[];

  // =============================================================================
  // ECS ENGINE ACTIONS (Non-persistent)
  // =============================================================================

  initializeECS: () => void;
  loadScene: (scenePath: string) => Promise<void>;
  addPlayer: (
    playerId: string,
    position: { x: number; y: number },
    name?: string,
  ) => void;
  updateRenderableEntities: (entities: RenderableEntity[]) => void;
  startGameLoop: () => void;
  stopGameLoop: () => void;
  cleanupECS: () => void;

  // =============================================================================
  // GAME DATA ACTIONS (Persistent)
  // =============================================================================

  // Scene management
  setCurrentScene: (scene: string) => void;
  setInDialogue: (inDialogue: boolean) => void;
  setPaused: (paused: boolean) => void;

  // Player actions
  updatePlayer: (playerData: Partial<PlayerData>) => void;
  addExperience: (amount: number) => void;
  addMoney: (amount: number) => void;
  addVocabulary: (words: string[]) => void;

  // Achievement & Gamification actions
  unlockAchievement: (achievementId: string) => void;
  checkAchievements: () => void;
  updateDailyStreak: () => void;
  initializePlayerProgress: () => void;

  // Quest actions
  startQuest: (quest: QuestData) => void;
  completeQuest: (questId: string) => void;
  updateQuestObjective: (
    questId: string,
    objectiveIndex: number,
    progress: number,
  ) => void;
  setCurrentQuest: (quest: QuestData | undefined) => void;

  // Notification actions
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Global game loop reference
let gameLoopId: number | null = null;

export const useUnifiedGameStore = create<UnifiedGameState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // =============================================================================
        // INITIAL STATE
        // =============================================================================

        // ECS Engine (Non-persistent)
        world: null,
        sceneLoader: null,
        systems: null,
        isECSInitialized: false,
        renderableEntities: [],
        playerPosition: null,

        // Game Data (Persistent)
        currentScene: "MainMenu",
        isInDialogue: false,
        isPaused: false,
        player: {
          id: "",
          name: "Player",
          level: 1,
          experience: 0,
          money: 100,
          currentLocation: "town_center",
          completedQuests: [],
          activeQuests: [],
          knownVocabulary: [],
          unlockedAreas: ["town_center"],

          // Gamification additions
          achievements: [...ACHIEVEMENTS], // Copy all available achievements
          unlockedAchievements: [],
          progress: {
            totalXP: 0,
            xpToNextLevel: 100,
            currentLevelXP: 0,
            vocabularyLearned: 0,
            questsCompleted: 0,
            dialoguesCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            skillLevels: {
              vocabulary: 1,
              grammar: 1,
              speaking: 1,
              listening: 1,
              reading: 1,
              writing: 1,
              pronunciation: 1,
            },
          },
          preferences: {
            celebrationsEnabled: true,
            soundEffectsEnabled: true,
            animationsEnabled: true,
          },
        },
        currentQuest: undefined,
        notifications: [],

        // =============================================================================
        // ECS ENGINE ACTIONS
        // =============================================================================

        initializeECS: () => {
          logger.ecs("Initializing ECS world and systems...");

          const world = new World();
          const sceneLoader = new SceneLoader(world);

          // Create all systems with proper dependency injection using factory
          const systems = SystemFactory.createSystems();

          // Add systems to world
          logger.ecs("Adding systems to world...");
          world.addSystem(systems.collision);
          world.addSystem(systems.movement);
          world.addSystem(systems.inputState);
          world.addSystem(systems.interactionZone);
          world.addSystem(systems.gridMovement);
          world.addSystem(systems.playerInteraction);
          world.addSystem(systems.mouseInput);
          world.addSystem(systems.interaction);
          world.addSystem(systems.render);
          world.addSystem(systems.animation);
          world.addSystem(systems.movementAnimation);

          // Set up event listeners
          // Subscribe to render events from the ECS system using type-safe mitt
          ecsEventBus.on(ECSEventTypes.RENDER_FRAME_READY, (data) => {
            get().updateRenderableEntities(data.entities);
          });

          // Set up input event handlers using type-safe events
          const handleKeyDown = (event: KeyboardEvent) => {
            ecsEventBus.emit(ECSEventTypes.INPUT_KEY_PRESSED, {
              key: event.code,
            });
          };

          const handleKeyUp = (event: KeyboardEvent) => {
            ecsEventBus.emit(ECSEventTypes.INPUT_KEY_RELEASED, {
              key: event.code,
            });
          };

          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("keyup", handleKeyUp);

          set({
            world,
            sceneLoader,
            systems,
            isECSInitialized: true,
          });

          logger.ecs("ECS initialized successfully");
        },

        // Load a scene
        loadScene: async (scenePath: string) => {
          const { sceneLoader } = get();
          if (!sceneLoader) {
            throw new Error("ECS not initialized");
          }

          logger.scene(`Loading scene: ${scenePath}`);
          await sceneLoader.loadSceneFromFile(scenePath);

          // Update both ECS current scene and persistent game scene
          set({ currentScene: scenePath });
          logger.scene(`Scene loaded: ${scenePath}`);
        },

        // Add player to ECS world
        addPlayer: (
          playerId: string,
          position: { x: number; y: number },
          name?: string,
        ) => {
          const { world } = get();
          if (!world) {
            throw new Error("ECS not initialized");
          }

          logger.player(
            `Adding player ${playerId} at position (${position.x}, ${position.y})`,
          );

          const player = world.createEntity(playerId);

          world.addComponent(player.id, {
            type: "position",
            x: position.x,
            y: position.y,
          });

          world.addComponent(player.id, {
            type: "size",
            width: 1,
            height: 1,
          });

          world.addComponent(player.id, {
            type: "renderable",
            renderType: "emoji",
            icon: "🧑",
            color: "#4F9EFF",
            zIndex: 10,
            visible: true,
          });

          world.addComponent(player.id, {
            type: "velocity",
            x: 0,
            y: 0,
            maxSpeed: 5,
          });

          world.addComponent(player.id, {
            type: "collision",
            solid: true,
            bounds: { x: 0, y: 0, width: 1, height: 1 },
          });

          world.addComponent(player.id, {
            type: "controllable",
            isControllable: true,
          });

          world.addComponent(player.id, {
            type: "input",
            inputType: "player",
            controllable: true,
          });

          // Add the 'player' component that systems use to identify player entities
          world.addComponent(player.id, {
            type: "player",
            name: name || get().player.name,
            level: get().player.level,
            experience: get().player.experience,
            health: 100, // Default health
            maxHealth: 100, // Default max health
          } as PlayerComponent);

          set({
            playerPosition: position,
            player: { ...get().player, name: name || get().player.name },
          });

          logger.player(`Player added: ${playerId}`);
        },

        // Update renderable entities
        updateRenderableEntities: (entities: RenderableEntity[]) => {
          set({ renderableEntities: entities });
        },

        // Game loop management
        startGameLoop: () => {
          const { world } = get();
          if (!world || gameLoopId !== null) return;

          logger.ecs("Starting game loop...");

          const gameLoop = () => {
            world.update();
            gameLoopId = requestAnimationFrame(gameLoop);
          };

          gameLoopId = requestAnimationFrame(gameLoop);
        },

        stopGameLoop: () => {
          if (gameLoopId !== null) {
            logger.ecs("Stopping game loop...");
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
          }
        },

        cleanupECS: () => {
          const { world } = get();
          if (gameLoopId !== null) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
          }

          if (world) {
            world.destroy();
          }

          set({
            world: null,
            sceneLoader: null,
            systems: null,
            isECSInitialized: false,
            renderableEntities: [],
            playerPosition: null,
          });

          logger.ecs("ECS cleanup completed");
        },

        // =============================================================================
        // GAME DATA ACTIONS (Persistent)
        // =============================================================================

        // Scene management
        setCurrentScene: (scene) => set({ currentScene: scene }),
        setInDialogue: (inDialogue) => set({ isInDialogue: inDialogue }),
        setPaused: (paused) => set({ isPaused: paused }),

        // Player management
        updatePlayer: (playerData) =>
          set((state) => ({
            player: { ...state.player, ...playerData },
          })),

        addExperience: (amount) =>
          set((state) => {
            const newTotalXP = state.player.progress.totalXP + amount;
            const newLevel = calculateLevel(newTotalXP);
            const leveledUp = newLevel > state.player.level;
            const xpToNext = calculateXPToNextLevel(newTotalXP);

            const updatedProgress: PlayerProgress = {
              ...state.player.progress,
              totalXP: newTotalXP,
              xpToNextLevel: xpToNext,
              currentLevelXP:
                newTotalXP -
                (newLevel > 0
                  ? XP_CURVE.levelRequirements[newLevel - 1] || 0
                  : 0),
            };

            const updatedPlayer = {
              ...state.player,
              experience: newTotalXP, // Keep backwards compatibility
              level: newLevel,
              progress: updatedProgress,
            };

            const notifications = [...state.notifications];

            // Add XP gain notification for kids
            notifications.push({
              id: `xp-gain-${Date.now()}`,
              type: "xp_gained",
              title: `+${amount} XP! 🌟`,
              message: `Great job! You earned ${amount} experience points!`,
              duration: 3000,
              timestamp: Date.now(),
            });

            // Add level up notification with celebration
            if (leveledUp) {
              notifications.push({
                id: `level-up-${Date.now()}`,
                type: "level_up",
                title: `🎉 Level Up! 🎉`,
                message: `Awesome! You reached level ${newLevel}!`,
                duration: 8000,
                timestamp: Date.now(),
              });
            }

            const result = {
              player: updatedPlayer,
              notifications,
            };

            // Check for achievements after state update
            setTimeout(() => get().checkAchievements(), 100);

            return result;
          }),

        addMoney: (amount) =>
          set((state) => ({
            player: {
              ...state.player,
              money: state.player.money + amount,
            },
          })),

        addVocabulary: (words) =>
          set((state) => {
            const newVocabulary = [...state.player.knownVocabulary];
            let wordsAdded = 0;

            words.forEach((word) => {
              if (!newVocabulary.includes(word)) {
                newVocabulary.push(word);
                wordsAdded++;
              }
            });

            if (wordsAdded === 0) return state; // No new words added

            // Update progress tracking
            const updatedProgress = {
              ...state.player.progress,
              vocabularyLearned: newVocabulary.length,
            };

            // Award XP for vocabulary learning
            const xpGain = wordsAdded * XP_CURVE.rewards.vocabularyLearned;
            const newTotalXP = updatedProgress.totalXP + xpGain;
            const newLevel = calculateLevel(newTotalXP);
            const leveledUp = newLevel > state.player.level;

            const finalProgress = {
              ...updatedProgress,
              totalXP: newTotalXP,
              xpToNextLevel: calculateXPToNextLevel(newTotalXP),
              currentLevelXP:
                newTotalXP -
                (newLevel > 0
                  ? XP_CURVE.levelRequirements[newLevel - 1] || 0
                  : 0),
            };

            const notifications = [...state.notifications];

            // Add vocabulary learning notification
            notifications.push({
              id: `vocab-learned-${Date.now()}`,
              type: "vocabulary_learned",
              title: `📚 New Words Learned! 📚`,
              message: `Amazing! You learned ${wordsAdded} new word${wordsAdded > 1 ? "s" : ""}!`,
              duration: 5000,
              timestamp: Date.now(),
            });

            // Add XP notification
            notifications.push({
              id: `vocab-xp-${Date.now()}`,
              type: "xp_gained",
              title: `+${xpGain} XP! 🌟`,
              message: `Great vocabulary work!`,
              duration: 3000,
              timestamp: Date.now(),
            });

            // Add level up notification if needed
            if (leveledUp) {
              notifications.push({
                id: `level-up-vocab-${Date.now()}`,
                type: "level_up",
                title: `🎉 Level Up! 🎉`,
                message: `Vocabulary power helped you reach level ${newLevel}!`,
                duration: 8000,
                timestamp: Date.now(),
              });
            }

            const result = {
              player: {
                ...state.player,
                knownVocabulary: newVocabulary,
                level: newLevel,
                experience: newTotalXP,
                progress: finalProgress,
              },
              notifications,
            };

            // Check for achievements after state update
            setTimeout(() => get().checkAchievements(), 100);

            return result;
          }),

        // Quest management
        startQuest: (quest) =>
          set((state) => ({
            player: {
              ...state.player,
              activeQuests: [...state.player.activeQuests, quest.id],
            },
            currentQuest: quest,
          })),

        completeQuest: (questId) =>
          set((state) => ({
            player: {
              ...state.player,
              activeQuests: state.player.activeQuests.filter(
                (id) => id !== questId,
              ),
              completedQuests: [...state.player.completedQuests, questId],
            },
            currentQuest:
              state.currentQuest?.id === questId
                ? undefined
                : state.currentQuest,
          })),

        updateQuestObjective: (questId, objectiveIndex, progress) =>
          set((state) => {
            if (
              state.currentQuest?.id === questId &&
              state.currentQuest.objectives[objectiveIndex]
            ) {
              const updatedQuest = { ...state.currentQuest };
              updatedQuest.objectives[objectiveIndex] = {
                ...updatedQuest.objectives[objectiveIndex],
                currentCount: progress,
                isCompleted:
                  progress >=
                  updatedQuest.objectives[objectiveIndex].targetCount,
              };
              return { currentQuest: updatedQuest };
            }
            return state;
          }),

        setCurrentQuest: (quest) => set({ currentQuest: quest }),

        // Notification management
        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: `notification-${Date.now()}`,
                timestamp: Date.now(),
              },
            ],
          })),

        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        clearNotifications: () => set({ notifications: [] }),

        // =============================================================================
        // ACHIEVEMENT & GAMIFICATION ACTIONS
        // =============================================================================

        initializePlayerProgress: () =>
          set((state) => {
            if (state.player.progress) return state; // Already initialized

            const totalXP = state.player.experience || 0;
            const progress: PlayerProgress = {
              totalXP,
              xpToNextLevel: calculateXPToNextLevel(totalXP),
              currentLevelXP:
                totalXP -
                (state.player.level > 0
                  ? XP_CURVE.levelRequirements[state.player.level - 1] || 0
                  : 0),
              vocabularyLearned: state.player.knownVocabulary?.length || 0,
              questsCompleted: state.player.completedQuests?.length || 0,
              dialoguesCompleted: 0,
              currentStreak: 0,
              longestStreak: 0,
              skillLevels: {
                vocabulary: Math.max(
                  1,
                  Math.floor((state.player.knownVocabulary?.length || 0) / 10) +
                    1,
                ),
                grammar: 1,
                speaking: 1,
                listening: 1,
                reading: 1,
                writing: 1,
                pronunciation: 1,
              },
            };

            return {
              player: {
                ...state.player,
                achievements: state.player.achievements || [...ACHIEVEMENTS],
                unlockedAchievements: state.player.unlockedAchievements || [],
                progress,
                preferences: state.player.preferences || {
                  celebrationsEnabled: true,
                  soundEffectsEnabled: true,
                  animationsEnabled: true,
                },
              },
            };
          }),

        unlockAchievement: (achievementId) =>
          set((state) => {
            if (state.player.unlockedAchievements.includes(achievementId)) {
              return state; // Already unlocked
            }

            const achievement = state.player.achievements.find(
              (a) => a.id === achievementId,
            );
            if (!achievement) {
              logger.warn(`Achievement ${achievementId} not found`);
              return state;
            }

            const updatedAchievements = state.player.achievements.map((a) =>
              a.id === achievementId ? { ...a, unlockedAt: new Date() } : a,
            );

            const notifications = [...state.notifications];

            // Add achievement unlock notification with celebration
            notifications.push({
              id: `achievement-${achievementId}-${Date.now()}`,
              type: "achievement_unlocked",
              title: `🏆 Achievement Unlocked! 🏆`,
              message: `${achievement.icon} ${achievement.title}`,
              duration: 8000,
              timestamp: Date.now(),
            });

            // Give XP reward
            const newTotalXP =
              state.player.progress.totalXP + achievement.xpReward;
            const newLevel = calculateLevel(newTotalXP);
            const leveledUp = newLevel > state.player.level;

            const updatedProgress = {
              ...state.player.progress,
              totalXP: newTotalXP,
              xpToNextLevel: calculateXPToNextLevel(newTotalXP),
              currentLevelXP:
                newTotalXP -
                (newLevel > 0
                  ? XP_CURVE.levelRequirements[newLevel - 1] || 0
                  : 0),
            };

            // Add level up notification if needed
            if (leveledUp) {
              notifications.push({
                id: `level-up-${Date.now()}`,
                type: "level_up",
                title: `🎉 Level Up! 🎉`,
                message: `Awesome! You reached level ${newLevel}!`,
                duration: 8000,
                timestamp: Date.now(),
              });
            }

            return {
              player: {
                ...state.player,
                level: newLevel,
                experience: newTotalXP,
                achievements: updatedAchievements,
                unlockedAchievements: [
                  ...state.player.unlockedAchievements,
                  achievementId,
                ],
                progress: updatedProgress,
              },
              notifications,
            };
          }),

        checkAchievements: () => {
          const state = get();
          const player = state.player;

          if (!player.progress) return;

          // Check each achievement
          for (const achievement of player.achievements) {
            if (player.unlockedAchievements.includes(achievement.id)) continue;

            let shouldUnlock = false;

            switch (achievement.requirement.type) {
              case "vocabulary_count":
                shouldUnlock =
                  player.progress.vocabularyLearned >=
                  achievement.requirement.target;
                break;
              case "quest_count":
                shouldUnlock =
                  player.progress.questsCompleted >=
                  achievement.requirement.target;
                break;
              case "dialogue_count":
                shouldUnlock =
                  player.progress.dialoguesCompleted >=
                  achievement.requirement.target;
                break;
              case "level_reached":
                shouldUnlock = player.level >= achievement.requirement.target;
                break;
              case "streak_count":
                shouldUnlock =
                  player.progress.currentStreak >=
                  achievement.requirement.target;
                break;
              case "learning_time": {
                const currentHour = new Date().getHours();
                const targetHour = achievement.requirement.target;
                const condition = achievement.requirement.data?.timeCondition;
                if (condition === "after") {
                  shouldUnlock = currentHour >= targetHour;
                } else if (condition === "before") {
                  shouldUnlock = currentHour <= targetHour;
                }
                break;
              }
            }

            if (shouldUnlock) {
              get().unlockAchievement(achievement.id);
            }
          }
        },

        updateDailyStreak: () =>
          set((state) => {
            const today = new Date().toDateString();
            const lastActive = state.player.progress.lastActiveDate;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let newStreak = 1;

            if (lastActive) {
              const lastActiveDate = new Date(lastActive).toDateString();

              if (lastActiveDate === today) {
                // Same day, don't update streak
                return state;
              } else if (lastActiveDate === yesterday.toDateString()) {
                // Consecutive day, increment streak
                newStreak = state.player.progress.currentStreak + 1;
              }
              // If more than 1 day gap, streak resets to 1
            }

            const longestStreak = Math.max(
              state.player.progress.longestStreak,
              newStreak,
            );

            const updatedProgress = {
              ...state.player.progress,
              currentStreak: newStreak,
              longestStreak,
              lastActiveDate: new Date(),
            };

            // Check for streak achievements
            setTimeout(() => get().checkAchievements(), 100);

            return {
              player: {
                ...state.player,
                progress: updatedProgress,
              },
            };
          }),
      }),
      {
        name: "unified-game-store",
        // Only persist game data, not ECS runtime state
        partialize: (state) => ({
          currentScene: state.currentScene,
          isInDialogue: state.isInDialogue,
          isPaused: state.isPaused,
          player: state.player,
          currentQuest: state.currentQuest,
          notifications: state.notifications,
        }),
      },
    ),
  ),
);

// Export the store as the primary game store
export { useUnifiedGameStore as useGameStore };

// Export types for external use
export type { RenderableEntity, UnifiedGameState };
