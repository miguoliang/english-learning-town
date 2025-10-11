import { addEntity, addComponent, IWorld } from 'bitecs';
import { DepthComponent, DepthDefaults } from './components/DepthComponent';
import { PositionComponent } from './components/PositionComponent';
import { SpriteComponent, SpriteType } from './components/SpriteComponent';
import { SpriteRegistry } from './SpriteRegistry';

/**
 * Options for creating a player entity
 */
export interface PlayerOptions {
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  baseDepth?: number;
}

/**
 * Factory for creating common entity types with their components
 */
export class EntityFactory {

  /**
   * Creates a player entity with position tracking and depth sorting
   * @param world - The ECS world
   * @param options - Player configuration options
   * @returns The created entity ID
   */
  static createPlayer(world: IWorld, options: PlayerOptions): number {
    const eid = addEntity(world);

    // Register sprite and get ID
    const spriteId = SpriteRegistry.register(options.sprite);

    // Add SpriteComponent
    addComponent(world, SpriteComponent, eid);
    SpriteComponent.spriteId[eid] = spriteId;
    SpriteComponent.spriteType[eid] = SpriteType.SPRITE;

    // Add PositionComponent (updated each frame)
    addComponent(world, PositionComponent, eid);
    PositionComponent.x[eid] = options.x;
    PositionComponent.y[eid] = options.y;

    // Add DepthComponent (player uses Y-sorting)
    addComponent(world, DepthComponent, eid);
    DepthComponent.baseDepth[eid] = options.baseDepth ?? DepthDefaults.baseDepth;
    DepthComponent.usesYSorting[eid] = 1; // Player uses Y-sorting
    DepthComponent.currentDepth[eid] = (options.baseDepth ?? DepthDefaults.baseDepth) + options.y;

    return eid;
  }
}

