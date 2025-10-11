import { IWorld, defineQuery } from 'bitecs';
import { BuildingComponent, BuildingNames, BuildingSceneKeys } from '../components/BuildingComponent';
import { PositionComponent } from '../components/PositionComponent';
import { BoundsComponent } from '../components/BoundsComponent';

/**
 * Query for all building entities
 */
const buildingQuery = defineQuery([BuildingComponent, PositionComponent, BoundsComponent]);

/**
 * System for managing building entities and their state
 */
export class BuildingSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Finds the nearest building to a given position
   * @param world - The ECS world
   * @param x - X position to check from
   * @param y - Y position to check from
   * @returns Entity ID of nearest building, or null if none found
   */
  findNearestBuilding(world: IWorld, x: number, y: number): number | null {
    const buildings = buildingQuery(world);
    let nearestBuilding: number | null = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < buildings.length; i++) {
      const eid = buildings[i];

      const buildingX = PositionComponent.x[eid];
      const buildingY = PositionComponent.y[eid];

      // Calculate distance
      const distance = Math.sqrt((x - buildingX) ** 2 + (y - buildingY) ** 2);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBuilding = eid;
      }
    }

    return nearestBuilding;
  }

  /**
   * Checks if a point is inside a building's bounds
   * @param buildingEntityId - The building entity ID
   * @param x - X position to check
   * @param y - Y position to check
   * @returns True if point is inside building bounds
   */
  isPointInBuilding(buildingEntityId: number, x: number, y: number): boolean {
    const buildingX = PositionComponent.x[buildingEntityId];
    const buildingY = PositionComponent.y[buildingEntityId];
    const width = BoundsComponent.width[buildingEntityId];
    const height = BoundsComponent.height[buildingEntityId];
    const offsetX = BoundsComponent.offsetX[buildingEntityId];
    const offsetY = BoundsComponent.offsetY[buildingEntityId];

    const left = buildingX + offsetX - width / 2;
    const right = buildingX + offsetX + width / 2;
    const top = buildingY + offsetY - height / 2;
    const bottom = buildingY + offsetY + height / 2;

    return x >= left && x <= right && y >= top && y <= bottom;
  }

  /**
   * Gets the building name for a building entity
   * @param buildingEntityId - The building entity ID
   * @returns Building name or null if not found
   */
  getBuildingName(buildingEntityId: number): string | null {
    return BuildingNames.get(buildingEntityId) ?? null;
  }

  /**
   * Gets the scene key for a building's interior
   * @param buildingEntityId - The building entity ID
   * @returns Scene key or null if no interior scene
   */
  getBuildingSceneKey(buildingEntityId: number): string | null {
    return BuildingSceneKeys.get(buildingEntityId) ?? null;
  }

  /**
   * Marks a building as visited
   * @param buildingEntityId - The building entity ID
   */
  markAsVisited(buildingEntityId: number): void {
    BuildingComponent.hasBeenVisited[buildingEntityId] = 1;
    const buildingName = this.getBuildingName(buildingEntityId);
    console.log(`🏠 Marked building as visited: ${buildingName} (eid: ${buildingEntityId})`);
  }

  /**
   * Checks if a building has been visited
   * @param buildingEntityId - The building entity ID
   * @returns True if visited, false otherwise
   */
  hasBeenVisited(buildingEntityId: number): boolean {
    return BuildingComponent.hasBeenVisited[buildingEntityId] === 1;
  }

  /**
   * Locks or unlocks a building
   * @param buildingEntityId - The building entity ID
   * @param locked - True to lock, false to unlock
   */
  setLocked(buildingEntityId: number, locked: boolean): void {
    BuildingComponent.isLocked[buildingEntityId] = locked ? 1 : 0;
    const buildingName = this.getBuildingName(buildingEntityId);
    console.log(`🏠 Building ${locked ? 'locked' : 'unlocked'}: ${buildingName} (eid: ${buildingEntityId})`);
  }

  /**
   * Checks if a building is locked
   * @param buildingEntityId - The building entity ID
   * @returns True if locked, false otherwise
   */
  isLocked(buildingEntityId: number): boolean {
    return BuildingComponent.isLocked[buildingEntityId] === 1;
  }

  /**
   * Gets the door entity ID for a building
   * @param buildingEntityId - The building entity ID
   * @returns Door entity ID, or 0 if no door
   */
  getDoorEntityId(buildingEntityId: number): number {
    return BuildingComponent.doorEntityId[buildingEntityId];
  }

  /**
   * Gets all building entities
   * @param world - The ECS world
   * @returns Array of building entity IDs
   */
  getAllBuildings(world: IWorld): number[] {
    return Array.from(buildingQuery(world));
  }

  /**
   * Debug: Logs all building information
   * @param world - The ECS world
   */
  logBuildingsInfo(world: IWorld): void {
    const buildings = buildingQuery(world);
    console.log(`\n🏠 === Building System Debug (${buildings.length} buildings) ===`);

    for (let i = 0; i < buildings.length; i++) {
      const eid = buildings[i];
      const name = this.getBuildingName(eid);
      const x = PositionComponent.x[eid];
      const y = PositionComponent.y[eid];
      const width = BoundsComponent.width[eid];
      const height = BoundsComponent.height[eid];
      const locked = this.isLocked(eid);
      const visited = this.hasBeenVisited(eid);
      const doorEid = this.getDoorEntityId(eid);

      console.log(`  Building ${i + 1}: ${name} (eid: ${eid})`);
      console.log(`    Position: (${x.toFixed(1)}, ${y.toFixed(1)})`);
      console.log(`    Size: ${width}x${height}`);
      console.log(`    Locked: ${locked}, Visited: ${visited}`);
      console.log(`    Door Entity: ${doorEid || 'none'}`);
    }

    console.log('='.repeat(50) + '\n');
  }
}

