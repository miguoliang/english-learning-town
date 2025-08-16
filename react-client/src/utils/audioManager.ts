// Audio Manager - Global audio management singleton

import { generateTone, SOUND_FREQUENCIES } from './audioEngine';
import type { SoundType } from './audioEngine';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types/speech';
import { logger } from './logger';

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

  speakText(text: string, options?: { rate?: number; pitch?: number; volume?: number; voice?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isMuted) {
        resolve();
        return;
      }

      if (!('speechSynthesis' in window)) {
        logger.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = (options?.volume ?? 0.8) * this.masterVolume;

      if (options?.voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(options.voice!.toLowerCase()) ||
          voice.lang.toLowerCase().includes(options.voice!.toLowerCase())
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis failed'));

      speechSynthesis.speak(utterance);
    });
  }

  stopSpeech(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  startListening(options?: { 
    language?: string; 
    continuous?: boolean; 
    interimResults?: boolean;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        const error = 'Speech recognition not supported';
        logger.warn(error);
        if (options?.onError) options.onError(error);
        reject(new Error(error));
        return;
      }

      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        throw new Error('SpeechRecognition not supported');
      }
      const recognition = new SpeechRecognitionClass();

      recognition.lang = options?.language || 'en-US';
      recognition.continuous = options?.continuous ?? false;
      recognition.interimResults = options?.interimResults ?? true;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            if (options?.onResult) {
              options.onResult(finalTranscript.trim(), true);
            }
          } else {
            interimTranscript += transcript;
            if (options?.onResult) {
              options.onResult(interimTranscript.trim(), false);
            }
          }
        }
      };

      recognition.onend = () => {
        if (options?.onEnd) options.onEnd();
        resolve(finalTranscript.trim());
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const error = `Speech recognition error: ${event.error}`;
        logger.error(error);
        if (options?.onError) options.onError(error);
        reject(new Error(error));
      };

      recognition.start();
    });
  }

  stopListening(): void {
    // This will be handled by the recognition instance in the component
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerClass();