// Audio Engine - Procedural sound generation and management

export interface AudioContextManager {
  context: AudioContext | null;
  getContext: () => AudioContext;
  cleanup: () => void;
}

export const createAudioContextManager = (): AudioContextManager => {
  let context: AudioContext | null = null;

  const getContext = (): AudioContext => {
    if (!context) {
      context = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return context;
  };

  const cleanup = () => {
    if (context) {
      context.close();
      context = null;
    }
  };

  return {
    get context() { return context; },
    getContext,
    cleanup
  };
};

export interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  fadeOut?: boolean;
}

export const generateTone = (options: ToneOptions): void => {
  const {
    frequency,
    duration,
    type = 'sine',
    volume = 0.3,
    fadeOut = true
  } = options;

  const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  } else {
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime + duration);
  }
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const SOUND_FREQUENCIES = {
  button_click: 800,
  button_hover: 600,
  dialogue_open: 400,
  dialogue_close: 300,
  quest_complete: 523, // C note
  objective_complete: 659, // E note
  footstep: 200,
  interact: 440, // A note
  level_up: 880, // High A
  error: 150,
  notification: 440,
  success: 523
} as const;

export type SoundType = keyof typeof SOUND_FREQUENCIES;