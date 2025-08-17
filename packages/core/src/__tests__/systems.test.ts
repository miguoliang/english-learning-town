/**
 * Advanced Systems Tests - AI, Audio, Physics, and Utility Systems
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { World, type ComponentManager, type Emitter, type ECSEvents } from '../core';
import {
  AISystem,
  HealthSystem,
  TimerSystem,
  StateMachineSystem
} from '../systems';
import {
  createPositionComponent,
  createVelocityComponent,
  createAIComponent,
  createHealthComponent,
  createTimerComponent,
  createStateComponent,
  createPlayerComponent
} from '../components';

describe('AI System', () => {
  let world: World;
  let aiSystem: AISystem;
  let componentManager: ComponentManager;
  let events: Emitter<ECSEvents>;

  beforeEach(() => {
    world = new World();
    aiSystem = new AISystem();
    componentManager = world.getComponentManager();
    events = world.getEventBus();
    world.addSystem(aiSystem);
  });

  describe('System Setup', () => {
    it('should have correct name and required components', () => {
      expect(aiSystem.name).toBe('AISystem');
      expect(aiSystem.requiredComponents).toEqual(['position', 'ai', 'velocity']);
    });

    it('should process entities with required components', () => {
      const entity = world.createEntity('ai-entity');
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createVelocityComponent());
      world.addComponent(entity.id, createAIComponent('idle'));

      expect(aiSystem.canProcess(entity, componentManager)).toBe(true);
    });

    it('should not process entities missing required components', () => {
      const entity = world.createEntity('incomplete-entity');
      world.addComponent(entity.id, createPositionComponent(0, 0));
      // Missing velocity and ai components

      expect(aiSystem.canProcess(entity, componentManager)).toBe(false);
    });
  });

  describe('AI Behaviors', () => {
    it('should handle idle behavior', () => {
      const entity = world.createEntity('idle-npc');
      world.addComponent(entity.id, createPositionComponent(5, 5));
      world.addComponent(entity.id, createVelocityComponent(1, 1)); // Start with some velocity
      const aiComponent = createAIComponent('idle');
      aiComponent.lastDecisionTime = 0; // Force immediate decision
      world.addComponent(entity.id, aiComponent);

      world.update();

      const velocity = world.getComponent(entity.id, 'velocity');
      expect(velocity?.x).toBe(0);
      expect(velocity?.y).toBe(0);
    });

    it('should handle patrol behavior', () => {
      const entity = world.createEntity('patrol-npc');
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createVelocityComponent());
      const aiComponent = createAIComponent('patrol');
      aiComponent.patrolPoints = [
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 0, y: 5 }
      ];
      aiComponent.lastDecisionTime = 0;
      world.addComponent(entity.id, aiComponent);

      world.update();

      const velocity = world.getComponent(entity.id, 'velocity');
      expect(velocity?.x).toBeGreaterThan(0); // Should move toward first patrol point
      expect(velocity?.y).toBe(0);
    });

    it('should handle chase behavior', () => {
      // Create target entity (player)
      const player = world.createEntity('player');
      world.addComponent(player.id, createPositionComponent(10, 0));
      world.addComponent(player.id, createPlayerComponent('Target'));

      // Create AI entity
      const entity = world.createEntity('chaser');
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createVelocityComponent());
      const aiComponent = createAIComponent('chase', 15, 2); // Large detection range
      aiComponent.lastDecisionTime = 0;
      world.addComponent(entity.id, aiComponent);

      world.update();

      const velocity = world.getComponent(entity.id, 'velocity');
      expect(velocity?.x).toBeGreaterThan(0); // Should chase toward player
      expect(aiComponent.target).toBe('player');
    });

    it('should handle flee behavior', () => {
      // Create threat entity (player)
      const player = world.createEntity('player');
      world.addComponent(player.id, createPositionComponent(2, 0));
      world.addComponent(player.id, createPlayerComponent('Threat'));

      // Create AI entity
      const entity = world.createEntity('fleer');
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createVelocityComponent());
      const aiComponent = createAIComponent('flee', 5, 3);
      aiComponent.lastDecisionTime = 0;
      world.addComponent(entity.id, aiComponent);

      world.update();

      const velocity = world.getComponent(entity.id, 'velocity');
      expect(velocity?.x).toBeLessThan(0); // Should flee away from player
    });
  });

  describe('Decision Cooldown', () => {
    it('should respect decision cooldown', () => {
      const entity = world.createEntity('cooldown-test');
      world.addComponent(entity.id, createPositionComponent(0, 0));
      world.addComponent(entity.id, createVelocityComponent(5, 5)); // Start with velocity
      const aiComponent = createAIComponent('idle');
      aiComponent.lastDecisionTime = Date.now(); // Recent decision
      world.addComponent(entity.id, aiComponent);

      world.update();

      const velocity = world.getComponent(entity.id, 'velocity');
      expect(velocity?.x).toBe(5); // Should not have changed due to cooldown
      expect(velocity?.y).toBe(5);
    });
  });
});

describe('Health System', () => {
  let world: World;
  let healthSystem: HealthSystem;
  let events: Emitter<ECSEvents>;

  beforeEach(() => {
    world = new World();
    healthSystem = new HealthSystem();
    events = world.getEventBus();
    world.addSystem(healthSystem);
  });

  describe('System Setup', () => {
    it('should have correct name and required components', () => {
      expect(healthSystem.name).toBe('HealthSystem');
      expect(healthSystem.requiredComponents).toEqual(['health']);
    });
  });

  describe('Health Regeneration', () => {
    it('should regenerate health over time', () => {
      const entity = world.createEntity('regen-entity');
      world.addComponent(entity.id, createHealthComponent(50, 100, 10)); // 10 hp/sec regen

      const initialHealth = world.getComponent(entity.id, 'health');
      expect(initialHealth?.current).toBe(50);

      // Simulate 1 second passed by calling update twice with a delay
      world.update(); // First call establishes lastUpdateTime
      
      // Manually advance time and call update again
      const healthSystem = world.getSystems().find(s => s.name === 'HealthSystem') as HealthSystem;
      const entities = world.getAllEntities();
      healthSystem.update(entities, world.getComponentManager(), 1000, world.getEventBus()); // 1000ms = 1 second

      const regenHealth = world.getComponent(entity.id, 'health');
      expect(regenHealth?.current).toBeGreaterThan(50);
      expect(regenHealth?.current).toBeLessThanOrEqual(100);
    });

    it('should not regenerate beyond max health', () => {
      const entity = world.createEntity('max-health-entity');
      world.addComponent(entity.id, createHealthComponent(95, 100, 20)); // High regen

      world.update();

      const health = world.getComponent(entity.id, 'health');
      expect(health?.current).toBeLessThanOrEqual(100);
    });
  });

  describe('Damage and Healing', () => {
    it('should apply damage correctly', () => {
      const entity = world.createEntity('damage-target');
      world.addComponent(entity.id, createHealthComponent(100, 100));

      const eventSpy = vi.fn();
      events.on('entity:damage' as keyof ECSEvents, eventSpy);

      const success = healthSystem.damage(entity.id, 30, world.getComponentManager(), events);

      expect(success).toBe(true);
      const health = world.getComponent(entity.id, 'health');
      expect(health?.current).toBe(70);
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: entity.id,
        amount: 30,
        newHealth: 70
      });
    });

    it('should not damage invulnerable entities', () => {
      const entity = world.createEntity('invulnerable-entity');
      world.addComponent(entity.id, createHealthComponent(100, 100, 0, true)); // Invulnerable

      const success = healthSystem.damage(entity.id, 50, world.getComponentManager(), events);

      expect(success).toBe(false);
      const health = world.getComponent(entity.id, 'health');
      expect(health?.current).toBe(100); // No damage taken
    });

    it('should heal entities correctly', () => {
      const entity = world.createEntity('heal-target');
      world.addComponent(entity.id, createHealthComponent(30, 100));

      const eventSpy = vi.fn();
      events.on('entity:heal' as keyof ECSEvents, eventSpy);

      const success = healthSystem.heal(entity.id, 40, world.getComponentManager(), events);

      expect(success).toBe(true);
      const health = world.getComponent(entity.id, 'health');
      expect(health?.current).toBe(70);
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: entity.id,
        amount: 40,
        newHealth: 70
      });
    });

    it('should not heal beyond max health', () => {
      const entity = world.createEntity('overheal-target');
      world.addComponent(entity.id, createHealthComponent(90, 100));

      const success = healthSystem.heal(entity.id, 20, world.getComponentManager(), events);

      expect(success).toBe(true);
      const health = world.getComponent(entity.id, 'health');
      expect(health?.current).toBe(100); // Capped at max
    });

    it('should emit death event when health reaches zero', () => {
      const entity = world.createEntity('death-target');
      world.addComponent(entity.id, createHealthComponent(1, 100));

      const deathSpy = vi.fn();
      events.on('entity:death' as keyof ECSEvents, deathSpy);

      healthSystem.damage(entity.id, 5, world.getComponentManager(), events);
      world.update(); // Trigger death check

      expect(deathSpy).toHaveBeenCalledWith({ entityId: entity.id });
    });
  });
});

describe('Timer System', () => {
  let world: World;
  let timerSystem: TimerSystem;
  let events: Emitter<ECSEvents>;

  beforeEach(() => {
    world = new World();
    timerSystem = new TimerSystem();
    events = world.getEventBus();
    world.addSystem(timerSystem);
  });

  describe('System Setup', () => {
    it('should have correct name and required components', () => {
      expect(timerSystem.name).toBe('TimerSystem');
      expect(timerSystem.requiredComponents).toEqual(['timer']);
    });
  });

  describe('Timer Operations', () => {
    it('should start and stop timers', () => {
      const entity = world.createEntity('timer-entity');
      world.addComponent(entity.id, createTimerComponent(1000));

      let timer = world.getComponent(entity.id, 'timer');
      expect(timer?.isActive).toBe(false);

      timerSystem.startTimer(entity.id, world.getComponentManager());
      timer = world.getComponent(entity.id, 'timer');
      expect(timer?.isActive).toBe(true);
      expect(timer?.elapsed).toBe(0);

      timerSystem.stopTimer(entity.id, world.getComponentManager());
      timer = world.getComponent(entity.id, 'timer');
      expect(timer?.isActive).toBe(false);
    });

    it('should not update inactive timers', () => {
      const entity = world.createEntity('inactive-timer');
      world.addComponent(entity.id, createTimerComponent(1000));

      const timer = world.getComponent(entity.id, 'timer');
      expect(timer?.elapsed).toBe(0);

      world.update(); // Should not change elapsed time

      expect(timer?.elapsed).toBe(0);
    });

    it('should emit completion event', () => {
      const entity = world.createEntity('completion-timer');
      world.addComponent(entity.id, createTimerComponent(100, false, 'timer:completed'));

      const eventSpy = vi.fn();
      events.on('timer:completed' as keyof ECSEvents, eventSpy);

      timerSystem.startTimer(entity.id, world.getComponentManager());
      
      // Simulate time passing beyond duration
      const timer = world.getComponent(entity.id, 'timer');
      if (timer) {
        timer.elapsed = 150; // Exceed duration
      }

      world.update();

      expect(eventSpy).toHaveBeenCalledWith({ entityId: entity.id });
      expect(timer?.isActive).toBe(false); // Should stop after completion
    });

    it('should handle repeating timers', () => {
      const entity = world.createEntity('repeat-timer');
      world.addComponent(entity.id, createTimerComponent(100, true));

      timerSystem.startTimer(entity.id, world.getComponentManager());
      
      const timer = world.getComponent(entity.id, 'timer');
      if (timer) {
        timer.elapsed = 150; // Exceed duration
      }

      world.update();

      expect(timer?.isActive).toBe(true); // Should remain active
      expect(timer?.elapsed).toBe(0); // Should reset
    });
  });
});

describe('State Machine System', () => {
  let world: World;
  let stateSystem: StateMachineSystem;
  let events: Emitter<ECSEvents>;

  beforeEach(() => {
    world = new World();
    stateSystem = new StateMachineSystem();
    events = world.getEventBus();
    world.addSystem(stateSystem);
  });

  describe('System Setup', () => {
    it('should have correct name and required components', () => {
      expect(stateSystem.name).toBe('StateMachineSystem');
      expect(stateSystem.requiredComponents).toEqual(['state']);
    });
  });

  describe('State Transitions', () => {
    it('should change state successfully', () => {
      const entity = world.createEntity('state-entity');
      const transitions = {
        idle: ['walking', 'running'],
        walking: ['idle', 'running'],
        running: ['walking', 'idle']
      };
      world.addComponent(entity.id, createStateComponent('idle', {}, transitions));

      const eventSpy = vi.fn();
      events.on('state:changed' as keyof ECSEvents, eventSpy);

      const success = stateSystem.changeState(entity.id, 'walking', world.getComponentManager(), events);

      expect(success).toBe(true);
      const state = world.getComponent(entity.id, 'state');
      expect(state?.currentState).toBe('walking');
      expect(state?.previousState).toBe('idle');
      
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: entity.id,
        oldState: 'idle',
        newState: 'walking'
      });
    });

    it('should reject invalid transitions', () => {
      const entity = world.createEntity('restricted-entity');
      const transitions = {
        locked: ['unlocked'], // Can only go to unlocked
        unlocked: []          // Cannot transition anywhere
      };
      world.addComponent(entity.id, createStateComponent('locked', {}, transitions));

      // Try invalid transition
      const success = stateSystem.changeState(entity.id, 'walking', world.getComponentManager(), events);

      expect(success).toBe(false);
      const state = world.getComponent(entity.id, 'state');
      expect(state?.currentState).toBe('locked'); // Should remain unchanged
    });

    it('should allow transitions when no restrictions defined', () => {
      const entity = world.createEntity('free-entity');
      world.addComponent(entity.id, createStateComponent('any-state'));

      const success = stateSystem.changeState(entity.id, 'new-state', world.getComponentManager(), events);

      expect(success).toBe(true);
      const state = world.getComponent(entity.id, 'state');
      expect(state?.currentState).toBe('new-state');
    });
  });
});