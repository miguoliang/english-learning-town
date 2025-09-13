import { Scene } from 'phaser';
import { GameConfig, type NPCConfigType } from '../config/GameConfig';

/**
 * Manager class responsible for creating and managing NPCs in the town
 */
export class NPCManager {
  private scene: Scene;
  private npcs: {
    teacher: Phaser.GameObjects.Image | null;
    librarian: Phaser.GameObjects.Image | null;
    shopkeeper: Phaser.GameObjects.Image | null;
  } = {
    teacher: null,
    librarian: null,
    shopkeeper: null,
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Creates all NPCs in the town
   * @returns Object containing all created NPCs
   */
  createNPCs(): typeof this.npcs {
    this.createMainNPCs();
    this.createBackgroundCharacters();
    this.setupNPCInteractions();

    return this.npcs;
  }

  /**
   * Creates the main interactive NPCs
   */
  private createMainNPCs(): void {
    // Teacher NPC
    this.npcs.teacher = this.createNPC(
      GameConfig.NPCS.TEACHER.x,
      GameConfig.NPCS.TEACHER.y,
      'character_teacher',
      GameConfig.NPCS.TEACHER.name
    );

    // Librarian NPC
    this.npcs.librarian = this.createNPC(
      GameConfig.NPCS.LIBRARIAN.x,
      GameConfig.NPCS.LIBRARIAN.y,
      'character_librarian',
      GameConfig.NPCS.LIBRARIAN.name
    );

    // Add book in librarian's hands
    this.scene.add
      .image(GameConfig.NPCS.LIBRARIAN.x, GameConfig.NPCS.LIBRARIAN.y - 40, 'item_book')
      .setScale(0.8)
      .setOrigin(0.5);

    // Shopkeeper NPC
    this.npcs.shopkeeper = this.createNPC(
      GameConfig.NPCS.SHOPKEEPER.x,
      GameConfig.NPCS.SHOPKEEPER.y,
      'character_shopkeeper',
      GameConfig.NPCS.SHOPKEEPER.name
    );

    // Add boxes near shopkeeper
    this.scene.add
      .image(GameConfig.NPCS.SHOPKEEPER.x - 30, GameConfig.NPCS.SHOPKEEPER.y + 30, 'item_box')
      .setScale(0.7)
      .setOrigin(0.5);
    this.scene.add
      .image(GameConfig.NPCS.SHOPKEEPER.x + 30, GameConfig.NPCS.SHOPKEEPER.y + 30, 'item_box')
      .setScale(0.7)
      .setOrigin(0.5);
  }

  /**
   * Creates a single NPC with sprite and name label
   * @param x X position
   * @param y Y position
   * @param spriteKey Sprite texture key
   * @param name NPC name
   * @returns The created NPC image
   */
  private createNPC(
    x: number,
    y: number,
    spriteKey: string,
    name: string
  ): Phaser.GameObjects.Image {
    // Create character sprite
    const npc = this.scene.add.image(x, y, spriteKey);
    npc.setScale(0.8);

    // Add name label
    this.scene.add.text(x, y + 45, name, GameConfig.textStyles.npcName).setOrigin(0.5);

    return npc;
  }

  /**
   * Creates background/atmosphere characters
   */
  private createBackgroundCharacters(): void {
    // Cafe customer - positioned relative to cafe
    const cafeCustomerX = GameConfig.BUILDINGS.CAFE.x + 70;
    const cafeCustomerY = GameConfig.BUILDINGS.CAFE.y - 30;
    this.scene.add
      .image(cafeCustomerX, cafeCustomerY, 'character_customer')
      .setScale(0.6)
      .setOrigin(0.5);
    this.scene.add
      .text(cafeCustomerX, cafeCustomerY + 35, 'Customer', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
        color: GameConfig.COLORS.textDarkGreen,
        align: 'center',
      })
      .setOrigin(0.5);

    // Person walking near fountain
    const walkerX = GameConfig.UI.centerX + GameConfig.screenWidth * 0.08;
    const walkerY = GameConfig.screenHeight * 0.47;
    this.scene.add.image(walkerX, walkerY, 'character_walker').setScale(0.6).setOrigin(0.5);
    this.scene.add
      .text(walkerX, walkerY + 35, 'Walker', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 60, 12),
        color: GameConfig.COLORS.textDarkGreen,
        align: 'center',
      })
      .setOrigin(0.5);

    // Child playing near school
    const studentX = GameConfig.BUILDINGS.SCHOOL.x - 50;
    const studentY = GameConfig.BUILDINGS.SCHOOL.y + 50;
    this.scene.add.image(studentX, studentY, 'character_student').setScale(0.5).setOrigin(0.5);
    this.scene.add
      .text(studentX, studentY + 30, 'Student', {
        fontFamily: 'Arial',
        fontSize: Math.min(GameConfig.screenWidth / 70, 10),
        color: GameConfig.COLORS.textDarkGreen,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * Sets up NPC interactions (hover effects)
   */
  private setupNPCInteractions(): void {
    const npcs = [this.npcs.teacher, this.npcs.librarian, this.npcs.shopkeeper];

    npcs.forEach(npc => {
      if (npc) {
        npc.setInteractive();
        npc.on('pointerover', () => {
          npc.setAlpha(0.8);
          this.scene.input.setDefaultCursor('pointer');
        });
        npc.on('pointerout', () => {
          npc.setAlpha(1);
          this.scene.input.setDefaultCursor('default');
        });
      }
    });
  }

  /**
   * Gets all interactive NPCs as an array for collision detection
   */
  getNPCsArray(): (Phaser.GameObjects.Image | null)[] {
    return [this.npcs.teacher, this.npcs.librarian, this.npcs.shopkeeper];
  }

  /**
   * Gets specific NPC by type
   */
  getNPC(type: keyof typeof this.npcs): Phaser.GameObjects.Image | null {
    return this.npcs[type];
  }

  /**
   * Gets NPC data by type
   * @param type The NPC type (e.g., 'teacher', 'librarian', 'shopkeeper')
   * @returns NPC configuration data or null if not found
   */
  getNPCData(type: string): NPCConfigType | null {
    const npcKey = type.toUpperCase() as keyof typeof GameConfig.NPCS;
    return GameConfig.NPCS[npcKey] ?? null;
  }

  /**
   * Gets all NPC objects
   */
  getAllNPCs(): typeof this.npcs {
    return this.npcs;
  }
}
