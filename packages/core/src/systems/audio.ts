/**
 * Audio System - Audio Playback and Management
 * Handles audio playback, volume control, and audio buffer management
 */

import type { System, Entity, ComponentManager } from "../core";
import type { Emitter, ECSEvents } from "../events";
import type { AudioComponent } from "../components";

/**
 * Audio System - Handles audio playback and management
 */
export class AudioSystem implements System {
  readonly name = "AudioSystem";
  readonly requiredComponents = ["audio"] as const;

  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private playingSounds: Map<string, AudioBufferSourceNode> = new Map();

  update(
    _entities: Entity[],
    components: ComponentManager,
    deltaTime: number,
    _events: Emitter<ECSEvents>,
  ): void {
    const audioEntities = components.getEntitiesWithComponents(
      this.requiredComponents,
    );

    for (const entityId of audioEntities) {
      const audio = components.getComponent<AudioComponent>(entityId, "audio");
      if (!audio) continue;

      this.updateAudioComponent(entityId, audio, deltaTime);
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private updateAudioComponent(
    _entityId: string,
    audio: AudioComponent,
    _deltaTime: number,
  ): void {
    // Handle fade in/out
    if (audio.fadeIn && audio.isPlaying && audio.startTime) {
      const elapsed = Date.now() - audio.startTime;
      if (elapsed < audio.fadeIn) {
        audio.volume = Math.min(1, elapsed / audio.fadeIn);
      }
    }

    if (audio.fadeOut && audio.endTime) {
      const timeLeft = audio.endTime - Date.now();
      if (timeLeft < audio.fadeOut && timeLeft > 0) {
        audio.volume = Math.max(0, timeLeft / audio.fadeOut);
      }
    }

    // Stop sound if end time reached
    if (audio.endTime && Date.now() >= audio.endTime) {
      this.stopSound(_entityId, audio);
    }
  }

  async playSound(entityId: string, audio: AudioComponent): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (audio.isPlaying) {
      this.stopSound(entityId, audio);
    }

    try {
      const buffer = await this.loadAudioBuffer(audio.soundId);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.loop = audio.loop;
      gainNode.gain.setValueAtTime(audio.volume, this.audioContext.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
      this.playingSounds.set(entityId, source);

      audio.isPlaying = true;
      audio.startTime = Date.now();

      if (!audio.loop && buffer.duration) {
        audio.endTime = Date.now() + buffer.duration * 1000;
      }

      source.onended = () => {
        this.playingSounds.delete(entityId);
        audio.isPlaying = false;
      };
    } catch (error) {
      console.error(`Failed to play sound ${audio.soundId}:`, error);
    }
  }

  stopSound(entityId: string, audio: AudioComponent): void {
    const source = this.playingSounds.get(entityId);
    if (source) {
      source.stop();
      this.playingSounds.delete(entityId);
    }
    audio.isPlaying = false;
    delete audio.startTime;
    delete audio.endTime;
  }

  private async loadAudioBuffer(soundId: string): Promise<AudioBuffer> {
    if (this.audioBuffers.has(soundId)) {
      return this.audioBuffers.get(soundId)!;
    }

    if (!this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    const response = await fetch(`/audio/${soundId}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.audioBuffers.set(soundId, audioBuffer);
    return audioBuffer;
  }
}
