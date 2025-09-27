import { Scene } from 'phaser';

/**
 * Manages character sprites and animations in the game
 */
export class CharacterManager {
  private scene: Scene;
  private characters: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }


  /**
   * Creates a character sprite at the specified position
   * @param id Unique identifier for the character
   * @param x X position
   * @param y Y position
   * @param facingDirection Initial facing direction
   * @param scale Character scale (default: 2 for 16x16 sprites)
   * @returns The created character sprite
   */
  createCharacter(
    id: string,
    x: number,
    y: number,
    facingDirection: 'up' | 'down' | 'left' | 'right' = 'down',
    scale: number = 2
  ): Phaser.GameObjects.Sprite {
    // Create the sprite
    const character = this.scene.add.sprite(x, y, 'character_idle');
    character.setScale(scale);
    character.setOrigin(0.5, 0.5);

    // Set initial animation based on facing direction
    this.setCharacterFacing(character, facingDirection);

    // Store the character
    this.characters.set(id, character);

    return character;
  }

  /**
   * Sets the character's facing direction and plays appropriate animation
   * @param character The character sprite
   * @param direction The facing direction
   * @param animationType The type of animation (default: 'idle')
   */
  setCharacterFacing(
    character: Phaser.GameObjects.Sprite,
    direction: 'up' | 'down' | 'left' | 'right',
    animationType: string = 'idle'
  ): void {
    const animationKey = `character_${animationType}_${direction}`;

    if (this.scene.anims.exists(animationKey)) {
      character.play(animationKey);
      character.setFlipX(false);
    } else if (direction === 'left' && this.scene.anims.exists(`character_${animationType}_right`)) {
      // Mirror the right-facing animation for left
      character.play(`character_${animationType}_right`);
      character.setFlipX(true);
    } else {
      console.warn(`Animation not found for ${animationKey}`);
      // Fallback to first available frame
      character.setFrame(0);
    }
  }

  /**
   * Gets a character by ID
   * @param id Character ID
   * @returns The character sprite or undefined
   */
  getCharacter(id: string): Phaser.GameObjects.Sprite | undefined {
    return this.characters.get(id);
  }

  /**
   * Removes a character from the scene
   * @param id Character ID
   */
  removeCharacter(id: string): void {
    const character = this.characters.get(id);
    if (character) {
      character.destroy();
      this.characters.delete(id);
    }
  }

  /**
   * Updates all characters (useful for AI, movement, etc.)
   * @param _time Current time
   * @param _delta Time delta
   */
  update(_time: number, _delta: number): void {
    // Update logic for all characters can go here
    // For example: AI behavior, movement, state changes
  }

  /**
   * Destroys all characters and cleans up
   */
  destroy(): void {
    this.characters.forEach(character => character.destroy());
    this.characters.clear();
  }
}
