/**
 * Registry for mapping entity sprite IDs to actual Phaser game objects
 * This keeps Phaser objects separate from ECS data for better performance
 */

type PhaserObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.Tilemaps.TilemapLayer;

class SpriteRegistryClass {
  private spriteMap: Map<number, PhaserObject> = new Map();
  private nextId: number = 1;

  /**
   * Registers a Phaser object and returns its ID
   * @param sprite - The Phaser sprite or tilemap layer to register
   * @returns The assigned sprite ID
   */
  register(sprite: PhaserObject): number {
    const id = this.nextId++;
    this.spriteMap.set(id, sprite);
    return id;
  }

  /**
   * Gets a Phaser object by its ID
   * @param id - The sprite ID
   * @returns The Phaser object or undefined if not found
   */
  get(id: number): PhaserObject | undefined {
    return this.spriteMap.get(id);
  }

  /**
   * Unregisters a sprite by its ID
   * @param id - The sprite ID to unregister
   * @returns True if the sprite was found and removed
   */
  unregister(id: number): boolean {
    return this.spriteMap.delete(id);
  }

  /**
   * Clears all registered sprites
   */
  clear(): void {
    this.spriteMap.clear();
    this.nextId = 1;
  }

  /**
   * Gets the total number of registered sprites
   * @returns The count of registered sprites
   */
  get size(): number {
    return this.spriteMap.size;
  }
}

/**
 * Global sprite registry instance
 */
export const SpriteRegistry = new SpriteRegistryClass();

