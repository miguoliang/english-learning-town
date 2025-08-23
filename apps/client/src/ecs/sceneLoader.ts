/**
 * Scene Loader - Data-driven scene creation from JSON configurations
 */

import type {
  World,
  PositionComponent,
  SizeComponent,
  FurnitureComponent,
  DecorationComponent,
  VelocityComponent,
  InputComponent,
} from "@elt/core";
import {
  createPositionComponent,
  createSizeComponent,
  createCollisionComponent,
  createRenderableComponent,
  createInteractiveComponent,
  createPlayerComponent,
  createNPCComponent,
  createBuildingComponent,
  ecsEventBus,
  ECSEventTypes,
} from "@elt/core";
import { getCellSize } from "../config/gameConfig";
import { logger } from "../utils/logger";

// Scene configuration interfaces
export interface SceneEntityData {
  id: string;
  components: {
    position?: { x: number | string; y: number | string };
    size?: { width: number; height: number };
    collision?: { isWalkable: boolean; blocksMovement?: boolean };
    renderable?: {
      type: "emoji" | "sprite" | "shape" | "custom";
      icon?: string;
      sprite?: string;
      backgroundColor?: string;
      zIndex?: number;
      visible?: boolean;
    };
    interactive?: {
      type:
        | "dialogue"
        | "building-entrance"
        | "scene-transition"
        | "learning"
        | "quest";
      dialogueId?: string;
      entrances?: Array<{
        id: string;
        position: { x: number; y: number };
        direction: "north" | "south" | "east" | "west";
        targetScene: string;
      }>;
      targetScene?: string;
      targetPosition?: { x: number; y: number };
      activityId?: string;
      questId?: string;
      requiresAdjacency?: boolean;
      interactionRange?: number;
      interactionZones?: Array<{
        x: number;
        y: number;
        isRelative?: boolean;
      }>;
    };
    player?: {
      name: string;
      level?: number;
      experience?: number;
      health?: number;
      maxHealth?: number;
    };
    npc?: {
      name: string;
      role: string;
      personality?: string;
      currentDialogue?: string;
    };
    building?: {
      name: string;
      type: "educational" | "commercial" | "residential" | "social" | "storage";
      description?: string;
    };
    furniture?: {
      name: string;
      type:
        | "desk"
        | "chair"
        | "blackboard"
        | "bookshelf"
        | "storage"
        | "teaching-aid";
      usable?: boolean;
    };
    decoration?: {
      type: "plant" | "sign" | "statue" | "fountain";
      category: string;
      seasonal?: boolean;
    };
  };
}

export interface SceneData {
  id: string;
  name: string;
  description: string;
  gridSettings: {
    cellSize: number;
  };
  entities: SceneEntityData[];
}

export class SceneLoader {
  private world: World;

  constructor(world: World) {
    this.world = world;
  }

  /**
   * Load a scene from JSON configuration
   */
  async loadScene(sceneData: SceneData): Promise<void> {
    // Validate scene data structure
    this.validateSceneData(sceneData);

    // Clear existing entities (optional - you might want to keep some)
    const existingEntities = this.world.getAllEntities();
    for (const entity of existingEntities) {
      this.world.removeEntity(entity.id);
    }

    let successfullyLoadedEntities = 0;
    const failedEntities: { id: string; error: string }[] = [];

    // Create entities from scene data
    for (const entityData of sceneData.entities) {
      try {
        await this.createEntityFromData(entityData);
        successfullyLoadedEntities++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        failedEntities.push({ id: entityData.id, error: errorMessage });
        logger.error(`Failed to create entity ${entityData.id}:`, error);
      }
    }

    // Validate that scene loaded properly
    if (successfullyLoadedEntities === 0) {
      throw new Error(
        `Scene loading failed: No entities were successfully created from scene '${sceneData.id}'`,
      );
    }

    if (failedEntities.length > 0) {
      logger.warn(
        `Scene '${sceneData.id}' loaded with ${failedEntities.length} failed entities:`,
        failedEntities,
      );
    }

    // Verify essential entities exist (at least one renderable entity)
    const renderableEntities = this.world
      .getComponentManager()
      .getEntitiesWithComponents(["position", "size", "renderable"]);
    if (renderableEntities.length === 0) {
      throw new Error(
        `Scene loading validation failed: No renderable entities found in scene '${sceneData.id}'`,
      );
    }

    logger.scene(
      `Scene '${sceneData.id}' loaded successfully: ${successfullyLoadedEntities} entities created, ${renderableEntities.length} renderable`,
    );
    ecsEventBus.emit(ECSEventTypes.SCENE_LOADED, {
      scenePath: `Scene: ${sceneData.id}`,
      entityCount: successfullyLoadedEntities,
    });
  }

  /**
   * Load a scene from JSON file
   */
  async loadSceneFromFile(scenePath: string): Promise<void> {
    // Validate input
    if (!scenePath || typeof scenePath !== "string") {
      throw new Error("Invalid scene path: Path must be a non-empty string");
    }

    if (!scenePath.endsWith(".json")) {
      throw new Error(
        `Invalid scene file: Expected .json file, got '${scenePath}'`,
      );
    }

    try {
      logger.scene(`Loading scene from: ${scenePath}`);
      const response = await fetch(scenePath);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Scene file not found: ${scenePath}`);
        }
        throw new Error(
          `Failed to load scene file '${scenePath}': ${response.status} ${response.statusText}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Invalid scene file format: Expected JSON, got '${contentType}' for '${scenePath}'`,
        );
      }

      let sceneData: SceneData;
      try {
        sceneData = await response.json();
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in scene file '${scenePath}': ${parseError instanceof Error ? parseError.message : "Parse error"}`,
        );
      }

      await this.loadScene(sceneData);
      logger.scene(`Scene loaded successfully from: ${scenePath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Error loading scene from '${scenePath}':`, error);
      throw new Error(`Scene loading failed: ${errorMessage}`);
    }
  }

  /**
   * Validate scene data structure
   */
  private validateSceneData(sceneData: SceneData): void {
    if (!sceneData) {
      throw new Error("Scene data is null or undefined");
    }

    if (!sceneData.id || typeof sceneData.id !== "string") {
      throw new Error("Scene must have a valid id (non-empty string)");
    }

    if (!sceneData.name || typeof sceneData.name !== "string") {
      throw new Error("Scene must have a valid name (non-empty string)");
    }

    if (!sceneData.entities || !Array.isArray(sceneData.entities)) {
      throw new Error("Scene must have an entities array");
    }

    if (sceneData.entities.length === 0) {
      throw new Error("Scene must contain at least one entity");
    }

    if (
      !sceneData.gridSettings ||
      typeof sceneData.gridSettings.cellSize !== "number" ||
      sceneData.gridSettings.cellSize <= 0
    ) {
      throw new Error(
        "Scene must have valid gridSettings with positive cellSize",
      );
    }

    // Validate entity structure
    const entityIds = new Set<string>();
    for (let i = 0; i < sceneData.entities.length; i++) {
      const entity = sceneData.entities[i];
      if (!entity.id || typeof entity.id !== "string") {
        throw new Error(
          `Entity at index ${i} must have a valid id (non-empty string)`,
        );
      }

      if (entityIds.has(entity.id)) {
        throw new Error(`Duplicate entity id found: '${entity.id}'`);
      }
      entityIds.add(entity.id);

      if (!entity.components || typeof entity.components !== "object") {
        throw new Error(`Entity '${entity.id}' must have a components object`);
      }
    }
  }

  /**
   * Create an entity from JSON data
   */
  private async createEntityFromData(
    entityData: SceneEntityData,
  ): Promise<void> {
    // Validate entity data
    if (!entityData.id) {
      throw new Error("Entity must have an id");
    }

    if (!entityData.components) {
      throw new Error(`Entity '${entityData.id}' must have components`);
    }

    // Check if entity already exists
    if (this.world.getEntity(entityData.id)) {
      throw new Error(`Entity with id '${entityData.id}' already exists`);
    }

    const entity = this.world.createEntity(entityData.id);
    let componentsAdded = 0;

    // Create components based on entity data
    for (const [componentType, componentData] of Object.entries(
      entityData.components,
    )) {
      try {
        switch (componentType) {
          case "position":
            if (componentData) {
              const posData = componentData as NonNullable<
                SceneEntityData["components"]["position"]
              >;
              if (posData.x === undefined || posData.y === undefined) {
                throw new Error("Position component must have x and y values");
              }
              const x = this.evaluatePosition(posData.x);
              const y = this.evaluatePosition(posData.y);
              if (x < 0 || y < 0) {
                throw new Error(
                  `Invalid position: x=${x}, y=${y}. Positions must be non-negative`,
                );
              }
              const positionComponent = createPositionComponent(x, y);
              logger.ecs(
                `Creating position component for ${entity.id}:`,
                positionComponent,
              );
              this.world.addComponent(entity.id, positionComponent);
              componentsAdded++;
            }
            break;

          case "size":
            if (componentData) {
              const sizeData = componentData as NonNullable<
                SceneEntityData["components"]["size"]
              >;
              if (
                typeof sizeData.width !== "number" ||
                typeof sizeData.height !== "number"
              ) {
                throw new Error(
                  "Size component must have numeric width and height",
                );
              }
              if (sizeData.width <= 0 || sizeData.height <= 0) {
                throw new Error(
                  `Invalid size: width=${sizeData.width}, height=${sizeData.height}. Size must be positive`,
                );
              }
              const sizeComponent = createSizeComponent(
                sizeData.width,
                sizeData.height,
              );
              logger.ecs(
                `Creating size component for ${entity.id}:`,
                sizeComponent,
              );
              this.world.addComponent(entity.id, sizeComponent);
              componentsAdded++;
            }
            break;

          case "collision":
            if (componentData) {
              const collisionData = componentData as NonNullable<
                SceneEntityData["components"]["collision"]
              >;
              this.world.addComponent(
                entity.id,
                createCollisionComponent(
                  collisionData.isWalkable,
                  collisionData.blocksMovement,
                ),
              );
              componentsAdded++;
            }
            break;

          case "renderable":
            if (componentData) {
              const renderData = componentData as NonNullable<
                SceneEntityData["components"]["renderable"]
              >;
              if (!renderData.type) {
                throw new Error("Renderable component must have a type");
              }
              const validTypes = ["emoji", "sprite", "shape", "custom"];
              if (!validTypes.includes(renderData.type)) {
                throw new Error(
                  `Invalid render type '${renderData.type}'. Must be one of: ${validTypes.join(", ")}`,
                );
              }
              if (renderData.type === "emoji" && !renderData.icon) {
                throw new Error("Emoji render type requires an icon");
              }
              if (renderData.type === "sprite" && !renderData.sprite) {
                throw new Error("Sprite render type requires a sprite path");
              }
              const renderableComponent = createRenderableComponent(
                renderData.type,
                {
                  ...(renderData.icon !== undefined && {
                    icon: renderData.icon,
                  }),
                  ...(renderData.sprite !== undefined && {
                    sprite: renderData.sprite,
                  }),
                  ...(renderData.backgroundColor !== undefined && {
                    backgroundColor: renderData.backgroundColor,
                  }),
                  ...(renderData.zIndex !== undefined && {
                    zIndex: renderData.zIndex,
                  }),
                  ...(renderData.visible !== undefined && {
                    visible: renderData.visible,
                  }),
                },
              );
              logger.ecs(
                `Creating renderable component for ${entity.id}:`,
                renderableComponent,
              );
              this.world.addComponent(entity.id, renderableComponent);
              componentsAdded++;
            }
            break;

          case "interactive":
            if (componentData) {
              const interactData = componentData as NonNullable<
                SceneEntityData["components"]["interactive"]
              >;
              const interactiveComponent = createInteractiveComponent(
                interactData.type,
                {
                  ...(interactData.dialogueId !== undefined && {
                    dialogueId: interactData.dialogueId,
                  }),
                  ...(interactData.entrances !== undefined && {
                    entrances: interactData.entrances,
                  }),
                  ...(interactData.targetScene !== undefined && {
                    targetScene: interactData.targetScene,
                  }),
                  ...(interactData.targetPosition !== undefined && {
                    targetPosition: interactData.targetPosition,
                  }),
                  ...(interactData.activityId !== undefined && {
                    activityId: interactData.activityId,
                  }),
                  ...(interactData.questId !== undefined && {
                    questId: interactData.questId,
                  }),
                  ...(interactData.requiresAdjacency !== undefined && {
                    requiresAdjacency: interactData.requiresAdjacency,
                  }),
                  ...(interactData.interactionRange !== undefined && {
                    interactionRange: interactData.interactionRange,
                  }),
                  ...(interactData.interactionZones !== undefined && {
                    interactionZones: interactData.interactionZones,
                  }),
                },
              );

              this.world.addComponent(entity.id, interactiveComponent);
              componentsAdded++;
            }
            break;

          case "player":
            if (componentData) {
              const playerData = componentData as NonNullable<
                SceneEntityData["components"]["player"]
              >;
              this.world.addComponent(
                entity.id,
                createPlayerComponent(playerData.name),
              );

              // Add player-specific components
              this.world.addComponent(entity.id, {
                type: "velocity",
                x: 0,
                y: 0,
                maxSpeed: 5,
              } as VelocityComponent);

              this.world.addComponent(entity.id, {
                type: "input",
                controllable: true,
                inputType: "player",
              } as InputComponent);
            }
            break;

          case "npc":
            if (componentData) {
              const npcData = componentData as NonNullable<
                SceneEntityData["components"]["npc"]
              >;
              this.world.addComponent(
                entity.id,
                createNPCComponent(npcData.name, npcData.role),
              );
            }
            break;

          case "building":
            if (componentData) {
              const buildingData = componentData as NonNullable<
                SceneEntityData["components"]["building"]
              >;
              this.world.addComponent(
                entity.id,
                createBuildingComponent(buildingData.name, buildingData.type),
              );
            }
            break;

          case "furniture":
            if (componentData) {
              const furnitureData = componentData as NonNullable<
                SceneEntityData["components"]["furniture"]
              >;
              this.world.addComponent(entity.id, {
                type: "furniture",
                name: furnitureData.name,
                furnitureType: furnitureData.type,
                usable: furnitureData.usable,
              } as FurnitureComponent);
            }
            break;

          case "decoration":
            if (componentData) {
              const decorationData = componentData as NonNullable<
                SceneEntityData["components"]["decoration"]
              >;
              this.world.addComponent(entity.id, {
                type: "decoration",
                decorationType: decorationData.type,
                category: decorationData.category,
                seasonal: decorationData.seasonal,
              } as DecorationComponent);
              componentsAdded++;
            }
            break;

          default:
            // Handle other component types
            componentsAdded++;
            break;
        }
      } catch (componentError) {
        const errorMessage =
          componentError instanceof Error
            ? componentError.message
            : "Unknown component error";
        throw new Error(
          `Failed to create ${componentType} component for entity '${entityData.id}': ${errorMessage}`,
        );
      }
    }

    // Validate that entity has essential components
    if (componentsAdded === 0) {
      throw new Error(`Entity '${entityData.id}' has no valid components`);
    }

    // Verify that renderable entities have required components
    const hasRenderable = this.world
      .getComponentManager()
      .hasComponent(entity.id, "renderable");
    if (hasRenderable) {
      const hasPosition = this.world
        .getComponentManager()
        .hasComponent(entity.id, "position");
      const hasSize = this.world
        .getComponentManager()
        .hasComponent(entity.id, "size");
      if (!hasPosition || !hasSize) {
        throw new Error(
          `Renderable entity '${entityData.id}' must have both position and size components`,
        );
      }
    }
  }

  /**
   * Evaluate position expressions like "gridWidth - 8"
   * Safer alternative to eval for simple math expressions
   */
  private evaluatePosition(position: number | string): number {
    if (typeof position === "number") {
      if (!isFinite(position)) {
        throw new Error(`Position must be a finite number, got: ${position}`);
      }
      return position;
    }

    if (typeof position !== "string") {
      throw new Error(
        `Position must be a number or string, got: ${typeof position}`,
      );
    }

    // Handle dynamic positioning expressions
    const cellSize = getCellSize();
    const gridWidth = Math.floor(window.innerWidth / cellSize);
    const gridHeight = Math.floor(window.innerHeight / cellSize);

    if (gridWidth <= 0 || gridHeight <= 0) {
      throw new Error(
        `Invalid grid dimensions: width=${gridWidth}, height=${gridHeight}`,
      );
    }

    try {
      // Simple expression evaluator for basic math operations
      let result: number;
      if (position === "gridWidth - 8") {
        result = gridWidth - 8;
      } else if (position === "gridWidth - 7") {
        result = gridWidth - 7;
      } else if (position === "gridWidth - 6") {
        result = gridWidth - 6;
      } else if (position === "gridHeight - 4") {
        result = gridHeight - 4;
      } else {
        // Fallback: try to parse as number
        const numValue = parseInt(position.toString(), 10);
        if (isNaN(numValue)) {
          throw new Error(`Unsupported position expression: '${position}'`);
        }
        result = numValue;
      }

      if (!isFinite(result)) {
        throw new Error(
          `Position evaluation resulted in non-finite value: ${result}`,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Error evaluating position expression '${position}': ${errorMessage}`,
      );
    }
  }

  /**
   * Add a player entity to the current scene
   */
  addPlayer(
    playerId: string,
    position: { x: number; y: number },
    name: string = "Player",
  ): void {
    const entity = this.world.createEntity(playerId);

    this.world.addComponent(
      entity.id,
      createPositionComponent(position.x, position.y),
    );
    this.world.addComponent(entity.id, createSizeComponent(1, 1));
    this.world.addComponent(entity.id, createCollisionComponent(false, true));
    this.world.addComponent(
      entity.id,
      createRenderableComponent("emoji", { icon: "🚶", zIndex: 10 }),
    );
    this.world.addComponent(entity.id, createPlayerComponent(name));

    this.world.addComponent(entity.id, {
      type: "velocity",
      x: 0,
      y: 0,
      maxSpeed: 5,
    } as VelocityComponent);

    this.world.addComponent(entity.id, {
      type: "input",
      controllable: true,
      inputType: "player",
    } as InputComponent);
  }

  /**
   * Get scene bounds for camera/viewport management
   */
  getSceneBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const entities = this.world.getAllEntities();
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const entity of entities) {
      const position = this.world.getComponent<PositionComponent>(
        entity.id,
        "position",
      );
      const size = this.world.getComponent<SizeComponent>(entity.id, "size");

      if (position && size) {
        minX = Math.min(minX, position.x);
        minY = Math.min(minY, position.y);
        maxX = Math.max(maxX, position.x + size.width);
        maxY = Math.max(maxY, position.y + size.height);
      }
    }

    return { minX, minY, maxX, maxY };
  }
}
