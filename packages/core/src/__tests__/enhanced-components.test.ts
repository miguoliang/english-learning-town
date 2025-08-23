/**
 * Enhanced Components Tests - New component types and factories
 */

import { describe, it, expect } from "vitest";
import {
  // New component factory functions
  createHealthComponent,
  createStatsComponent,
  createInventoryComponent,
  createAIComponent,
  createStateComponent,
  createAudioComponent,
  createAudioListenerComponent,
  createPhysicsComponent,
  createForceComponent,
  createTimerComponent,
  createTagComponent,

  // Component type definitions
  type HealthComponent,
  type StatsComponent,
  type InventoryComponent,
  type AIComponent,
  type StateComponent,
  type AudioComponent,
  type AudioListenerComponent,
  type PhysicsComponent,
  type ForceComponent,
  type TimerComponent,
  type TagComponent,
} from "../components";

describe("Gameplay Components", () => {
  describe("HealthComponent", () => {
    it("should create health component with basic values", () => {
      const health = createHealthComponent(80, 100);

      expect(health).toEqual({
        type: "health",
        current: 80,
        max: 100,
        regenerationRate: 0,
        invulnerable: false,
      });
    });

    it("should create health component with regeneration", () => {
      const health = createHealthComponent(50, 100, 2.5, true);

      expect(health).toEqual({
        type: "health",
        current: 50,
        max: 100,
        regenerationRate: 2.5,
        invulnerable: true,
      });
    });
  });

  describe("StatsComponent", () => {
    it("should create stats component with all attributes", () => {
      const stats = createStatsComponent(10, 8, 12, 15, 6);

      expect(stats).toEqual({
        type: "stats",
        strength: 10,
        defense: 8,
        speed: 12,
        intelligence: 15,
        luck: 6,
      });
    });
  });

  describe("InventoryComponent", () => {
    it("should create empty inventory with defaults", () => {
      const inventory = createInventoryComponent();

      expect(inventory).toEqual({
        type: "inventory",
        items: [],
        maxSlots: 20,
        weight: 0,
        maxWeight: 100,
      });
    });

    it("should create inventory with custom limits", () => {
      const inventory = createInventoryComponent(50, 250);

      expect(inventory).toEqual({
        type: "inventory",
        items: [],
        maxSlots: 50,
        weight: 0,
        maxWeight: 250,
      });
    });
  });
});

describe("AI Components", () => {
  describe("AIComponent", () => {
    it("should create basic AI component", () => {
      const ai = createAIComponent("patrol");

      expect(ai).toEqual({
        type: "ai",
        behaviorType: "patrol",
        state: "idle",
        detectionRange: 5,
        speed: 1,
        lastDecisionTime: 0,
        decisionCooldown: 1000,
      });
    });

    it("should create AI component with custom parameters", () => {
      const ai = createAIComponent("chase", 10, 3);

      expect(ai).toEqual({
        type: "ai",
        behaviorType: "chase",
        state: "idle",
        detectionRange: 10,
        speed: 3,
        lastDecisionTime: 0,
        decisionCooldown: 1000,
      });
    });

    it("should support all behavior types", () => {
      const behaviors: Array<AIComponent["behaviorType"]> = [
        "idle",
        "patrol",
        "chase",
        "flee",
        "guard",
        "follow",
        "custom",
      ];

      behaviors.forEach((behavior) => {
        const ai = createAIComponent(behavior);
        expect(ai.behaviorType).toBe(behavior);
        expect(ai.type).toBe("ai");
      });
    });
  });

  describe("StateComponent", () => {
    it("should create state component with initial state", () => {
      const state = createStateComponent("walking");

      expect(state).toEqual({
        type: "state",
        currentState: "walking",
        stateData: {},
        transitions: {},
      });
    });

    it("should create state component with data and transitions", () => {
      const stateData = { speed: 2, direction: "north" };
      const transitions = {
        walking: ["running", "idle"],
        running: ["walking"],
      };

      const state = createStateComponent("walking", stateData, transitions);

      expect(state).toEqual({
        type: "state",
        currentState: "walking",
        stateData,
        transitions,
      });
    });
  });
});

describe("Audio Components", () => {
  describe("AudioComponent", () => {
    it("should create audio component with defaults", () => {
      const audio = createAudioComponent("background-music");

      expect(audio).toEqual({
        type: "audio",
        soundId: "background-music",
        volume: 1,
        loop: false,
        isPlaying: false,
      });
    });

    it("should create audio component with custom settings", () => {
      const audio = createAudioComponent("ambient-sound", 0.7, true);

      expect(audio).toEqual({
        type: "audio",
        soundId: "ambient-sound",
        volume: 0.7,
        loop: true,
        isPlaying: false,
      });
    });
  });

  describe("AudioListenerComponent", () => {
    it("should create audio listener with defaults", () => {
      const listener = createAudioListenerComponent();

      expect(listener).toEqual({
        type: "audio-listener",
        range: 10,
        volume: 1,
        isActive: true,
      });
    });

    it("should create audio listener with custom settings", () => {
      const listener = createAudioListenerComponent(25, 0.8, false);

      expect(listener).toEqual({
        type: "audio-listener",
        range: 25,
        volume: 0.8,
        isActive: false,
      });
    });
  });
});

describe("Physics Components", () => {
  describe("PhysicsComponent", () => {
    it("should create physics component with defaults", () => {
      const physics = createPhysicsComponent();

      expect(physics).toEqual({
        type: "physics",
        mass: 1,
        friction: 0.5,
        restitution: 0.2,
        isStatic: false,
        gravityScale: 1,
        linearDamping: 0.1,
        angularDamping: 0.1,
      });
    });

    it("should create physics component with custom values", () => {
      const physics = createPhysicsComponent(2.5, 0.8, 0.9, true);

      expect(physics).toEqual({
        type: "physics",
        mass: 2.5,
        friction: 0.8,
        restitution: 0.9,
        isStatic: true,
        gravityScale: 1,
        linearDamping: 0.1,
        angularDamping: 0.1,
      });
    });
  });

  describe("ForceComponent", () => {
    it("should create empty force component", () => {
      const force = createForceComponent();

      expect(force).toEqual({
        type: "force",
        forces: [],
      });
    });
  });
});

describe("Utility Components", () => {
  describe("TimerComponent", () => {
    it("should create timer component with duration", () => {
      const timer = createTimerComponent(5000);

      expect(timer).toEqual({
        type: "timer",
        duration: 5000,
        elapsed: 0,
        isActive: false,
        repeat: false,
        onComplete: undefined,
      });
    });

    it("should create repeating timer with event", () => {
      const timer = createTimerComponent(1000, true, "timer:ping");

      expect(timer).toEqual({
        type: "timer",
        duration: 1000,
        elapsed: 0,
        isActive: false,
        repeat: true,
        onComplete: "timer:ping",
      });
    });
  });

  describe("TagComponent", () => {
    it("should create empty tag component", () => {
      const tags = createTagComponent();

      expect(tags).toEqual({
        type: "tag",
        tags: [],
      });
    });

    it("should create tag component with initial tags", () => {
      const tags = createTagComponent(["enemy", "hostile", "ai"]);

      expect(tags).toEqual({
        type: "tag",
        tags: ["enemy", "hostile", "ai"],
      });
    });

    it("should create independent tag arrays", () => {
      const originalTags = ["a", "b"];
      const tags = createTagComponent(originalTags);

      // Modify original array
      originalTags.push("c");

      // Component should have independent copy
      expect(tags.tags).toEqual(["a", "b"]);
    });
  });
});

describe("Component Type Consistency", () => {
  it("should have consistent type field across all new components", () => {
    const health = createHealthComponent(100, 100);
    const stats = createStatsComponent(1, 1, 1, 1, 1);
    const inventory = createInventoryComponent();
    const ai = createAIComponent("idle");
    const state = createStateComponent("default");
    const audio = createAudioComponent("test");
    const listener = createAudioListenerComponent();
    const physics = createPhysicsComponent();
    const force = createForceComponent();
    const timer = createTimerComponent(1000);
    const tags = createTagComponent();

    expect(health.type).toBe("health");
    expect(stats.type).toBe("stats");
    expect(inventory.type).toBe("inventory");
    expect(ai.type).toBe("ai");
    expect(state.type).toBe("state");
    expect(audio.type).toBe("audio");
    expect(listener.type).toBe("audio-listener");
    expect(physics.type).toBe("physics");
    expect(force.type).toBe("force");
    expect(timer.type).toBe("timer");
    expect(tags.type).toBe("tag");
  });

  it("should create components that extend base Component interface", () => {
    const components = [
      createHealthComponent(50, 100),
      createStatsComponent(5, 5, 5, 5, 5),
      createAIComponent("patrol"),
      createAudioComponent("test"),
    ];

    components.forEach((component) => {
      expect(component).toHaveProperty("type");
      expect(typeof component.type).toBe("string");
    });
  });
});
