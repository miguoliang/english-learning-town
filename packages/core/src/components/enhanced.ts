/**
 * Enhanced Gameplay Components
 * Health, stats, inventory, AI, state, audio, physics, and advanced gameplay features
 */

import type { Component } from "../core";

// ========== GAMEPLAY COMPONENTS ==========

export interface HealthComponent extends Component {
  readonly type: "health";
  current: number;
  max: number;
  regenerationRate?: number;
  invulnerable?: boolean;
}

export interface StatsComponent extends Component {
  readonly type: "stats";
  strength: number;
  defense: number;
  speed: number;
  intelligence: number;
  luck: number;
}

export interface InventoryComponent extends Component {
  readonly type: "inventory";
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    type: string;
  }>;
  maxSlots: number;
  weight: number;
  maxWeight: number;
}

// ========== AI COMPONENTS ==========

export interface AIComponent extends Component {
  readonly type: "ai";
  behaviorType:
    | "idle"
    | "patrol"
    | "chase"
    | "flee"
    | "guard"
    | "follow"
    | "custom";
  state: string;
  target?: string; // Entity ID
  patrolPoints?: Array<{ x: number; y: number }>;
  currentPatrolIndex?: number;
  detectionRange: number;
  speed: number;
  lastDecisionTime: number;
  decisionCooldown: number;
}

export interface StateComponent extends Component {
  readonly type: "state";
  currentState: string;
  previousState?: string;
  stateData: Record<string, any>;
  transitions: Record<string, string[]>; // state -> allowed next states
}

// ========== AUDIO COMPONENTS ==========

export interface AudioComponent extends Component {
  readonly type: "audio";
  soundId: string;
  volume: number;
  loop: boolean;
  isPlaying: boolean;
  startTime?: number;
  endTime?: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioListenerComponent extends Component {
  readonly type: "audio-listener";
  range: number;
  volume: number;
  isActive: boolean;
}

// ========== PHYSICS COMPONENTS ==========

export interface PhysicsComponent extends Component {
  readonly type: "physics";
  mass: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  isSensor?: boolean;
  gravityScale: number;
  linearDamping: number;
  angularDamping: number;
}

export interface ForceComponent extends Component {
  readonly type: "force";
  forces: Array<{
    x: number;
    y: number;
    duration: number;
    type: "impulse" | "continuous";
  }>;
}

export interface TimerComponent extends Component {
  readonly type: "timer";
  duration: number;
  elapsed: number;
  isActive: boolean;
  repeat: boolean;
  onComplete?: string; // Event to emit
}

export interface TagComponent extends Component {
  readonly type: "tag";
  tags: string[];
}

// Factory functions
export const createHealthComponent = (
  current: number,
  max: number,
  regenerationRate = 0,
  invulnerable = false,
): HealthComponent => ({
  type: "health",
  current,
  max,
  regenerationRate,
  invulnerable,
});

export const createStatsComponent = (
  strength: number,
  defense: number,
  speed: number,
  intelligence: number,
  luck: number,
): StatsComponent => ({
  type: "stats",
  strength,
  defense,
  speed,
  intelligence,
  luck,
});

export const createInventoryComponent = (
  maxSlots: number = 20,
  maxWeight: number = 100,
): InventoryComponent => ({
  type: "inventory",
  items: [],
  maxSlots,
  weight: 0,
  maxWeight,
});

export const createAIComponent = (
  behaviorType:
    | "idle"
    | "patrol"
    | "chase"
    | "flee"
    | "guard"
    | "follow"
    | "custom",
  detectionRange: number = 5,
  speed: number = 1,
  decisionCooldown: number = 1000,
): AIComponent => ({
  type: "ai",
  behaviorType,
  state: "idle",
  detectionRange,
  speed,
  lastDecisionTime: 0,
  decisionCooldown,
});

export const createStateComponent = (
  initialState: string,
  stateData: Record<string, any> = {},
  transitions: Record<string, string[]> = {},
): StateComponent => ({
  type: "state",
  currentState: initialState,
  stateData,
  transitions,
});

export const createAudioComponent = (
  soundId: string,
  volume: number = 1,
  loop: boolean = false,
): AudioComponent => ({
  type: "audio",
  soundId,
  volume,
  loop,
  isPlaying: false,
});

export const createAudioListenerComponent = (
  range: number = 10,
  volume: number = 1,
  isActive: boolean = true,
): AudioListenerComponent => ({
  type: "audio-listener",
  range,
  volume,
  isActive,
});

export const createPhysicsComponent = (
  mass: number = 1,
  friction: number = 0.5,
  restitution: number = 0.2,
  isStatic: boolean = false,
): PhysicsComponent => ({
  type: "physics",
  mass,
  friction,
  restitution,
  isStatic,
  gravityScale: 1,
  linearDamping: 0.1,
  angularDamping: 0.1,
});

export const createForceComponent = (): ForceComponent => ({
  type: "force",
  forces: [],
});

export const createTimerComponent = (
  duration: number,
  repeat: boolean = false,
  onComplete?: string,
): TimerComponent => {
  const component: TimerComponent = {
    type: "timer",
    duration,
    elapsed: 0,
    isActive: false,
    repeat,
  };
  if (onComplete !== undefined) component.onComplete = onComplete;
  return component;
};

export const createTagComponent = (tags: string[] = []): TagComponent => ({
  type: "tag",
  tags: [...tags],
});
