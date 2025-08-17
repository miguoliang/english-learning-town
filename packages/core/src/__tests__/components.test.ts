/**
 * Components Tests - Component interfaces and factory functions
 */

import { describe, it, expect } from 'vitest';
import {
  // Component factory functions
  createPositionComponent,
  createSizeComponent,
  createVelocityComponent,
  createCollisionComponent,
  createRenderableComponent,
  createAnimationComponent,
  createMovementAnimationComponent,
  createInteractiveComponent,
  createInputComponent,
  createPlayerComponent,
  createNPCComponent,
  createBuildingComponent,
  createFurnitureComponent,
  createDecorationComponent,
  
  // Component type definitions
  type PositionComponent,
  type SizeComponent,
  type VelocityComponent,
  type CollisionComponent,
  type RenderableComponent,
  type AnimationComponent,
  type MovementAnimationComponent,
  type InteractiveComponent,
  type InputComponent,
  type PlayerComponent,
  type NPCComponent,
  type BuildingComponent,
  type FurnitureComponent,
  type DecorationComponent
} from '../components';

describe('Spatial Components', () => {
  describe('PositionComponent', () => {
    it('should create position component with correct properties', () => {
      const position = createPositionComponent(10, 20);
      
      expect(position).toEqual({
        type: 'position',
        x: 10,
        y: 20
      });
    });

    it('should handle negative coordinates', () => {
      const position = createPositionComponent(-5, -10);
      
      expect(position.x).toBe(-5);
      expect(position.y).toBe(-10);
    });

    it('should handle decimal coordinates', () => {
      const position = createPositionComponent(10.5, 20.7);
      
      expect(position.x).toBe(10.5);
      expect(position.y).toBe(20.7);
    });
  });

  describe('SizeComponent', () => {
    it('should create size component with correct properties', () => {
      const size = createSizeComponent(100, 50);
      
      expect(size).toEqual({
        type: 'size',
        width: 100,
        height: 50
      });
    });

    it('should handle decimal dimensions', () => {
      const size = createSizeComponent(10.5, 20.3);
      
      expect(size.width).toBe(10.5);
      expect(size.height).toBe(20.3);
    });
  });

  describe('VelocityComponent', () => {
    it('should create velocity component with default values', () => {
      const velocity = createVelocityComponent();
      
      expect(velocity).toEqual({
        type: 'velocity',
        x: 0,
        y: 0,
        maxSpeed: 5
      });
    });

    it('should create velocity component with custom values', () => {
      const velocity = createVelocityComponent(2, -3, 10);
      
      expect(velocity).toEqual({
        type: 'velocity',
        x: 2,
        y: -3,
        maxSpeed: 10
      });
    });

    it('should handle partial parameters', () => {
      const velocity1 = createVelocityComponent(1);
      expect(velocity1).toEqual({
        type: 'velocity',
        x: 1,
        y: 0,
        maxSpeed: 5
      });

      const velocity2 = createVelocityComponent(1, 2);
      expect(velocity2).toEqual({
        type: 'velocity',
        x: 1,
        y: 2,
        maxSpeed: 5
      });
    });
  });

  describe('CollisionComponent', () => {
    it('should create collision component with walkable true', () => {
      const collision = createCollisionComponent(true);
      
      expect(collision).toEqual({
        type: 'collision',
        isWalkable: true,
        blocksMovement: false
      });
    });

    it('should create collision component with walkable false', () => {
      const collision = createCollisionComponent(false);
      
      expect(collision).toEqual({
        type: 'collision',
        isWalkable: false,
        blocksMovement: true
      });
    });

    it('should create collision component with custom blocksMovement', () => {
      const collision = createCollisionComponent(true, true);
      
      expect(collision).toEqual({
        type: 'collision',
        isWalkable: true,
        blocksMovement: true
      });
    });
  });
});

describe('Visual Components', () => {
  describe('RenderableComponent', () => {
    it('should create emoji renderable component', () => {
      const renderable = createRenderableComponent('emoji', { icon: '🧑' });
      
      expect(renderable).toEqual({
        type: 'renderable',
        renderType: 'emoji',
        icon: '🧑',
        visible: true,
        zIndex: 1
      });
    });

    it('should create sprite renderable component', () => {
      const renderable = createRenderableComponent('sprite', {
        sprite: 'player.png',
        zIndex: 10
      });
      
      expect(renderable).toEqual({
        type: 'renderable',
        renderType: 'sprite',
        sprite: 'player.png',
        visible: true,
        zIndex: 10
      });
    });

    it('should create shape renderable component', () => {
      const renderable = createRenderableComponent('shape', {
        backgroundColor: '#ff0000',
        visible: false
      });
      
      expect(renderable).toEqual({
        type: 'renderable',
        renderType: 'shape',
        backgroundColor: '#ff0000',
        visible: false,
        zIndex: 1
      });
    });

    it('should handle all render types', () => {
      const types: Array<RenderableComponent['renderType']> = ['emoji', 'sprite', 'shape', 'custom'];
      
      types.forEach(renderType => {
        const renderable = createRenderableComponent(renderType);
        expect(renderable.renderType).toBe(renderType);
        expect(renderable.type).toBe('renderable');
      });
    });

    it('should handle minimal options', () => {
      const renderable = createRenderableComponent('custom');
      
      expect(renderable).toEqual({
        type: 'renderable',
        renderType: 'custom',
        visible: true,
        zIndex: 1
      });
    });
  });

  describe('AnimationComponent', () => {
    it('should create animation component with frames', () => {
      const animations = {
        idle: { frames: ['idle1', 'idle2'], duration: 1000 },
        walk: { frames: ['walk1', 'walk2', 'walk3'], duration: 500, loop: true }
      };
      
      const animation = createAnimationComponent('idle', animations);
      
      expect(animation).toEqual({
        type: 'animation',
        currentAnimation: 'idle',
        animations,
        isPlaying: true,
        currentFrame: 0,
        lastFrameTime: 0
      });
    });

    it('should create animation component with complex animations', () => {
      const animations = {
        attack: { frames: ['attack1', 'attack2', 'attack3'], duration: 300 },
        death: { frames: ['death1', 'death2'], duration: 2000, loop: false }
      };
      
      const animation = createAnimationComponent('attack', animations);
      
      expect(animation.currentAnimation).toBe('attack');
      expect(animation.animations).toEqual(animations);
      expect(animation.isPlaying).toBe(true);
    });
  });

  describe('MovementAnimationComponent', () => {
    it('should create movement animation component with defaults', () => {
      const movementAnim = createMovementAnimationComponent();
      
      expect(movementAnim).toEqual({
        type: 'movement-animation',
        direction: 'south',
        isMoving: false
      });
    });

    it('should have correct type and structure', () => {
      const movementAnim = createMovementAnimationComponent();
      
      expect(movementAnim.type).toBe('movement-animation');
      expect(typeof movementAnim.isMoving).toBe('boolean');
      expect(['north', 'south', 'east', 'west', null]).toContain(movementAnim.direction);
    });
  });
});

describe('Interactive Components', () => {
  describe('InteractiveComponent', () => {
    it('should create dialogue interactive component', () => {
      const interactive = createInteractiveComponent('dialogue', {
        dialogueId: 'greeting'
      });
      
      expect(interactive).toEqual({
        type: 'interactive',
        interactionType: 'dialogue',
        dialogueId: 'greeting',
        requiresAdjacency: true,
        interactionRange: 1
      });
    });

    it('should create building entrance interactive component', () => {
      const entrances = [
        {
          id: 'main-door',
          position: { x: 5, y: 3 },
          direction: 'north' as const,
          targetScene: 'school-interior'
        }
      ];
      
      const interactive = createInteractiveComponent('building-entrance', {
        entrances,
        requiresAdjacency: false
      });
      
      expect(interactive).toEqual({
        type: 'interactive',
        interactionType: 'building-entrance',
        entrances,
        requiresAdjacency: false,
        interactionRange: 1
      });
    });

    it('should create scene transition interactive component', () => {
      const interactive = createInteractiveComponent('scene-transition', {
        targetScene: 'town',
        targetPosition: { x: 10, y: 5 },
        interactionRange: 2
      });
      
      expect(interactive).toEqual({
        type: 'interactive',
        interactionType: 'scene-transition',
        targetScene: 'town',
        targetPosition: { x: 10, y: 5 },
        requiresAdjacency: true,
        interactionRange: 2
      });
    });

    it('should create learning interactive component', () => {
      const interactive = createInteractiveComponent('learning', {
        activityId: 'vocabulary-lesson-1'
      });
      
      expect(interactive).toEqual({
        type: 'interactive',
        interactionType: 'learning',
        activityId: 'vocabulary-lesson-1',
        requiresAdjacency: true,
        interactionRange: 1
      });
    });

    it('should create quest interactive component', () => {
      const interactive = createInteractiveComponent('quest', {
        questId: 'find-missing-book'
      });
      
      expect(interactive).toEqual({
        type: 'interactive',
        interactionType: 'quest',
        questId: 'find-missing-book',
        requiresAdjacency: true,
        interactionRange: 1
      });
    });

    it('should handle interaction zones', () => {
      const interactionZones = [
        { x: 0, y: 1, isRelative: true },
        { x: 1, y: 0, isRelative: true }
      ];
      
      const interactive = createInteractiveComponent('dialogue', {
        dialogueId: 'test',
        interactionZones
      });
      
      expect(interactive.interactionZones).toEqual(interactionZones);
    });
  });

  describe('InputComponent', () => {
    it('should create input component with defaults', () => {
      const input = createInputComponent();
      
      expect(input).toEqual({
        type: 'input',
        inputType: 'player',
        controllable: true
      });
    });

    it('should create AI input component', () => {
      const input = createInputComponent('ai', false);
      
      expect(input).toEqual({
        type: 'input',
        inputType: 'ai',
        controllable: false
      });
    });

    it('should create scripted input component', () => {
      const input = createInputComponent('scripted');
      
      expect(input).toEqual({
        type: 'input',
        inputType: 'scripted',
        controllable: true
      });
    });
  });
});

describe('Game-Specific Components', () => {
  describe('PlayerComponent', () => {
    it('should create player component with name', () => {
      const player = createPlayerComponent('Alex');
      
      expect(player).toEqual({
        type: 'player',
        name: 'Alex',
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100
      });
    });

    it('should create player component with different names', () => {
      const player1 = createPlayerComponent('Morgan');
      const player2 = createPlayerComponent('Sam');
      
      expect(player1.name).toBe('Morgan');
      expect(player2.name).toBe('Sam');
      
      // Should have same defaults
      expect(player1.level).toBe(player2.level);
      expect(player1.health).toBe(player2.health);
    });
  });

  describe('NPCComponent', () => {
    it('should create NPC component with name and role', () => {
      const npc = createNPCComponent('Teacher Smith', 'educator');
      
      expect(npc).toEqual({
        type: 'npc',
        name: 'Teacher Smith',
        role: 'educator'
      });
    });

    it('should create different NPCs', () => {
      const teacher = createNPCComponent('Ms. Johnson', 'teacher');
      const librarian = createNPCComponent('Mr. Brown', 'librarian');
      
      expect(teacher.name).toBe('Ms. Johnson');
      expect(teacher.role).toBe('teacher');
      
      expect(librarian.name).toBe('Mr. Brown');
      expect(librarian.role).toBe('librarian');
    });
  });

  describe('BuildingComponent', () => {
    it('should create educational building component', () => {
      const building = createBuildingComponent('School', 'educational');
      
      expect(building).toEqual({
        type: 'building',
        name: 'School',
        buildingType: 'educational'
      });
    });

    it('should create different building types', () => {
      const school = createBuildingComponent('Elementary School', 'educational');
      const shop = createBuildingComponent('Corner Store', 'commercial');
      const house = createBuildingComponent('Family Home', 'residential');
      const park = createBuildingComponent('Community Park', 'social');
      const warehouse = createBuildingComponent('Storage Unit', 'storage');
      
      expect(school.buildingType).toBe('educational');
      expect(shop.buildingType).toBe('commercial');
      expect(house.buildingType).toBe('residential');
      expect(park.buildingType).toBe('social');
      expect(warehouse.buildingType).toBe('storage');
    });
  });

  describe('FurnitureComponent', () => {
    it('should create furniture component with defaults', () => {
      const desk = createFurnitureComponent('Wooden Desk', 'desk');
      
      expect(desk).toEqual({
        type: 'furniture',
        name: 'Wooden Desk',
        furnitureType: 'desk',
        usable: false
      });
    });

    it('should create usable furniture', () => {
      const chair = createFurnitureComponent('Office Chair', 'chair', true);
      
      expect(chair).toEqual({
        type: 'furniture',
        name: 'Office Chair',
        furnitureType: 'chair',
        usable: true
      });
    });

    it('should create different furniture types', () => {
      const desk = createFurnitureComponent('Student Desk', 'desk');
      const chair = createFurnitureComponent('Student Chair', 'chair');
      const blackboard = createFurnitureComponent('Classroom Blackboard', 'blackboard');
      const bookshelf = createFurnitureComponent('Library Shelf', 'bookshelf');
      const storage = createFurnitureComponent('Storage Cabinet', 'storage');
      const aid = createFurnitureComponent('Projector', 'teaching-aid');
      
      expect(desk.furnitureType).toBe('desk');
      expect(chair.furnitureType).toBe('chair');
      expect(blackboard.furnitureType).toBe('blackboard');
      expect(bookshelf.furnitureType).toBe('bookshelf');
      expect(storage.furnitureType).toBe('storage');
      expect(aid.furnitureType).toBe('teaching-aid');
    });
  });

  describe('DecorationComponent', () => {
    it('should create decoration component with defaults', () => {
      const tree = createDecorationComponent('plant', 'tree');
      
      expect(tree).toEqual({
        type: 'decoration',
        decorationType: 'plant',
        category: 'tree',
        seasonal: false
      });
    });

    it('should create seasonal decoration', () => {
      const flower = createDecorationComponent('plant', 'flower', true);
      
      expect(flower).toEqual({
        type: 'decoration',
        decorationType: 'plant',
        category: 'flower',
        seasonal: true
      });
    });

    it('should create different decoration types', () => {
      const plant = createDecorationComponent('plant', 'bush');
      const sign = createDecorationComponent('sign', 'welcome-sign');
      const statue = createDecorationComponent('statue', 'founder-statue');
      const fountain = createDecorationComponent('fountain', 'water-fountain');
      
      expect(plant.decorationType).toBe('plant');
      expect(sign.decorationType).toBe('sign');
      expect(statue.decorationType).toBe('statue');
      expect(fountain.decorationType).toBe('fountain');
      
      expect(plant.category).toBe('bush');
      expect(sign.category).toBe('welcome-sign');
      expect(statue.category).toBe('founder-statue');
      expect(fountain.category).toBe('water-fountain');
    });
  });
});

describe('Component Type Consistency', () => {
  it('should have consistent type field across all components', () => {
    const position = createPositionComponent(0, 0);
    const size = createSizeComponent(1, 1);
    const velocity = createVelocityComponent();
    const collision = createCollisionComponent(true);
    const renderable = createRenderableComponent('emoji');
    const animation = createAnimationComponent('idle', {});
    const movementAnim = createMovementAnimationComponent();
    const interactive = createInteractiveComponent('dialogue');
    const input = createInputComponent();
    const player = createPlayerComponent('Test');
    const npc = createNPCComponent('Test NPC', 'test');
    const building = createBuildingComponent('Test Building', 'educational');
    const furniture = createFurnitureComponent('Test Furniture', 'desk');
    const decoration = createDecorationComponent('plant', 'test');
    
    expect(position.type).toBe('position');
    expect(size.type).toBe('size');
    expect(velocity.type).toBe('velocity');
    expect(collision.type).toBe('collision');
    expect(renderable.type).toBe('renderable');
    expect(animation.type).toBe('animation');
    expect(movementAnim.type).toBe('movement-animation');
    expect(interactive.type).toBe('interactive');
    expect(input.type).toBe('input');
    expect(player.type).toBe('player');
    expect(npc.type).toBe('npc');
    expect(building.type).toBe('building');
    expect(furniture.type).toBe('furniture');
    expect(decoration.type).toBe('decoration');
  });

  it('should create components that extend base Component interface', () => {
    const components = [
      createPositionComponent(0, 0),
      createSizeComponent(1, 1),
      createRenderableComponent('emoji'),
      createPlayerComponent('Test')
    ];
    
    components.forEach(component => {
      expect(component).toHaveProperty('type');
      expect(typeof component.type).toBe('string');
    });
  });
});

describe('Component Factory Edge Cases', () => {
  it('should handle zero values correctly', () => {
    const position = createPositionComponent(0, 0);
    const size = createSizeComponent(0, 0);
    const velocity = createVelocityComponent(0, 0, 0);
    
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
    expect(size.width).toBe(0);
    expect(size.height).toBe(0);
    expect(velocity.x).toBe(0);
    expect(velocity.y).toBe(0);
    expect(velocity.maxSpeed).toBe(0);
  });

  it('should handle large values correctly', () => {
    const position = createPositionComponent(1000000, 1000000);
    const size = createSizeComponent(999999, 999999);
    
    expect(position.x).toBe(1000000);
    expect(position.y).toBe(1000000);
    expect(size.width).toBe(999999);
    expect(size.height).toBe(999999);
  });

  it('should handle empty strings correctly', () => {
    const player = createPlayerComponent('');
    const npc = createNPCComponent('', '');
    const building = createBuildingComponent('', 'educational');
    
    expect(player.name).toBe('');
    expect(npc.name).toBe('');
    expect(npc.role).toBe('');
    expect(building.name).toBe('');
  });

  it('should handle complex nested data correctly', () => {
    const entrances = [
      {
        id: 'door1',
        position: { x: 1, y: 2 },
        direction: 'north' as const,
        targetScene: 'interior'
      },
      {
        id: 'door2',
        position: { x: 3, y: 4 },
        direction: 'south' as const,
        targetScene: 'exterior'
      }
    ];
    
    const interactive = createInteractiveComponent('building-entrance', {
      entrances
    });
    
    expect(interactive.entrances).toEqual(entrances);
    expect(interactive.entrances![0].position.x).toBe(1);
    expect(interactive.entrances![1].direction).toBe('south');
  });
});