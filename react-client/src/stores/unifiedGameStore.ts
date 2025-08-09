/**
 * Unified Game Store - Single source of truth for all game state
 * Combines ECS engine management with game data persistence
 * Eliminates parallel architecture for perfect SRP compliance
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { World } from '../ecs/core';
import { SceneLoader } from '../ecs/sceneLoader';
import { SystemFactory, type SystemRegistry } from '../ecs/systemRegistry';
import type { PositionComponent, SizeComponent, RenderableComponent } from '../ecs/components';
import { ecsEventBus, ECSEventTypes } from '../ecs/events';
import type { 
  PlayerData, 
  QuestData,
  Notification 
} from '../types';

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
  world: World | null;
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
  addPlayer: (playerId: string, position: { x: number; y: number }, name?: string) => void;
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
        
        // =============================================================================
        // ECS ENGINE ACTIONS
        // =============================================================================
        
        initializeECS: () => {
          console.log('🌍 Unified Store: Initializing ECS world and systems...');
          
          const world = new World();
          const sceneLoader = new SceneLoader(world);
          
          // Create all systems with proper dependency injection using factory
          const systems = SystemFactory.createSystems();

          // Add systems to world
          console.log('🔧 Unified Store: Adding systems to world...');
          world.addSystem(systems.collision);
          world.addSystem(systems.movement);
          world.addSystem(systems.keyboardInput);
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
            ecsEventBus.emit(ECSEventTypes.INPUT_KEY_PRESSED, { key: event.code });
          };

          const handleKeyUp = (event: KeyboardEvent) => {
            ecsEventBus.emit(ECSEventTypes.INPUT_KEY_RELEASED, { key: event.code });
          };

          window.addEventListener('keydown', handleKeyDown);
          window.addEventListener('keyup', handleKeyUp);

          set({
            world,
            sceneLoader,
            systems,
            isECSInitialized: true
          });

          console.log('✅ Unified Store: ECS initialized successfully');
        },

        // Load a scene
        loadScene: async (scenePath: string) => {
          const { sceneLoader } = get();
          if (!sceneLoader) {
            throw new Error('ECS not initialized');
          }

          console.log(`🏙️ Unified Store: Loading scene: ${scenePath}`);
          await sceneLoader.loadSceneFromFile(scenePath);
          
          // Update both ECS current scene and persistent game scene
          set({ currentScene: scenePath });
          console.log(`✅ Unified Store: Scene loaded: ${scenePath}`);
        },

        // Add player to ECS world
        addPlayer: (playerId: string, position: { x: number; y: number }, name?: string) => {
          const { world } = get();
          if (!world) {
            throw new Error('ECS not initialized');
          }

          console.log(`🧑 Unified Store: Adding player ${playerId} at position (${position.x}, ${position.y})`);
          
          const player = world.createEntity(playerId);
          
          world.addComponent(player.id, {
            type: 'position',
            x: position.x,
            y: position.y
          });
          
          world.addComponent(player.id, {
            type: 'size',
            width: 1,
            height: 1
          });
          
          world.addComponent(player.id, {
            type: 'renderable',
            renderType: 'emoji',
            icon: '🧑',
            color: '#4F9EFF',
            zIndex: 10,
            visible: true
          });
          
          world.addComponent(player.id, {
            type: 'velocity',
            x: 0,
            y: 0
          });
          
          world.addComponent(player.id, {
            type: 'collision',
            solid: true,
            bounds: { x: 0, y: 0, width: 1, height: 1 }
          });
          
          world.addComponent(player.id, {
            type: 'controllable',
            isControllable: true
          });

          set({ 
            playerPosition: position,
            player: { ...get().player, name: name || get().player.name }
          });
          
          console.log(`✅ Unified Store: Player added: ${playerId}`);
        },

        // Update renderable entities
        updateRenderableEntities: (entities: RenderableEntity[]) => {
          set({ renderableEntities: entities });
        },

        // Game loop management
        startGameLoop: () => {
          const { world } = get();
          if (!world || gameLoopId !== null) return;

          console.log('🔄 Unified Store: Starting game loop...');
          
          const gameLoop = () => {
            world.update();
            gameLoopId = requestAnimationFrame(gameLoop);
          };
          
          gameLoopId = requestAnimationFrame(gameLoop);
        },

        stopGameLoop: () => {
          if (gameLoopId !== null) {
            console.log('⏹️ Unified Store: Stopping game loop...');
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
            playerPosition: null
          });
          
          console.log('🧹 Unified Store: ECS cleanup completed');
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
            player: { ...state.player, ...playerData }
          })),

        addExperience: (amount) =>
          set((state) => {
            const newExperience = state.player.experience + amount;
            const experiencePerLevel = state.player.level * 100;
            const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;
            
            const leveledUp = newLevel > state.player.level;
            
            const result = {
              player: {
                ...state.player,
                experience: newExperience,
                level: newLevel
              }
            };

            // Add level up notification
            if (leveledUp) {
              const notifications = [...state.notifications];
              notifications.push({
                id: `level-up-${Date.now()}`,
                type: 'level_up',
                title: 'Level Up!',
                message: `You reached level ${newLevel}!`,
                duration: 5000,
                timestamp: Date.now()
              });
              (result as any).notifications = notifications;
            }

            return result;
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
            const newVocabulary = [...state.player.knownVocabulary];
            words.forEach(word => {
              if (!newVocabulary.includes(word)) {
                newVocabulary.push(word);
              }
            });
            
            return {
              player: {
                ...state.player,
                knownVocabulary: newVocabulary
              }
            };
          }),

        // Quest management
        startQuest: (quest) =>
          set((state) => ({
            player: {
              ...state.player,
              activeQuests: [...state.player.activeQuests, quest.id]
            },
            currentQuest: quest
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

        updateQuestObjective: (questId, objectiveIndex, progress) =>
          set((state) => {
            if (state.currentQuest?.id === questId && state.currentQuest.objectives[objectiveIndex]) {
              const updatedQuest = { ...state.currentQuest };
              updatedQuest.objectives[objectiveIndex] = {
                ...updatedQuest.objectives[objectiveIndex],
                currentCount: progress,
                isCompleted: progress >= updatedQuest.objectives[objectiveIndex].targetCount
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
        name: 'unified-game-store',
        // Only persist game data, not ECS runtime state
        partialize: (state) => ({
          currentScene: state.currentScene,
          isInDialogue: state.isInDialogue,
          isPaused: state.isPaused,
          player: state.player,
          currentQuest: state.currentQuest,
          notifications: state.notifications
        })
      }
    )
  )
);

// Export the store as the primary game store
export { useUnifiedGameStore as useGameStore };

// Export types for external use
export type { RenderableEntity, UnifiedGameState };
