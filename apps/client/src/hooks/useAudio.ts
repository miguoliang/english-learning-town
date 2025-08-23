// Audio Management Hook

import { useCallback } from "react";
import { AudioManager } from "../utils/audioManager";
import type { SoundType } from "../utils/audioEngine";

interface UseAudioReturn {
  playSound: (
    soundType: SoundType,
    options?: { volume?: number; duration?: number },
  ) => void;
  playUISound: (
    type: "click" | "hover" | "open" | "close" | "success" | "error",
  ) => void;
  generateProceduralSound: (
    frequency: number,
    duration: number,
    volume?: number,
  ) => void;
  setMasterVolume: (volume: number) => void;
  getMasterVolume: () => number;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
}

export const useAudio = (): UseAudioReturn => {
  const playSound = useCallback(
    (
      soundType: SoundType,
      options?: { volume?: number; duration?: number },
    ) => {
      AudioManager.playSound(soundType, options);
    },
    [],
  );

  const playUISound = useCallback(
    (type: "click" | "hover" | "open" | "close" | "success" | "error") => {
      const soundMap: Record<typeof type, SoundType> = {
        click: "button_click",
        hover: "button_hover",
        open: "dialogue_open",
        close: "dialogue_close",
        success: "quest_complete",
        error: "error",
      };

      AudioManager.playSound(soundMap[type], { volume: 0.5 });
    },
    [],
  );

  const generateProceduralSound = useCallback(
    (frequency: number, duration: number, volume: number = 0.5) => {
      AudioManager.playCustomTone(frequency, duration, volume);
    },
    [],
  );

  const setMasterVolume = useCallback((volume: number) => {
    AudioManager.setMasterVolume(volume);
  }, []);

  const getMasterVolume = useCallback(() => {
    return AudioManager.getMasterVolume();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    AudioManager.setMuted(muted);
  }, []);

  const isMuted = useCallback(() => {
    return AudioManager.isMute();
  }, []);

  return {
    playSound,
    playUISound,
    generateProceduralSound,
    setMasterVolume,
    getMasterVolume,
    setMuted,
    isMuted,
  };
};

// Re-export AudioManager for direct access
export { AudioManager } from "../utils/audioManager";
