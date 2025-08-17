/**
 * Advanced ECS Systems - AI, Audio, Physics, and Utility Systems
 */

import type { System, Entity, ComponentManager } from './core';
import type { Emitter, ECSEvents } from './events';
import type {
  PositionComponent,
  VelocityComponent,
  AIComponent,
  StateComponent,
  HealthComponent,
  AudioComponent,
  PhysicsComponent,
  ForceComponent,
  TimerComponent
} from './components';

// ========== AI SYSTEMS ==========

/**
 * AI System - Handles NPC artificial intelligence and behavior
 */
export class AISystem implements System {
  readonly name = 'AISystem';
  readonly requiredComponents = ['position', 'ai', 'velocity'] as const;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    const aiEntities = components.getEntitiesWithComponents(this.requiredComponents);
    const currentTime = Date.now();

    for (const entityId of aiEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const ai = components.getComponent<AIComponent>(entityId, 'ai');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');

      if (!position || !ai || !velocity) continue;

      // Check if enough time has passed for next decision
      if (currentTime - ai.lastDecisionTime < ai.decisionCooldown) continue;

      this.updateAIBehavior(entityId, position, ai, velocity, _entities, components, _events);
      ai.lastDecisionTime = currentTime;
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private updateAIBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager,
    _events: Emitter<ECSEvents>
  ): void {
    switch (ai.behaviorType) {
      case 'idle':
        this.handleIdleBehavior(velocity);
        break;
      case 'patrol':
        this.handlePatrolBehavior(position, ai, velocity);
        break;
      case 'chase':
        this.handleChaseBehavior(entityId, position, ai, velocity, entities, components);
        break;
      case 'flee':
        this.handleFleeBehavior(entityId, position, ai, velocity, entities, components);
        break;
      case 'guard':
        this.handleGuardBehavior(entityId, position, ai, velocity, entities, components);
        break;
      case 'follow':
        this.handleFollowBehavior(entityId, position, ai, velocity, entities, components);
        break;
    }
  }

  private handleIdleBehavior(velocity: VelocityComponent): void {
    velocity.x = 0;
    velocity.y = 0;
  }

  private handlePatrolBehavior(position: PositionComponent, ai: AIComponent, velocity: VelocityComponent): void {
    if (!ai.patrolPoints || ai.patrolPoints.length === 0) {
      this.handleIdleBehavior(velocity);
      return;
    }

    const currentIndex = ai.currentPatrolIndex || 0;
    const targetPoint = ai.patrolPoints[currentIndex];
    const distance = Math.sqrt(
      Math.pow(targetPoint.x - position.x, 2) + Math.pow(targetPoint.y - position.y, 2)
    );

    if (distance < 1) {
      // Reached patrol point, move to next
      ai.currentPatrolIndex = (currentIndex + 1) % ai.patrolPoints.length;
    } else {
      // Move towards current patrol point
      const direction = {
        x: (targetPoint.x - position.x) / distance,
        y: (targetPoint.y - position.y) / distance
      };
      velocity.x = direction.x * ai.speed;
      velocity.y = direction.y * ai.speed;
    }
  }

  private handleChaseBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager
  ): void {
    const target = this.findNearestTarget(entityId, position, ai.detectionRange, entities, components, 'player');
    
    if (target) {
      ai.target = target.id;
      const targetPos = components.getComponent<PositionComponent>(target.id, 'position');
      if (targetPos) {
        const distance = Math.sqrt(
          Math.pow(targetPos.x - position.x, 2) + Math.pow(targetPos.y - position.y, 2)
        );
        
        if (distance > 0.5) {
          const direction = {
            x: (targetPos.x - position.x) / distance,
            y: (targetPos.y - position.y) / distance
          };
          velocity.x = direction.x * ai.speed;
          velocity.y = direction.y * ai.speed;
        }
      }
    } else {
      delete ai.target;
      this.handleIdleBehavior(velocity);
    }
  }

  private handleFleeBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager
  ): void {
    const threat = this.findNearestTarget(entityId, position, ai.detectionRange, entities, components, 'player');
    
    if (threat) {
      const threatPos = components.getComponent<PositionComponent>(threat.id, 'position');
      if (threatPos) {
        const distance = Math.sqrt(
          Math.pow(threatPos.x - position.x, 2) + Math.pow(threatPos.y - position.y, 2)
        );
        
        // Flee in opposite direction
        const direction = {
          x: (position.x - threatPos.x) / distance,
          y: (position.y - threatPos.y) / distance
        };
        velocity.x = direction.x * ai.speed;
        velocity.y = direction.y * ai.speed;
      }
    } else {
      this.handleIdleBehavior(velocity);
    }
  }

  private handleGuardBehavior(
    entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    entities: Entity[],
    components: ComponentManager
  ): void {
    const intruder = this.findNearestTarget(entityId, position, ai.detectionRange, entities, components, 'player');
    
    if (intruder) {
      // Switch to chase behavior temporarily
      ai.state = 'alerting';
      this.handleChaseBehavior(entityId, position, ai, velocity, entities, components);
    } else {
      ai.state = 'guarding';
      this.handleIdleBehavior(velocity);
    }
  }

  private handleFollowBehavior(
    _entityId: string,
    position: PositionComponent,
    ai: AIComponent,
    velocity: VelocityComponent,
    _entities: Entity[],
    components: ComponentManager
  ): void {
    if (ai.target) {
      const targetPos = components.getComponent<PositionComponent>(ai.target, 'position');
      if (targetPos) {
        const distance = Math.sqrt(
          Math.pow(targetPos.x - position.x, 2) + Math.pow(targetPos.y - position.y, 2)
        );
        
        // Follow at a distance
        if (distance > 3) {
          const direction = {
            x: (targetPos.x - position.x) / distance,
            y: (targetPos.y - position.y) / distance
          };
          velocity.x = direction.x * ai.speed;
          velocity.y = direction.y * ai.speed;
        } else {
          this.handleIdleBehavior(velocity);
        }
      }
    }
  }

  private findNearestTarget(
    entityId: string,
    position: PositionComponent,
    range: number,
    entities: Entity[],
    components: ComponentManager,
    targetType: string
  ): Entity | null {
    let nearestTarget: Entity | null = null;
    let nearestDistance = range;

    for (const entity of entities) {
      if (entity.id === entityId) continue;
      
      // Check if entity has the target component type
      if (!components.hasComponent(entity.id, targetType)) continue;
      
      const targetPos = components.getComponent<PositionComponent>(entity.id, 'position');
      if (!targetPos) continue;

      const distance = Math.sqrt(
        Math.pow(targetPos.x - position.x, 2) + Math.pow(targetPos.y - position.y, 2)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = entity;
      }
    }

    return nearestTarget;
  }
}

// ========== AUDIO SYSTEMS ==========

/**
 * Audio System - Handles audio playback and management
 */
export class AudioSystem implements System {
  readonly name = 'AudioSystem';
  readonly requiredComponents = ['audio'] as const;

  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private playingSounds: Map<string, AudioBufferSourceNode> = new Map();

  update(_entities: Entity[], components: ComponentManager, deltaTime: number, _events: Emitter<ECSEvents>): void {
    const audioEntities = components.getEntitiesWithComponents(this.requiredComponents);

    for (const entityId of audioEntities) {
      const audio = components.getComponent<AudioComponent>(entityId, 'audio');
      if (!audio) continue;

      this.updateAudioComponent(entityId, audio, deltaTime);
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private updateAudioComponent(_entityId: string, audio: AudioComponent, _deltaTime: number): void {
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
        audio.endTime = Date.now() + (buffer.duration * 1000);
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
      throw new Error('Audio context not initialized');
    }

    const response = await fetch(`/audio/${soundId}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.audioBuffers.set(soundId, audioBuffer);
    return audioBuffer;
  }
}

// ========== PHYSICS SYSTEMS ==========

/**
 * Physics System - Handles advanced physics simulation
 */
export class PhysicsSystem implements System {
  readonly name = 'PhysicsSystem';
  readonly requiredComponents = ['position', 'velocity', 'physics'] as const;

  update(_entities: Entity[], components: ComponentManager, deltaTime: number, _events: Emitter<ECSEvents>): void {
    const physicsEntities = components.getEntitiesWithComponents(this.requiredComponents);
    const dt = deltaTime / 1000; // Convert to seconds

    for (const entityId of physicsEntities) {
      const position = components.getComponent<PositionComponent>(entityId, 'position');
      const velocity = components.getComponent<VelocityComponent>(entityId, 'velocity');
      const physics = components.getComponent<PhysicsComponent>(entityId, 'physics');

      if (!position || !velocity || !physics) continue;
      if (physics.isStatic) continue;

      this.applyPhysics(entityId, position, velocity, physics, dt, components);
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  private applyPhysics(
    entityId: string,
    position: PositionComponent,
    velocity: VelocityComponent,
    physics: PhysicsComponent,
    deltaTime: number,
    components: ComponentManager
  ): void {
    // Apply gravity
    if (physics.gravityScale > 0) {
      velocity.y += 9.81 * physics.gravityScale * deltaTime;
    }

    // Apply forces
    const force = components.getComponent<ForceComponent>(entityId, 'force');
    if (force) {
      for (let i = force.forces.length - 1; i >= 0; i--) {
        const f = force.forces[i];
        
        // Apply force based on mass (F = ma, so a = F/m)
        velocity.x += (f.x / physics.mass) * deltaTime;
        velocity.y += (f.y / physics.mass) * deltaTime;

        // Update force duration
        f.duration -= deltaTime * 1000; // Convert back to milliseconds
        
        // Remove expired forces
        if (f.duration <= 0 && f.type === 'impulse') {
          force.forces.splice(i, 1);
        }
      }
    }

    // Apply damping
    velocity.x *= (1 - physics.linearDamping * deltaTime);
    velocity.y *= (1 - physics.linearDamping * deltaTime);

    // Apply friction when on ground
    if (Math.abs(velocity.y) < 0.1) {
      velocity.x *= (1 - physics.friction * deltaTime);
    }

    // Update position
    position.x += velocity.x * deltaTime;
    position.y += velocity.y * deltaTime;
  }

  addForce(entityId: string, forceX: number, forceY: number, duration: number, type: 'impulse' | 'continuous', components: ComponentManager): void {
    let force = components.getComponent<ForceComponent>(entityId, 'force');
    
    if (!force) {
      // Create force component if it doesn't exist
      const newForce: ForceComponent = {
        type: 'force',
        forces: []
      };
      components.addComponent(entityId, newForce);
      force = newForce;
    }

    force.forces.push({
      x: forceX,
      y: forceY,
      duration,
      type
    });
  }
}

// ========== UTILITY SYSTEMS ==========

/**
 * Timer System - Handles timer components and events
 */
export class TimerSystem implements System {
  readonly name = 'TimerSystem';
  readonly requiredComponents = ['timer'] as const;

  update(_entities: Entity[], components: ComponentManager, deltaTime: number, events: Emitter<ECSEvents>): void {
    const timerEntities = components.getEntitiesWithComponents(this.requiredComponents);

    for (const entityId of timerEntities) {
      const timer = components.getComponent<TimerComponent>(entityId, 'timer');
      if (!timer || !timer.isActive) continue;

      timer.elapsed += deltaTime;

      if (timer.elapsed >= timer.duration) {
        // Timer completed
        if (timer.onComplete) {
          events.emit(timer.onComplete as keyof ECSEvents, { entityId } as any);
        }

        if (timer.repeat) {
          timer.elapsed = 0; // Reset for next cycle
        } else {
          timer.isActive = false;
        }
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  startTimer(entityId: string, components: ComponentManager): void {
    const timer = components.getComponent<TimerComponent>(entityId, 'timer');
    if (timer) {
      timer.isActive = true;
      timer.elapsed = 0;
    }
  }

  stopTimer(entityId: string, components: ComponentManager): void {
    const timer = components.getComponent<TimerComponent>(entityId, 'timer');
    if (timer) {
      timer.isActive = false;
    }
  }
}

/**
 * Health System - Handles health, damage, and regeneration
 */
export class HealthSystem implements System {
  readonly name = 'HealthSystem';
  readonly requiredComponents = ['health'] as const;

  update(_entities: Entity[], components: ComponentManager, deltaTime: number, events: Emitter<ECSEvents>): void {
    const healthEntities = components.getEntitiesWithComponents(this.requiredComponents);

    for (const entityId of healthEntities) {
      const health = components.getComponent<HealthComponent>(entityId, 'health');
      if (!health) continue;

      // Apply regeneration
      if (health.regenerationRate && health.regenerationRate > 0 && health.current < health.max) {
        health.current = Math.min(health.max, health.current + (health.regenerationRate * deltaTime / 1000));
      }

      // Check for death
      if (health.current <= 0) {
        events.emit('entity:death' as keyof ECSEvents, { entityId } as any);
      }
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  damage(entityId: string, amount: number, components: ComponentManager, events: Emitter<ECSEvents>): boolean {
    const health = components.getComponent<HealthComponent>(entityId, 'health');
    if (!health || health.invulnerable) return false;

    health.current = Math.max(0, health.current - amount);
    events.emit('entity:damage' as keyof ECSEvents, { entityId, amount, newHealth: health.current } as any);

    return true;
  }

  heal(entityId: string, amount: number, components: ComponentManager, events: Emitter<ECSEvents>): boolean {
    const health = components.getComponent<HealthComponent>(entityId, 'health');
    if (!health) return false;

    const oldHealth = health.current;
    health.current = Math.min(health.max, health.current + amount);
    const actualHealing = health.current - oldHealth;

    if (actualHealing > 0) {
      events.emit('entity:heal' as keyof ECSEvents, { entityId, amount: actualHealing, newHealth: health.current } as any);
      return true;
    }

    return false;
  }
}

/**
 * State Machine System - Handles state transitions and behaviors
 */
export class StateMachineSystem implements System {
  readonly name = 'StateMachineSystem';
  readonly requiredComponents = ['state'] as const;

  update(_entities: Entity[], components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    const stateEntities = components.getEntitiesWithComponents(this.requiredComponents);

    for (const entityId of stateEntities) {
      const state = components.getComponent<StateComponent>(entityId, 'state');
      if (!state) continue;

      // State-specific logic can be added here
      // For now, this system just manages state data
    }
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  changeState(entityId: string, newState: string, components: ComponentManager, events: Emitter<ECSEvents>): boolean {
    const state = components.getComponent<StateComponent>(entityId, 'state');
    if (!state) return false;

    // Check if transition is allowed
    const allowedTransitions = state.transitions[state.currentState];
    if (allowedTransitions && !allowedTransitions.includes(newState)) {
      return false; // Transition not allowed
    }

    const oldState = state.currentState;
    state.previousState = oldState;
    state.currentState = newState;

    events.emit('state:changed' as keyof ECSEvents, { 
      entityId, 
      oldState, 
      newState 
    } as any);

    return true;
  }
}