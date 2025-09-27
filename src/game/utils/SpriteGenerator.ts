/**
 * Creates a simple character sprite programmatically using Phaser graphics
 * @param scene - The Phaser scene instance
 * @param width - Sprite width in pixels
 * @param height - Sprite height in pixels
 * @param character - Character configuration object
 * @returns The generated sprite texture key
 */
export function createCharacterSprite(
  scene: Phaser.Scene,
  width: number,
  height: number,
  character: {
    name: string;
    skinColor: number;
    hairColor: number;
    shirtColor: number;
    hasGlasses?: boolean;
    hasHat?: boolean;
    accessoryColor?: number;
  }
): string {
  const textureKey = `character_${character.name}`;

  // Check if texture already exists
  if (scene.textures.exists(textureKey)) {
    return textureKey;
  }

  // Create graphics object for drawing
  const graphics = scene.add.graphics();

  // Head (circle)
  graphics.fillStyle(character.skinColor);
  graphics.fillCircle(width / 2, height * 0.3, width * 0.25);

  // Hair
  graphics.fillStyle(character.hairColor);
  graphics.fillCircle(width / 2, height * 0.22, width * 0.28);

  // Body (rectangle)
  graphics.fillStyle(character.shirtColor);
  graphics.fillRect(width * 0.3, height * 0.45, width * 0.4, height * 0.4);

  // Arms
  graphics.fillRect(width * 0.15, height * 0.5, width * 0.15, width * 0.08);
  graphics.fillRect(width * 0.7, height * 0.5, width * 0.15, width * 0.08);

  // Legs
  graphics.fillStyle(0x000080); // Dark blue pants
  graphics.fillRect(width * 0.35, height * 0.85, width * 0.12, height * 0.15);
  graphics.fillRect(width * 0.53, height * 0.85, width * 0.12, height * 0.15);

  // Accessories
  if (character.hasGlasses) {
    graphics.lineStyle(2, 0x000000);
    graphics.strokeCircle(width * 0.42, height * 0.28, width * 0.08);
    graphics.strokeCircle(width * 0.58, height * 0.28, width * 0.08);
    graphics.lineBetween(width * 0.5, height * 0.28, width * 0.5, height * 0.28);
  }

  if (character.hasHat && character.accessoryColor) {
    graphics.fillStyle(character.accessoryColor);
    graphics.fillCircle(width / 2, height * 0.18, width * 0.32);
  }

  // Generate texture from graphics
  graphics.generateTexture(textureKey, width, height);
  graphics.destroy();

  return textureKey;
}

/**
 * Creates item sprites programmatically using Phaser graphics
 * @param scene - The Phaser scene instance
 * @param width - Sprite width in pixels
 * @param height - Sprite height in pixels
 * @param item - Item configuration object
 * @returns The generated sprite texture key
 */
export function createItemSprite(
  scene: Phaser.Scene,
  width: number,
  height: number,
  item: {
    name: string;
    primaryColor: number;
    secondaryColor?: number;
    shape: 'rectangle' | 'circle' | 'book' | 'cup';
  }
): string {
  const textureKey = `item_${item.name}`;

  if (scene.textures.exists(textureKey)) {
    return textureKey;
  }

  const graphics = scene.add.graphics();

  switch (item.shape) {
    case 'book':
      // Book spine
      graphics.fillStyle(item.primaryColor);
      graphics.fillRect(width * 0.2, height * 0.1, width * 0.6, height * 0.8);
      // Book pages
      graphics.fillStyle(0xffffff);
      graphics.fillRect(width * 0.25, height * 0.15, width * 0.5, height * 0.7);
      break;

    case 'cup':
      // Cup body
      graphics.fillStyle(item.primaryColor);
      graphics.fillRect(width * 0.3, height * 0.4, width * 0.4, height * 0.5);
      // Handle
      graphics.lineStyle(4, item.primaryColor);
      graphics.strokeCircle(width * 0.75, height * 0.6, width * 0.15);
      // Steam
      if (item.secondaryColor) {
        graphics.fillStyle(item.secondaryColor);
        graphics.fillCircle(width * 0.4, height * 0.25, width * 0.05);
        graphics.fillCircle(width * 0.5, height * 0.2, width * 0.04);
        graphics.fillCircle(width * 0.6, height * 0.25, width * 0.05);
      }
      break;

    case 'circle':
      graphics.fillStyle(item.primaryColor);
      graphics.fillCircle(width / 2, height / 2, Math.min(width, height) * 0.4);
      break;

    case 'rectangle':
    default:
      graphics.fillStyle(item.primaryColor);
      graphics.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6);
      if (item.secondaryColor) {
        graphics.fillStyle(item.secondaryColor);
        graphics.fillRect(width * 0.25, height * 0.25, width * 0.5, height * 0.5);
      }
      break;
  }

  graphics.generateTexture(textureKey, width, height);
  graphics.destroy();

  return textureKey;
}

/**
 * Initializes all character and item sprites for the game
 * Creates all necessary sprite textures that will be used throughout the game
 * @param scene - The Phaser scene instance where sprites will be generated
 */
export function initializeAllSprites(scene: Phaser.Scene): void {
  const SPRITE_SIZE = 64;
  const ITEM_SIZE = 32;

  // Create character sprites
  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'player',
    skinColor: 0xfdbcb4,
    hairColor: 0x8b4513,
    shirtColor: 0x4169e1,
  });

  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'teacher',
    skinColor: 0xfdbcb4,
    hairColor: 0x654321,
    shirtColor: 0x800080,
    hasGlasses: true,
  });

  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'librarian',
    skinColor: 0xfdbcb4,
    hairColor: 0x2f4f4f,
    shirtColor: 0x228b22,
    hasGlasses: true,
  });

  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'shopkeeper',
    skinColor: 0xfdbcb4,
    hairColor: 0x8b4513,
    shirtColor: 0xff6347,
    hasHat: true,
    accessoryColor: 0x000080,
  });

  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'student',
    skinColor: 0xfdbcb4,
    hairColor: 0xdaa520,
    shirtColor: 0x00ced1,
  });

  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'customer',
    skinColor: 0xfdbcb4,
    hairColor: 0x8b0000,
    shirtColor: 0x9370db,
  });

  createCharacterSprite(scene, SPRITE_SIZE, SPRITE_SIZE, {
    name: 'walker',
    skinColor: 0xfdbcb4,
    hairColor: 0xff4500,
    shirtColor: 0x20b2aa,
  });

  // Create item sprites
  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'book',
    primaryColor: 0x8b4513,
    shape: 'book',
  });

  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'coffee',
    primaryColor: 0x8b4513,
    secondaryColor: 0xd3d3d3,
    shape: 'cup',
  });

  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'box',
    primaryColor: 0xd2691e,
    secondaryColor: 0x8b4513,
    shape: 'rectangle',
  });

  // Additional item sprites for interior scenes
  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'plant',
    primaryColor: 0x228b22,
    secondaryColor: 0x8b4513,
    shape: 'circle',
  });

  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'art',
    primaryColor: 0xffd700,
    secondaryColor: 0x8b4513,
    shape: 'rectangle',
  });

  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'computer',
    primaryColor: 0x000000,
    secondaryColor: 0x808080,
    shape: 'rectangle',
  });

  createItemSprite(scene, ITEM_SIZE, ITEM_SIZE, {
    name: 'cash',
    primaryColor: 0xffd700,
    secondaryColor: 0x32cd32,
    shape: 'rectangle',
  });
}
