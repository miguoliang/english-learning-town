import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Builder class responsible for creating school-specific interior elements
 */
export class SchoolElementsBuilder {
  private scene: Scene;
  private obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Scene, obstacles: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.obstacles = obstacles;
  }

  /**
   * Creates all school classroom elements
   */
  createSchoolElements(): void {
    this.createBlackboard();
    this.createStudentDesks();
    this.createTeacherDesk();
  }

  /**
   * Creates the classroom blackboard
   */
  private createBlackboard(): void {
    this.createRoomElement(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.26,
      GameConfig.screenWidth * 0.3,
      GameConfig.screenHeight * 0.13,
      0x2f4f2f
    );

    this.scene.add
      .text(
        GameConfig.UI.centerX,
        GameConfig.screenHeight * 0.26,
        'Welcome to English Class!\n🅰️ Grammar Lessons 🅱️ Reading',
        {
          fontFamily: 'Arial',
          fontSize: Math.min(GameConfig.screenWidth / 40, 18),
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Creates rows of student desks and chairs
   */
  private createStudentDesks(): void {
    const deskConfig = {
      rows: 3,
      columns: 4,
      startX: GameConfig.screenWidth * 0.2,
      startY: GameConfig.screenHeight * 0.42,
      spacingX: GameConfig.screenWidth * 0.15,
      spacingY: GameConfig.screenHeight * 0.1,
      deskSize: {
        width: GameConfig.screenWidth * 0.06,
        height: GameConfig.screenHeight * 0.05,
      },
      chairSize: {
        width: GameConfig.screenWidth * 0.04,
        height: GameConfig.screenHeight * 0.025,
      },
      chairOffset: GameConfig.screenHeight * 0.04,
    };

    for (let row = 0; row < deskConfig.rows; row++) {
      for (let col = 0; col < deskConfig.columns; col++) {
        const x = deskConfig.startX + col * deskConfig.spacingX;
        const y = deskConfig.startY + row * deskConfig.spacingY;

        // Create desk
        this.createRoomElement(
          x,
          y,
          deskConfig.deskSize.width,
          deskConfig.deskSize.height,
          GameConfig.COLORS.brownWall
        );

        // Create chair
        this.createRoomElement(
          x,
          y + deskConfig.chairOffset,
          deskConfig.chairSize.width,
          deskConfig.chairSize.height,
          GameConfig.COLORS.darkBrown
        );
      }
    }
  }

  /**
   * Creates the teacher's desk with teacher icon
   */
  private createTeacherDesk(): void {
    this.createRoomElement(
      GameConfig.UI.centerX,
      GameConfig.screenHeight * 0.36,
      GameConfig.screenWidth * 0.1,
      GameConfig.screenHeight * 0.08,
      GameConfig.COLORS.brownWall
    );

    this.scene.add
      .image(GameConfig.UI.centerX, GameConfig.screenHeight * 0.36, 'character_teacher')
      .setScale(0.5)
      .setOrigin(0.5);
  }

  /**
   * Helper method to create room elements with collision
   */
  private createRoomElement(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): Phaser.GameObjects.Rectangle {
    const element = this.scene.add.rectangle(x, y, width, height, color);
    this.obstacles.add(element);
    return element;
  }
}
