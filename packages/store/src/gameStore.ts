import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { GameState, GameSettings, GameTime, DebugState } from '@english-learning-town/types';

export interface GameStore extends GameState {
  // Actions
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentDialogue: (dialogueId: string | null) => void;
  setCurrentLocation: (locationId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateGameTime: (time: Partial<GameTime>) => void;
  updateDebugState: (debug: Partial<DebugState>) => void;
  resetGame: () => void;
}

const initialGameTime: GameTime = {
  totalPlayTime: 0,
  sessionStartTime: new Date(),
  lastSaveTime: new Date()
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
    maxAlternatives: 3
  },
  graphics: {
    quality: 'medium',
    fullscreen: false,
    vsync: true,
    particleEffects: true
  },
  accessibility: {
    subtitles: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    colorBlindSupport: false
  }
};

const initialDebugState: DebugState = {
  showFPS: false,
  showCollisionBoxes: false,
  showDialogueDebug: false,
  godMode: false,
  unlockAllLocations: false
};

const initialState: GameState = {
  isPlaying: false,
  isPaused: false,
  currentDialogue: null,
  currentLocation: 'town-square',
  gameTime: initialGameTime,
  settings: initialSettings,
  debug: initialDebugState
};

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

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

      resetGame: () =>
        set(() => ({
          ...initialState,
          gameTime: {
            ...initialGameTime,
            sessionStartTime: new Date()
          }
        }))
    })),
    {
      name: 'english-learning-town-game-state',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        gameTime: {
          ...state.gameTime,
          sessionStartTime: new Date() // Reset session time on load
        },
        settings: state.settings
      })
    }
  )
);

// Selectors for common state access patterns
export const useGameSettings = () => useGameStore((state) => state.settings);
export const useGameTime = () => useGameStore((state) => state.gameTime);
export const useDebugState = () => useGameStore((state) => state.debug);
export const useCurrentLocation = () => useGameStore((state) => state.currentLocation);
export const useCurrentDialogue = () => useGameStore((state) => state.currentDialogue);
export const useGamePlayState = () => useGameStore((state) => ({
  isPlaying: state.isPlaying,
  isPaused: state.isPaused
}));