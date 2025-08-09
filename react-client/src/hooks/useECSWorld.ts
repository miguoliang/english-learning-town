/**
 * ECS World React Hook
 * Manages ECS world lifecycle and provides integration with React components
 */

import { useMemo, useEffect, useRef } from 'react';
import { World } from '../ecs/core';
import { SceneLoader } from '../ecs/sceneLoader';
import { 
  CollisionSystem,
  MovementSystem, 
  KeyboardInputSystem,
  MouseInputSystem,
  InteractionSystem, 
  RenderSystem,
  AnimationSystem,
  MovementAnimationSystem
} from '../ecs/systems';

interface UseECSWorldOptions {
  enableSystems?: boolean;
  initialScene?: string;
}

interface UseECSWorldReturn {
  world: World;
  sceneLoader: SceneLoader;
  keyboardInputSystem: KeyboardInputSystem;
  mouseInputSystem: MouseInputSystem;
  loadScene: (scenePath: string) => Promise<void>;
  addPlayer: (playerId: string, position: { x: number; y: number }, name?: string) => void;
  cleanup: () => void;
}

export const useECSWorld = (options: UseECSWorldOptions = {}): UseECSWorldReturn => {
  const { enableSystems = true, initialScene } = options;

  // Create world instance (only once)
  const world = useMemo(() => new World(), []);
  const sceneLoader = useMemo(() => new SceneLoader(world), [world]);
  
  // System instances
  const systems = useMemo(() => ({
    collision: new CollisionSystem(),
    movement: new MovementSystem(),
    keyboardInput: new KeyboardInputSystem(),
    mouseInput: new MouseInputSystem(),
    interaction: new InteractionSystem(),
    render: new RenderSystem(),
    animation: new AnimationSystem(),
    movementAnimation: new MovementAnimationSystem()
  }), []);

  // Track if systems are initialized
  const systemsInitialized = useRef(false);

  // Initialize systems
  useEffect(() => {
    if (enableSystems && !systemsInitialized.current) {
      // Add all systems to world
      world.addSystem(systems.collision);
      world.addSystem(systems.movement);
      world.addSystem(systems.keyboardInput);
      world.addSystem(systems.mouseInput);
      world.addSystem(systems.interaction);
      world.addSystem(systems.render);
      world.addSystem(systems.animation);
      world.addSystem(systems.movementAnimation);

      // Set up event listeners
      setupEventListeners(world, systems);
      
      systemsInitialized.current = true;
    }
  }, [world, systems, enableSystems]);

  // Load initial scene
  useEffect(() => {
    if (initialScene) {
      loadScene(initialScene).catch(console.error);
    }
  }, [initialScene]);

  // Scene loading function
  const loadScene = async (scenePath: string): Promise<void> => {
    try {
      await sceneLoader.loadSceneFromFile(scenePath);
    } catch (error) {
      console.error('Failed to load scene:', error);
      throw error;
    }
  };

  // Add player function
  const addPlayer = (playerId: string, position: { x: number; y: number }, name = 'Player'): void => {
    sceneLoader.addPlayer(playerId, position, name);
  };

  // Cleanup function
  const cleanup = (): void => {
    world.destroy();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    world,
    sceneLoader,
    keyboardInputSystem: systems.keyboardInput,
    mouseInputSystem: systems.mouseInput,
    loadScene,
    addPlayer,
    cleanup
  };
};

/**
 * Set up event listeners for system coordination
 */
function setupEventListeners(world: World, systems: any) {
  const eventBus = world.getEventBus();

  // Handle input events
  eventBus.subscribe('input:key-down', (event) => {
    systems.keyboardInput.setKeyPressed(event.data.key, true);
  });

  eventBus.subscribe('input:key-up', (event) => {
    systems.keyboardInput.setKeyPressed(event.data.key, false);
  });

  eventBus.subscribe('input:canvas-click', (event) => {
    const entities = world.getAllEntities();
    const components = world.getComponentManager();
    systems.mouseInput.handleMouseClick(event.data.x, event.data.y, entities, components, eventBus);
  });

  eventBus.subscribe('input:entity-click', (event) => {
    // Find player entity for interaction
    const components = world.getComponentManager();
    const playerEntities = components.getEntitiesWithComponent('player');
    if (playerEntities.length > 0) {
      const playerId = playerEntities[0];
      systems.interaction.handleInteraction(playerId, event.data.entityId, components, eventBus);
    }
  });

  // Handle scene transitions
  eventBus.subscribe('scene:transition', (event) => {
    eventBus.emit('app:scene-transition-request', event.data);
  });

  // Handle dialogue events
  eventBus.subscribe('dialogue:start', (event) => {
    eventBus.emit('app:dialogue-start', event.data);
  });

  // Handle learning activities
  eventBus.subscribe('learning:start', (event) => {
    eventBus.emit('app:learning-start', event.data);
  });

  // Handle quest interactions
  eventBus.subscribe('quest:interact', (event) => {
    eventBus.emit('app:quest-interact', event.data);
  });

  // Handle movement events
  eventBus.subscribe('entity:moved', (_event) => {
    // Could be used for sound effects, camera following, etc.
  });

  // Handle collision events
  eventBus.subscribe('entity:collision', (_event) => {
    // Could be used for collision feedback, sound effects, etc.
  });

  // Scene loaded event handling
  eventBus.subscribe('scene:loaded', (_event) => {
    // Scene loaded - could trigger achievements, analytics, etc.
  });
}