// Audio Manager - Global audio management singleton

import { generateTone, SOUND_FREQUENCIES } from './audioEngine';
import type { SoundType } from './audioEngine';

class AudioManagerClass {
  private masterVolume: number = 0.7;
  private isMuted: boolean = false;

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  isMute(): boolean {
    return this.isMuted;
  }

  playSound(soundType: SoundType, options?: { volume?: number; duration?: number }): void {
    if (this.isMuted) return;

    const frequency = SOUND_FREQUENCIES[soundType];
    const volume = (options?.volume ?? 0.5) * this.masterVolume;
    const duration = options?.duration ?? 0.2;

    generateTone({
      frequency,
      duration,
      volume,
      type: 'sine'
    });
  }

  playCustomTone(frequency: number, duration: number = 0.2, volume: number = 0.5): void {
    if (this.isMuted) return;

    generateTone({
      frequency,
      duration,
      volume: volume * this.masterVolume,
      type: 'sine'
    });
  }

  // Convenience methods for common UI sounds
  playClick(): void {
    this.playSound('button_click', { volume: 0.3, duration: 0.1 });
  }

  playHover(): void {
    this.playSound('button_hover', { volume: 0.2, duration: 0.1 });
  }

  playSuccess(): void {
    this.playSound('success', { volume: 0.5, duration: 0.3 });
  }

  playError(): void {
    this.playSound('error', { volume: 0.4, duration: 0.3 });
  }

  playNotification(): void {
    this.playSound('notification', { volume: 0.4, duration: 0.25 });
  }

  playQuestComplete(): void {
    this.playSound('quest_complete', { volume: 0.6, duration: 0.5 });
  }

  playLevelUp(): void {
    this.playSound('level_up', { volume: 0.7, duration: 0.8 });
  }

  playDialogueOpen(): void {
    this.playSound('dialogue_open', { volume: 0.3, duration: 0.2 });
  }

  playDialogueClose(): void {
    this.playSound('dialogue_close', { volume: 0.3, duration: 0.2 });
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerClass();