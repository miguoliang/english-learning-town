import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  GameState,
  GameSettings,
  GameTime,
  DebugState,
  Player,
  Position,
} from '@english-learning-town/types';

export interface GameStore extends GameState {
  // Player state
  player: Player;
  gameData: {
    locations: Record<string, any>;
    characters: Record<string, any>;
    dialogues: Record<string, any>;
    quests: Record<string, any>;
    items: Record<string, any>;
  } | null;

  // Actions
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentDialogue: (dialogueId: string | null) => void;
  setCurrentLocation: (locationId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateGameTime: (time: Partial<GameTime>) => void;
  updateDebugState: (debug: Partial<DebugState>) => void;

  // Player actions
  movePlayer: (position: Position) => void;
  updatePlayerStats: (experience: number) => void;
  addToInventory: (itemId: string) => void;

  // Game data actions
  setGameData: (data: GameStore['gameData']) => void;

  resetGame: () => void;
}

const initialGameTime: GameTime = {
  totalPlayTime: 0,
  sessionStartTime: new Date(),
  lastSaveTime: new Date(),
};

const initialSettings: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  voiceVolume: 1.0,
  speechRecognition: {
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
  },
  graphics: {
    quality: 'medium',
    fullscreen: false,
    vsync: true,
    particleEffects: true,
  },
  accessibility: {
    subtitles: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    colorBlindSupport: false,
  },
};

const initialDebugState: DebugState = {
  showFPS: false,
  showCollisionBoxes: false,
  showDialogueDebug: false,
  godMode: false,
  unlockAllLocations: false,
};

const initialPlayer: Player = {
  id: 'player1',
  name: 'Player',
  level: 1,
  experience: 0,
  position: { x: 400, y: 300 },
  inventory: [],
  completedQuests: [],
  activeQuests: [],
  currentLocation: 'town-square',
  stats: {
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    vocabulary: 0,
    pronunciation: 0,
  },
};

const initialState: GameState = {
  isPlaying: false,
  isPaused: false,
  currentDialogue: null,
  currentLocation: 'town-square',
  gameTime: initialGameTime,
  settings: initialSettings,
  debug: initialDebugState,
};

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, _get) => ({
      ...initialState,
      player: initialPlayer,
      gameData: null,

      setPlaying: (playing: boolean) =>
        set((state) => {
          state.isPlaying = playing;
          if (playing) {
            state.gameTime.sessionStartTime = new Date();
          }
        }),

      setPaused: (paused: boolean) =>
        set((state) => {
          state.isPaused = paused;
        }),

      setCurrentDialogue: (dialogueId: string | null) =>
        set((state) => {
          state.currentDialogue = dialogueId;
          state.isPaused = dialogueId !== null;
        }),

      setCurrentLocation: (locationId: string) =>
        set((state) => {
          state.currentLocation = locationId;
          state.player.currentLocation = locationId;
        }),

      updateSettings: (settings: Partial<GameSettings>) =>
        set((state) => {
          Object.assign(state.settings, settings);
        }),

      updateGameTime: (time: Partial<GameTime>) =>
        set((state) => {
          Object.assign(state.gameTime, time);
        }),

      updateDebugState: (debug: Partial<DebugState>) =>
        set((state) => {
          Object.assign(state.debug, debug);
        }),

      // Player actions
      movePlayer: (position: Position) =>
        set((state) => {
          state.player.position = position;
        }),

      updatePlayerStats: (experience: number) =>
        set((state) => {
          const oldLevel = state.player.level;
          state.player.experience += experience;

          // Simple leveling: Level up every 100 XP
          const newLevel = Math.floor(state.player.experience / 100) + 1;
          if (newLevel > oldLevel) {
            state.player.level = newLevel;
            // Level up bonuses
            state.player.stats.maxHealth += 10;
            state.player.stats.health = state.player.stats.maxHealth;
            state.player.stats.maxEnergy += 10;
            state.player.stats.energy = state.player.stats.maxEnergy;
          }
        }),

      addToInventory: (itemId: string) =>
        set((state) => {
          // TODO: Create proper Item object when we integrate item system
          const mockItem = {
            id: itemId,
            name: itemId,
            description: '',
            icon: '',
            type: 'COLLECTIBLE',
            rarity: 'COMMON',
            value: 1,
            stackable: false,
          };
          state.player.inventory.push(mockItem as any);
        }),

      // Game data actions
      setGameData: (data: GameStore['gameData']) =>
        set((state) => {
          state.gameData = data;
        }),

      resetGame: () =>
        set(() => ({
          ...initialState,
          player: { ...initialPlayer },
          gameData: null,
          gameTime: {
            ...initialGameTime,
            sessionStartTime: new Date(),
          },
        })),
    })),
    {
      name: 'english-learning-town-game-state',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        player: {
          ...state.player,
          stats: { ...state.player.stats }, // Preserve player progress
        },
        gameTime: {
          ...state.gameTime,
          sessionStartTime: new Date(), // Reset session time on load
        },
        settings: state.settings,
        // Don't persist gameData - it should be loaded fresh each session
      }),
    }
  )
);

// Selectors for common state access patterns
export const useGameSettings = () => useGameStore((state) => state.settings);
export const useGameTime = () => useGameStore((state) => state.gameTime);
export const useDebugState = () => useGameStore((state) => state.debug);
export const useCurrentLocation = () =>
  useGameStore((state) => state.currentLocation);
export const useCurrentDialogue = () =>
  useGameStore((state) => state.currentDialogue);
export const useGamePlayState = () =>
  useGameStore(
    (state) =>
      ({
        isPlaying: state.isPlaying,
        isPaused: state.isPaused,
        currentDialogue: state.currentDialogue,
        currentLocation: state.currentLocation,
        gameTime: state.gameTime,
        settings: state.settings,
        debug: state.debug,
      }) as GameState
  );

// New player-focused selectors
export const usePlayer = () => useGameStore((state) => state.player);
export const usePlayerPosition = () =>
  useGameStore((state) => state.player.position);
export const usePlayerStats = () =>
  useGameStore((state) => ({
    level: state.player.level,
    experience: state.player.experience,
    stats: state.player.stats,
  }));
export const useGameData = () => useGameStore((state) => state.gameData);

// Action selectors
export const usePlayerActions = () =>
  useGameStore((state) => ({
    movePlayer: state.movePlayer,
    updatePlayerStats: state.updatePlayerStats,
    addToInventory: state.addToInventory,
  }));

export const useGameActions = () =>
  useGameStore((state) => ({
    setPlaying: state.setPlaying,
    setPaused: state.setPaused,
    setCurrentDialogue: state.setCurrentDialogue,
    setCurrentLocation: state.setCurrentLocation,
    setGameData: state.setGameData,
  }));
