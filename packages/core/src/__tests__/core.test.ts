/**
 * Core ECS Tests - World, ComponentManager, Entity system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { World, ComponentManager, type Entity, type Component, type System, type Emitter, type ECSEvents } from '../core';
import { ecsEventBus, ECSEventTypes } from '../events';

// Test component interfaces
interface TestComponent extends Component {
  readonly type: 'test';
  value: string;
}

interface PositionComponent extends Component {
  readonly type: 'position';
  x: number;
  y: number;
}

interface HealthComponent extends Component {
  readonly type: 'health';
  current: number;
  max: number;
}

// Test system implementation
class TestSystem implements System {
  readonly name = 'TestSystem';
  readonly requiredComponents = ['test'] as const;
  
  updateCalls = 0;
  lastEntities: Entity[] = [];

  update(entities: Entity[], components: ComponentManager, _deltaTime: number, _events: Emitter<ECSEvents>): void {
    this.updateCalls++;
    this.lastEntities = entities.filter(entity => 
      components.hasAllComponents(entity.id, this.requiredComponents)
    );
  }

  canProcess(entity: Entity, components: ComponentManager): boolean {
    return components.hasAllComponents(entity.id, this.requiredComponents);
  }

  reset(): void {
    this.updateCalls = 0;
    this.lastEntities = [];
  }
}

describe('ComponentManager', () => {
  let componentManager: ComponentManager;

  beforeEach(() => {
    componentManager = new ComponentManager();
  });

  describe('Component Management', () => {
    it('should add and retrieve components', () => {
      const component: TestComponent = { type: 'test', value: 'hello' };
      
      componentManager.addComponent('entity1', component);
      
      const retrieved = componentManager.getComponent<TestComponent>('entity1', 'test');
      expect(retrieved).toEqual(component);
    });

    it('should return undefined for non-existent components', () => {
      const component = componentManager.getComponent('entity1', 'test');
      expect(component).toBeUndefined();
    });

    it('should remove components', () => {
      const component: TestComponent = { type: 'test', value: 'hello' };
      
      componentManager.addComponent('entity1', component);
      expect(componentManager.hasComponent('entity1', 'test')).toBe(true);
      
      componentManager.removeComponent('entity1', 'test');
      expect(componentManager.hasComponent('entity1', 'test')).toBe(false);
    });

    it('should check if entity has specific component', () => {
      const component: TestComponent = { type: 'test', value: 'hello' };
      
      expect(componentManager.hasComponent('entity1', 'test')).toBe(false);
      
      componentManager.addComponent('entity1', component);
      expect(componentManager.hasComponent('entity1', 'test')).toBe(true);
    });

    it('should check if entity has all required components', () => {
      const testComponent: TestComponent = { type: 'test', value: 'hello' };
      const positionComponent: PositionComponent = { type: 'position', x: 10, y: 20 };
      
      componentManager.addComponent('entity1', testComponent);
      componentManager.addComponent('entity1', positionComponent);
      
      expect(componentManager.hasAllComponents('entity1', ['test', 'position'])).toBe(true);
      expect(componentManager.hasAllComponents('entity1', ['test', 'health'])).toBe(false);
    });
  });

  describe('Entity Queries', () => {
    beforeEach(() => {
      // Set up test entities with different component combinations
      componentManager.addComponent('entity1', { type: 'test', value: 'one' } as TestComponent);
      componentManager.addComponent('entity1', { type: 'position', x: 1, y: 1 } as PositionComponent);
      
      componentManager.addComponent('entity2', { type: 'test', value: 'two' } as TestComponent);
      componentManager.addComponent('entity2', { type: 'health', current: 100, max: 100 } as HealthComponent);
      
      componentManager.addComponent('entity3', { type: 'position', x: 3, y: 3 } as PositionComponent);
      componentManager.addComponent('entity3', { type: 'health', current: 50, max: 100 } as HealthComponent);
    });

    it('should get entities with specific component', () => {
      const testEntities = componentManager.getEntitiesWithComponent('test');
      expect(testEntities).toEqual(['entity1', 'entity2']);
      
      const positionEntities = componentManager.getEntitiesWithComponent('position');
      expect(positionEntities).toEqual(['entity1', 'entity3']);
      
      const healthEntities = componentManager.getEntitiesWithComponent('health');
      expect(healthEntities).toEqual(['entity2', 'entity3']);
    });

    it('should get entities with all specified components', () => {
      const testPositionEntities = componentManager.getEntitiesWithComponents(['test', 'position']);
      expect(testPositionEntities).toEqual(['entity1']);
      
      const testHealthEntities = componentManager.getEntitiesWithComponents(['test', 'health']);
      expect(testHealthEntities).toEqual(['entity2']);
      
      const positionHealthEntities = componentManager.getEntitiesWithComponents(['position', 'health']);
      expect(positionHealthEntities).toEqual(['entity3']);
      
      const allThreeEntities = componentManager.getEntitiesWithComponents(['test', 'position', 'health']);
      expect(allThreeEntities).toEqual([]);
    });

    it('should handle empty component queries', () => {
      const entities = componentManager.getEntitiesWithComponents([]);
      expect(entities).toEqual([]);
    });
  });

  describe('Entity Cleanup', () => {
    it('should remove all components for an entity', () => {
      const testComponent: TestComponent = { type: 'test', value: 'hello' };
      const positionComponent: PositionComponent = { type: 'position', x: 10, y: 20 };
      
      componentManager.addComponent('entity1', testComponent);
      componentManager.addComponent('entity1', positionComponent);
      
      expect(componentManager.hasComponent('entity1', 'test')).toBe(true);
      expect(componentManager.hasComponent('entity1', 'position')).toBe(true);
      
      componentManager.removeEntity('entity1');
      
      expect(componentManager.hasComponent('entity1', 'test')).toBe(false);
      expect(componentManager.hasComponent('entity1', 'position')).toBe(false);
    });
  });
});

describe('World', () => {
  let world: World;
  let testSystem: TestSystem;

  beforeEach(() => {
    world = new World();
    testSystem = new TestSystem();
    vi.clearAllMocks();
  });

  describe('Entity Management', () => {
    it('should create entities with unique IDs', () => {
      const entity1 = world.createEntity('player');
      const entity2 = world.createEntity('enemy');
      
      expect(entity1.id).toBe('player');
      expect(entity2.id).toBe('enemy');
      expect(entity1.id).not.toBe(entity2.id);
    });

    it('should not allow duplicate entity IDs', () => {
      world.createEntity('player');
      
      expect(() => world.createEntity('player')).toThrow('Entity with id "player" already exists');
    });

    it('should retrieve entities by ID', () => {
      const entity = world.createEntity('player');
      
      const retrieved = world.getEntity('player');
      expect(retrieved).toEqual(entity);
    });

    it('should return undefined for non-existent entities', () => {
      const entity = world.getEntity('nonexistent');
      expect(entity).toBeUndefined();
    });

    it('should get all entities', () => {
      const entity1 = world.createEntity('player');
      const entity2 = world.createEntity('enemy');
      
      const allEntities = world.getAllEntities();
      expect(allEntities).toEqual([entity1, entity2]);
    });

    it('should remove entities', () => {
      world.createEntity('player');
      expect(world.getEntity('player')).toBeDefined();
      
      world.removeEntity('player');
      expect(world.getEntity('player')).toBeUndefined();
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      world.createEntity('player');
    });

    it('should add components to entities', () => {
      const component: TestComponent = { type: 'test', value: 'hello' };
      
      world.addComponent('player', component);
      
      const retrieved = world.getComponent<TestComponent>('player', 'test');
      expect(retrieved).toEqual(component);
    });

    it('should emit events when components are added', () => {
      const eventSpy = vi.fn();
      world.getEventBus().on(ECSEventTypes.COMPONENT_ADDED, eventSpy);
      
      const component: TestComponent = { type: 'test', value: 'hello' };
      world.addComponent('player', component);
      
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: 'player',
        componentType: 'test'
      });
    });

    it('should remove components from entities', () => {
      const component: TestComponent = { type: 'test', value: 'hello' };
      world.addComponent('player', component);
      
      world.removeComponent('player', 'test');
      
      const retrieved = world.getComponent('player', 'test');
      expect(retrieved).toBeUndefined();
    });

    it('should emit events when components are removed', () => {
      const component: TestComponent = { type: 'test', value: 'hello' };
      world.addComponent('player', component);
      
      const eventSpy = vi.fn();
      world.getEventBus().on(ECSEventTypes.COMPONENT_REMOVED, eventSpy);
      
      world.removeComponent('player', 'test');
      
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: 'player',
        componentType: 'test'
      });
    });
  });

  describe('System Management', () => {
    it('should add systems to the world', () => {
      world.addSystem(testSystem);
      
      // Should be able to update without errors
      world.update();
      expect(testSystem.updateCalls).toBe(1);
    });

    it('should remove systems from the world', () => {
      world.addSystem(testSystem);
      world.update();
      expect(testSystem.updateCalls).toBe(1);
      
      world.removeSystem('TestSystem');
      testSystem.reset();
      
      world.update();
      expect(testSystem.updateCalls).toBe(0);
    });

    it('should pass entities to systems during update', () => {
      world.addSystem(testSystem);
      
      // Create entities with required components
      world.createEntity('entity1');
      world.createEntity('entity2');
      world.addComponent('entity1', { type: 'test', value: 'one' } as TestComponent);
      world.addComponent('entity2', { type: 'test', value: 'two' } as TestComponent);
      
      world.update();
      
      expect(testSystem.lastEntities).toHaveLength(2);
      expect(testSystem.lastEntities.map(e => e.id)).toEqual(['entity1', 'entity2']);
    });

    it('should provide component manager to systems', () => {
      const componentManager = world.getComponentManager();
      expect(componentManager).toBeInstanceOf(ComponentManager);
    });

    it('should provide event bus to systems', () => {
      const eventBus = world.getEventBus();
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.on).toBe('function');
    });
  });

  describe('Entity Lifecycle Events', () => {
    it('should emit events when entities are added', () => {
      const eventSpy = vi.fn();
      world.getEventBus().on(ECSEventTypes.ENTITY_ADDED, eventSpy);
      
      world.createEntity('player');
      
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: 'player'
      });
    });

    it('should emit events when entities are removed', () => {
      world.createEntity('player');
      
      const eventSpy = vi.fn();
      world.getEventBus().on(ECSEventTypes.ENTITY_REMOVED, eventSpy);
      
      world.removeEntity('player');
      
      expect(eventSpy).toHaveBeenCalledWith({
        entityId: 'player'
      });
    });
  });

  describe('World Cleanup', () => {
    it('should destroy world and clean up resources', () => {
      world.createEntity('player');
      world.addSystem(testSystem);
      
      const eventBus = world.getEventBus();
      const eventSpy = vi.fn();
      eventBus.on(ECSEventTypes.ENTITY_ADDED, eventSpy);
      
      world.destroy();
      
      // After destroy, world should be clean
      expect(world.getAllEntities()).toEqual([]);
      
      // Should not throw errors when calling methods after destroy
      expect(() => world.update()).not.toThrow();
    });
  });

  describe('Delta Time Tracking', () => {
    it('should provide delta time to systems', () => {
      let capturedDeltaTime: number | undefined;
      
      class DeltaTestSystem implements System {
        readonly name = 'DeltaTestSystem';
        readonly requiredComponents = [] as const;
        
        update(_entities: Entity[], _components: ComponentManager, deltaTime: number): void {
          capturedDeltaTime = deltaTime;
        }
        
        canProcess(): boolean {
          return true;
        }
      }
      
      world.addSystem(new DeltaTestSystem());
      
      // First update
      world.update();
      expect(capturedDeltaTime).toBeGreaterThanOrEqual(0);
      
      // Second update should have a small delta
      const firstDelta = capturedDeltaTime;
      world.update();
      expect(capturedDeltaTime).toBeGreaterThanOrEqual(firstDelta);
    });
  });
});

describe('ECS Integration', () => {
  let world: World;

  beforeEach(() => {
    world = new World();
  });

  it('should handle complex entity-component-system interactions', () => {
    // Create a position system that moves entities
    class MovementSystem implements System {
      readonly name = 'MovementSystem';
      readonly requiredComponents = ['position', 'velocity'] as const;
      
      update(entities: Entity[], components: ComponentManager): void {
        const movableEntities = components.getEntitiesWithComponents(this.requiredComponents);
        
        for (const entityId of movableEntities) {
          const position = components.getComponent<PositionComponent>(entityId, 'position');
          const velocity = components.getComponent<{ type: 'velocity'; x: number; y: number }>(entityId, 'velocity');
          
          if (position && velocity) {
            position.x += velocity.x;
            position.y += velocity.y;
          }
        }
      }
      
      canProcess(entity: Entity, components: ComponentManager): boolean {
        return components.hasAllComponents(entity.id, this.requiredComponents);
      }
    }
    
    // Set up entities and components
    const player = world.createEntity('player');
    world.addComponent(player.id, { type: 'position', x: 0, y: 0 } as PositionComponent);
    world.addComponent(player.id, { type: 'velocity', x: 1, y: 2 });
    
    world.addSystem(new MovementSystem());
    
    // Test movement over multiple frames
    world.update();
    let position = world.getComponent<PositionComponent>('player', 'position');
    expect(position?.x).toBe(1);
    expect(position?.y).toBe(2);
    
    world.update();
    position = world.getComponent<PositionComponent>('player', 'position');
    expect(position?.x).toBe(2);
    expect(position?.y).toBe(4);
  });

  it('should handle system dependencies and communication via events', () => {
    const healthEvents: Array<{ entityId: string; damage: number }> = [];
    
    // Damage system that listens for damage events
    class HealthSystem implements System {
      readonly name = 'HealthSystem';
      readonly requiredComponents = ['health'] as const;
      
      constructor(private eventBus: Emitter<ECSEvents>) {
        this.eventBus.on('damage:taken' as keyof ECSEvents, (data: any) => {
          healthEvents.push(data);
        });
      }
      
      update(): void {
        // Process damage events
        // In a real system, this would apply damage to health components
      }
      
      canProcess(entity: Entity, components: ComponentManager): boolean {
        return components.hasAllComponents(entity.id, this.requiredComponents);
      }
    }
    
    const eventBus = world.getEventBus();
    world.addSystem(new HealthSystem(eventBus));
    
    // Emit damage event
    eventBus.emit('damage:taken' as keyof ECSEvents, { entityId: 'player', damage: 10 } as any);
    
    world.update();
    
    expect(healthEvents).toEqual([{ entityId: 'player', damage: 10 }]);
  });
});