import { defineQuery, IWorld } from 'bitecs';
import { DepthComponent } from '../components/DepthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { SpriteComponent, SpriteType } from '../components/SpriteComponent';
import { SpriteRegistry } from '../SpriteRegistry';

/**
 * Query for entities that need depth sorting
 */
const depthSortQuery = defineQuery([DepthComponent, PositionComponent, SpriteComponent]);

/**
 * System that handles Y-based depth sorting for proper sprite layering
 * Entities further down the screen (higher Y) render in front
 * @param world - The ECS world
 * @returns The world (for system chaining)
 */
export const depthSortingSystem = (world: IWorld): IWorld => {
  const entities = depthSortQuery(world);

  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];

    // Skip if Y-sorting is disabled
    if (!DepthComponent.usesYSorting[eid]) continue;

    // Calculate new depth based on Y position
    const baseDepth = DepthComponent.baseDepth[eid];
    const posY = PositionComponent.y[eid];
    const newDepth = baseDepth + posY;

    // Only update if depth changed
    if (Math.abs(DepthComponent.currentDepth[eid] - newDepth) > 0.01) {
      DepthComponent.currentDepth[eid] = newDepth;

      // Apply depth to sprite
      const spriteId = SpriteComponent.spriteId[eid];
      const spriteType = SpriteComponent.spriteType[eid];
      const sprite = SpriteRegistry.get(spriteId);

      if (sprite) {
        if (spriteType === SpriteType.TILEMAP_LAYER) {
          (sprite as Phaser.Tilemaps.TilemapLayer).setDepth(newDepth);
        } else {
          (sprite as Phaser.GameObjects.Sprite).setDepth(newDepth);
        }
      }
    }
  }

  return world;
};

