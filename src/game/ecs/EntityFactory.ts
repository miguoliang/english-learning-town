import { addEntity, addComponent, IWorld } from 'bitecs';
import { DepthComponent, DepthDefaults } from './components/DepthComponent';
import { PositionComponent } from './components/PositionComponent';
import { SpriteComponent, SpriteType } from './components/SpriteComponent';
import { BoundsComponent, BoundsDefaults } from './components/BoundsComponent';
import {
  BuildingComponent,
  BuildingType,
  BuildingNames,
  BuildingSceneKeys,
} from './components/BuildingComponent';
import {
  DoorComponent,
  DoorLayerRegistry,
} from './components/DoorComponent';
import {
  InteractableComponent,
  InteractableDefaults,
  InteractionType,
  InteractablePromptRegistry,
} from './components/InteractableComponent';
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
 * Options for creating a building entity
 */
export interface BuildingOptions {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  buildingType: BuildingType;
  entranceX: number;
  entranceY: number;
  sceneKey?: string;
  isLocked?: boolean;
  baseDepth?: number;
}

/**
 * Options for creating a door entity
 */
export interface DoorOptions {
  buildingEntityId: number;
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  closedTileId: number;
  openTileId: number;
  layer: Phaser.Tilemaps.TilemapLayer;
  requiresKey?: boolean;
  interactionRange?: number;
  promptText?: string;
}

/**
 * Options for creating an NPC entity
 */
export interface NPCOptions {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  x: number;
  y: number;
  name: string;
  interactionRange?: number;
  promptText?: string;
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

  /**
   * Creates a building entity with position, bounds, and building-specific data
   * @param world - The ECS world
   * @param options - Building configuration options
   * @returns The created entity ID
   */
  static createBuilding(world: IWorld, options: BuildingOptions): number {
    const eid = addEntity(world);

    // Add PositionComponent (center of building)
    addComponent(world, PositionComponent, eid);
    PositionComponent.x[eid] = options.x;
    PositionComponent.y[eid] = options.y;

    // Add BoundsComponent (building footprint)
    addComponent(world, BoundsComponent, eid);
    BoundsComponent.width[eid] = options.width;
    BoundsComponent.height[eid] = options.height;
    BoundsComponent.offsetX[eid] = BoundsDefaults.offsetX;
    BoundsComponent.offsetY[eid] = BoundsDefaults.offsetY;

    // Add BuildingComponent
    addComponent(world, BuildingComponent, eid);
    BuildingComponent.buildingType[eid] = options.buildingType;
    BuildingComponent.entranceX[eid] = options.entranceX;
    BuildingComponent.entranceY[eid] = options.entranceY;
    BuildingComponent.isLocked[eid] = options.isLocked ? 1 : 0;
    BuildingComponent.hasBeenVisited[eid] = 0;
    BuildingComponent.doorEntityId[eid] = 0; // Will be set when door is created

    // Add DepthComponent (buildings use fixed depth based on bottom edge)
    addComponent(world, DepthComponent, eid);
    DepthComponent.baseDepth[eid] = options.baseDepth ?? DepthDefaults.baseDepth;
    DepthComponent.usesYSorting[eid] = 0; // Buildings use fixed depth
    DepthComponent.currentDepth[eid] = options.baseDepth ?? DepthDefaults.baseDepth;

    // Store building name and scene key in registries
    BuildingNames.set(eid, options.name);
    if (options.sceneKey) {
      BuildingSceneKeys.set(eid, options.sceneKey);
    }

    console.log(`🏠 Created building entity: ${options.name} (eid: ${eid})`);

    return eid;
  }

  /**
   * Creates a door entity with interaction and tilemap integration
   * @param world - The ECS world
   * @param options - Door configuration options
   * @returns The created entity ID
   */
  static createDoor(world: IWorld, options: DoorOptions): number {
    const eid = addEntity(world);

    // Add PositionComponent (door location)
    addComponent(world, PositionComponent, eid);
    PositionComponent.x[eid] = options.x;
    PositionComponent.y[eid] = options.y;

    // Add DoorComponent
    addComponent(world, DoorComponent, eid);
    DoorComponent.buildingEntityId[eid] = options.buildingEntityId;
    DoorComponent.isOpen[eid] = 0; // Start closed
    DoorComponent.tileX[eid] = options.tileX;
    DoorComponent.tileY[eid] = options.tileY;
    DoorComponent.closedTileId[eid] = options.closedTileId;
    DoorComponent.openTileId[eid] = options.openTileId;
    DoorComponent.requiresKey[eid] = options.requiresKey ? 1 : 0;
    DoorComponent.layerIndex[eid] = 0; // Will be set via registry

    // Add InteractableComponent
    addComponent(world, InteractableComponent, eid);
    InteractableComponent.interactionType[eid] = InteractionType.DOOR;
    InteractableComponent.interactionRange[eid] = options.interactionRange ?? InteractableDefaults.interactionRange;
    InteractableComponent.isActive[eid] = 1;
    InteractableComponent.playerInRange[eid] = 0;
    InteractableComponent.cooldown[eid] = 0;

    // Store layer reference in registry
    DoorLayerRegistry.set(eid, options.layer);

    // Store prompt text in registry
    const promptText = options.promptText ?? 'Press SPACE to open door';
    InteractablePromptRegistry.set(eid, promptText);

    // Update parent building's door reference
    if (options.buildingEntityId !== 0) {
      BuildingComponent.doorEntityId[options.buildingEntityId] = eid;
    }

    console.log(`🚪 Created door entity at (${options.tileX}, ${options.tileY}) (eid: ${eid})`);

    return eid;
  }

  /**
   * Creates an NPC entity with sprite, position, and interaction capability
   * @param world - The ECS world
   * @param options - NPC configuration options
   * @returns The created entity ID
   */
  static createNPC(world: IWorld, options: NPCOptions): number {
    const eid = addEntity(world);

    // Register sprite and get ID
    const spriteId = SpriteRegistry.register(options.sprite);

    // Add SpriteComponent
    addComponent(world, SpriteComponent, eid);
    SpriteComponent.spriteId[eid] = spriteId;
    SpriteComponent.spriteType[eid] = SpriteType.IMAGE; // NPCs typically use images

    // Add PositionComponent
    addComponent(world, PositionComponent, eid);
    PositionComponent.x[eid] = options.x;
    PositionComponent.y[eid] = options.y;

    // Add DepthComponent (NPCs use Y-sorting)
    addComponent(world, DepthComponent, eid);
    DepthComponent.baseDepth[eid] = options.baseDepth ?? DepthDefaults.baseDepth;
    DepthComponent.usesYSorting[eid] = 1; // NPCs use Y-sorting
    DepthComponent.currentDepth[eid] = (options.baseDepth ?? DepthDefaults.baseDepth) + options.y;

    // Add InteractableComponent
    addComponent(world, InteractableComponent, eid);
    InteractableComponent.interactionType[eid] = InteractionType.NPC;
    InteractableComponent.interactionRange[eid] = options.interactionRange ?? InteractableDefaults.interactionRange;
    InteractableComponent.isActive[eid] = 1;
    InteractableComponent.playerInRange[eid] = 0;
    InteractableComponent.cooldown[eid] = 0;

    // Store prompt text in registry
    const promptText = options.promptText ?? `Press SPACE to talk to ${options.name}`;
    InteractablePromptRegistry.set(eid, promptText);

    console.log(`👤 Created NPC entity: ${options.name} (eid: ${eid})`);

    return eid;
  }
}

