import { Scene } from 'phaser';
import { GameConfig, type NPCConfigType } from '../config/GameConfig';

/**
 * Manager class responsible for creating and managing NPCs in the town
 */
export class NPCManager {
  private scene: Scene;
  private npcs: {
    teacher: Phaser.GameObjects.Arc | null;
    librarian: Phaser.GameObjects.Arc | null;
    shopkeeper: Phaser.GameObjects.Arc | null;
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
      GameConfig.NPCS.TEACHER.radius,
      GameConfig.NPCS.TEACHER.color,
      GameConfig.NPCS.TEACHER.emoji,
      GameConfig.NPCS.TEACHER.name
    );

    // Librarian NPC
    this.npcs.librarian = this.createNPC(
      GameConfig.NPCS.LIBRARIAN.x,
      GameConfig.NPCS.LIBRARIAN.y,
      GameConfig.NPCS.LIBRARIAN.radius,
      GameConfig.NPCS.LIBRARIAN.color,
      GameConfig.NPCS.LIBRARIAN.emoji,
      GameConfig.NPCS.LIBRARIAN.name
    );

    // Add book in librarian's hands
    this.scene.add
      .text(GameConfig.NPCS.LIBRARIAN.x, GameConfig.NPCS.LIBRARIAN.y - 30, '📖', {
        fontFamily: 'Arial',
        fontSize: 16,
      })
      .setOrigin(0.5);

    // Shopkeeper NPC
    this.npcs.shopkeeper = this.createNPC(
      GameConfig.NPCS.SHOPKEEPER.x,
      GameConfig.NPCS.SHOPKEEPER.y,
      GameConfig.NPCS.SHOPKEEPER.radius,
      GameConfig.NPCS.SHOPKEEPER.color,
      GameConfig.NPCS.SHOPKEEPER.emoji,
      GameConfig.NPCS.SHOPKEEPER.name
    );

    // Add boxes near shopkeeper
    this.scene.add
      .text(GameConfig.NPCS.SHOPKEEPER.x - 30, GameConfig.NPCS.SHOPKEEPER.y + 20, '📦', {
        fontFamily: 'Arial',
        fontSize: 16,
      })
      .setOrigin(0.5);
    this.scene.add
      .text(GameConfig.NPCS.SHOPKEEPER.x + 30, GameConfig.NPCS.SHOPKEEPER.y + 20, '📦', {
        fontFamily: 'Arial',
        fontSize: 16,
      })
      .setOrigin(0.5);
  }

  /**
   * Creates a single NPC with emoji and name label
   * @param x X position
   * @param y Y position
   * @param radius Circle radius
   * @param color Circle color
   * @param emoji Emoji character
   * @param name NPC name
   * @returns The created NPC arc
   */
  private createNPC(
    x: number,
    y: number,
    radius: number,
    color: number,
    emoji: string,
    name: string
  ): Phaser.GameObjects.Arc {
    // Create circular background
    const npc = this.scene.add.arc(x, y, radius, 0, 360, false, color);

    // Add emoji
    this.scene.add
      .text(x, y, emoji, {
        fontFamily: 'Arial',
        fontSize: 24,
      })
      .setOrigin(0.5);

    // Add name label
    this.scene.add.text(x, y + 35, name, GameConfig.textStyles.npcName).setOrigin(0.5);

    return npc;
  }

  /**
   * Creates background/atmosphere characters
   */
  private createBackgroundCharacters(): void {
    // Cafe customer
    this.scene.add.arc(370, 470, 20, 0, 360, false, 0xffd700);
    this.scene.add
      .text(370, 470, '👨‍🦱', {
        fontFamily: 'Arial',
        fontSize: 20,
      })
      .setOrigin(0.5);
    this.scene.add
      .text(370, 500, 'Customer', {
        fontFamily: 'Arial',
        fontSize: 12,
        color: GameConfig.COLORS.textDarkGreen,
        align: 'center',
      })
      .setOrigin(0.5);

    // Person walking near fountain
    this.scene.add.arc(580, 360, 20, 0, 360, false, 0x98fb98);
    this.scene.add
      .text(580, 360, '👩‍🦰', {
        fontFamily: 'Arial',
        fontSize: 20,
      })
      .setOrigin(0.5);
    this.scene.add
      .text(580, 390, 'Walker', {
        fontFamily: 'Arial',
        fontSize: 12,
        color: GameConfig.COLORS.textDarkGreen,
        align: 'center',
      })
      .setOrigin(0.5);

    // Child playing near school
    this.scene.add.arc(150, 200, 15, 0, 360, false, 0xffb6c1);
    this.scene.add
      .text(150, 200, '🧒', {
        fontFamily: 'Arial',
        fontSize: 18,
      })
      .setOrigin(0.5);
    this.scene.add
      .text(150, 225, 'Student', {
        fontFamily: 'Arial',
        fontSize: 10,
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
  getNPCsArray(): (Phaser.GameObjects.Arc | null)[] {
    return [this.npcs.teacher, this.npcs.librarian, this.npcs.shopkeeper];
  }

  /**
   * Gets specific NPC by type
   */
  getNPC(type: keyof typeof this.npcs): Phaser.GameObjects.Arc | null {
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
